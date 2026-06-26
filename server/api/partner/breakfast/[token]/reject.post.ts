import { getDb, now } from '../../../../db/index'
import { processRefund } from '../../../../utils/breakfast'
import type { PartnerOrder } from '../../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Manjka token' })

  const db = getDb()
  const order = db.prepare(
    'SELECT * FROM partner_orders WHERE partner_confirmation_token = ?',
  ).get(token) as PartnerOrder | undefined

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Naročilo ni najdeno' })

  if (!['sent_to_partner'].includes(order.status)) {
    throw createError({ statusCode: 409, statusMessage: 'Naročilo ni v stanju za zavrnitev' })
  }

  const ts = now()
  db.prepare(
    'UPDATE partner_orders SET status = ?, partner_rejected_at = ?, updated_at = ? WHERE id = ?',
  ).run('rejected_by_partner', ts, ts, order.id)

  // Refund payment
  let refundError: string | null = null
  try {
    await processRefund(order.id, 'Partner zavrnil naročilo')
    db.prepare(
      'UPDATE partner_orders SET status = ?, updated_at = ? WHERE id = ?',
    ).run('refunded', now(), order.id)
  } catch (err: any) {
    refundError = err.message
    console.error('[partner:reject] Refund failed:', err)
  }

  return { success: true, refundError }
})
