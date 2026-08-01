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
      const txCode = payload.transactions?.find(t => t.status === 'SUCCESSFUL')?.transaction_code ?? null
      if (payload.status === 'PAID') {
        getDb().prepare("UPDATE bike_requests SET status='paid',payment_transaction_id=?,paid_at=?,updated_at=? WHERE id=?").run(txCode, now(), now(), requestId)
      } else if (payload.status === 'FAILED') {
        getDb().prepare("UPDATE bike_requests SET status='payment_failed',updated_at=? WHERE id=?").run(now(), requestId)
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

  const ts = now()

  if (payload.status === 'PAID') {
    const txCode = payload.transactions?.find(t => t.status === 'SUCCESSFUL')?.transaction_code ?? null

    db.prepare(`
      UPDATE partner_orders
      SET status = 'paid', payment_status = 'PAID', payment_transaction_id = ?, updated_at = ?
      WHERE id = ?
    `).run(txCode, ts, orderId)

    // Send WhatsApp to partner
    try {
      await sendBreakfastToPartner(orderId)
    } catch (err) {
      console.error('[webhook:sumup] Failed to notify partner', err)
    }
  } else if (payload.status === 'FAILED') {
    db.prepare(
      'UPDATE partner_orders SET status = ?, payment_status = ?, updated_at = ? WHERE id = ?',
    ).run('payment_failed', 'FAILED', ts, orderId)
  }

  return { ok: true }
})
