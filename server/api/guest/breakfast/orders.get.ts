import { getDb } from '../../../db/index'
import { validateGuestToken } from '../../../utils/breakfast'
import type { PartnerOrder } from '../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Manjka token' })

  const { reservationId } = validateGuestToken(token)
  const db = getDb()

  const orders = db.prepare(`
    SELECT o.*, p.name AS partner_name
    FROM partner_orders o LEFT JOIN partners p ON p.id = o.partner_id
    WHERE o.reservation_id = ? ORDER BY o.created_at DESC
  `).all(reservationId) as Array<PartnerOrder & { partner_name: string | null }>

  return {
    orders: orders.map(o => ({
      id: o.id,
      providerName: o.partner_name,
      selectedDates: JSON.parse(o.selected_dates) as string[],
      deliverySlot: o.delivery_slot,
      breakfastCount: o.breakfast_count,
      vegetarianCount: o.vegetarian_count,
      glutenFreeCount: o.gluten_free_count,
      partnerProvisionPerUnit: o.partner_provision_per_unit,
      marginPerUnit: o.margin_per_unit,
      totalPrice: o.total_price,
      status: o.status,
      paymentId: o.payment_id,
      createdAt: o.created_at,
    })),
  }
})
