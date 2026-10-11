import { getDb, now } from '../../db/index'
import { sendBreakfastToPartner } from '../../utils/breakfast'
import type { PartnerOrder } from '../../utils/breakfast'
import { getPaymentProvider } from '../../utils/payment/index'

interface SumUpWebhookPayload {
  id: string
  checkout_reference: string
  status: string
  amount: number
  currency: string
  transactions?: Array<{
    id: string
    transaction_code: string
    status: string
    amount: number
  }>
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event) ?? ''

  // Validate signature if configured
  const signature = getHeader(event, 'x-payload-signature') ?? ''
  const provider = getPaymentProvider('sumup')
  if (!provider.validateWebhookSignature(rawBody, signature)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' })
  }

  let payload: SumUpWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  // Find order by checkout reference (format: "breakfast-{orderId}")
  const match = payload.checkout_reference?.match(/^breakfast-(\d+)$/)
  if (!match) {
    const ebikeMatch = payload.checkout_reference?.match(/^ebike-(\d+)$/)
    if (ebikeMatch) {
      const requestId = Number(ebikeMatch[1] ?? 0)
      const db = getDb()
      const request = db.prepare('SELECT id, payment_id, total_price, status FROM bike_requests WHERE id = ?').get(requestId) as { id: number; payment_id: string | null; total_price: number; status: string } | undefined
      if (!request || request.payment_id !== payload.id || payload.currency !== 'EUR' || Math.abs(Number(payload.amount) - request.total_price) > 0.001) {
        throw createError({ statusCode: 400, statusMessage: 'Webhook does not match the e-bike payment' })
      }
      const txCode = payload.transactions?.find(t => t.status === 'SUCCESSFUL')?.transaction_code ?? null
      if (payload.status === 'PAID') {
        db.prepare("UPDATE bike_requests SET status='paid',payment_transaction_id=?,paid_at=?,updated_at=? WHERE id=? AND status!='paid'").run(txCode, now(), now(), requestId)
      } else if (payload.status === 'FAILED') {
        db.prepare("UPDATE bike_requests SET status='payment_failed',updated_at=? WHERE id=? AND status NOT IN ('paid','payment_failed')").run(now(), requestId)
      }
    }
    return { ok: true }
  }

  const orderId = parseInt(match[1] ?? '0')
  const db = getDb()
  const order = db.prepare('SELECT * FROM partner_orders WHERE id = ?').get(orderId) as PartnerOrder | undefined

  if (!order) {
    console.warn(`[webhook:sumup] Order ${orderId} not found`)
    return { ok: true }
  }

  if (order.payment_id !== payload.id || payload.currency !== 'EUR' || Math.abs(Number(payload.amount) - order.total_price) > 0.001) {
    throw createError({ statusCode: 400, statusMessage: 'Webhook does not match the breakfast payment' })
  }

  const ts = now()

  if (payload.status === 'PAID') {
    const txCode = payload.transactions?.find(t => t.status === 'SUCCESSFUL')?.transaction_code ?? null

    const update = db.prepare(`
      UPDATE partner_orders
      SET status = 'paid', payment_status = 'PAID', payment_transaction_id = ?, updated_at = ?
      WHERE id = ? AND status != 'paid'
    `).run(txCode, ts, orderId)

    if (update.changes === 1) {
      try {
        await sendBreakfastToPartner(orderId)
      } catch (err) {
        console.error('[webhook:sumup] Failed to notify partner', err)
      }
    }
  } else if (payload.status === 'FAILED') {
    db.prepare(
      "UPDATE partner_orders SET status = ?, payment_status = ?, updated_at = ? WHERE id = ? AND status NOT IN ('paid','payment_failed')",
    ).run('payment_failed', 'FAILED', ts, orderId)
  }

  return { ok: true }
})
