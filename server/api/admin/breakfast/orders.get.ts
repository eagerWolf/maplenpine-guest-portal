import { getDb } from '../../../db/index'
import type { PartnerOrder } from '../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })

  const query = getQuery(event)
  const limit = Math.min(parseInt(String(query.limit ?? 50)), 100)
  const offset = parseInt(String(query.offset ?? 0))
  const status = query.status as string | undefined

  const db = getDb()

  const where = status ? 'WHERE status = ?' : ''
  const params: unknown[] = status ? [status, limit, offset] : [limit, offset]

  const orders = db.prepare(`
    SELECT b.*, r.first_name, r.last_name, r.guest_email,
           p.name AS partner_name, p.category AS partner_category
    FROM partner_orders b
    LEFT JOIN reservations r ON r.id = b.reservation_id
    LEFT JOIN partners p ON p.id = b.partner_id
    ${where}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params) as Array<PartnerOrder & { guest_email: string | null; partner_name: string | null; partner_category: string | null }>

  const total = (db.prepare(`SELECT COUNT(*) as n FROM partner_orders ${where}`)
    .get(...(status ? [status] : [])) as { n: number }).n

  return {
    orders: orders.map(o => ({
      id: o.id,
      reservationId: o.reservation_id,
      guestName: o.guest_name,
      guestPhone: o.guest_phone,
      guestEmail: o.guest_email,
      apartment: o.apartment,
      selectedDates: JSON.parse(o.selected_dates) as string[],
      deliverySlot: o.delivery_slot,
      breakfastCount: o.breakfast_count,
      vegetarianCount: o.vegetarian_count,
      glutenFreeCount: o.gluten_free_count,
      guestNotes: o.guest_notes,
      partnerProvisionPerUnit: o.partner_provision_per_unit,
      marginPerUnit: o.margin_per_unit,
      partnerName: o.partner_name,
      partnerCategory: o.partner_category,
      totalPrice: o.total_price,
      status: o.status,
      paymentProvider: o.payment_provider,
      paymentId: o.payment_id,
      paymentTransactionId: o.payment_transaction_id,
      paymentStatus: o.payment_status,
      refundStatus: o.refund_status,
      sentToPartnerAt: o.sent_to_partner_at,
      partnerConfirmedAt: o.partner_confirmed_at,
      partnerRejectedAt: o.partner_rejected_at,
      cancelledAt: o.cancelled_at,
      refundedAt: o.refunded_at,
      createdAt: o.created_at,
    })),
    total,
    limit,
    offset,
  }
})
