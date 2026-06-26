import { getDb } from '../../../db/index'
import type { PartnerOrder } from '../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Manjka token' })

  const db = getDb()
  const order = db.prepare(
    'SELECT * FROM partner_orders WHERE partner_confirmation_token = ?',
  ).get(token) as PartnerOrder | undefined

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Naročilo ni najdeno' })

  // Partner can only act on sent/confirmed/rejected — not on cancelled/refunded
  const actionable = ['sent_to_partner', 'confirmed_by_partner', 'rejected_by_partner'].includes(order.status)

  return {
    id: order.id,
    apartment: order.apartment,
    guestName: order.guest_name,
    guestPhone: order.guest_phone,
    selectedDates: JSON.parse(order.selected_dates) as string[],
    deliverySlot: order.delivery_slot,
    breakfastCount: order.breakfast_count,
    vegetarianCount: order.vegetarian_count,
    glutenFreeCount: order.gluten_free_count,
    guestNotes: order.guest_notes,
    totalPrice: order.total_price,
    status: order.status,
    actionable,
    confirmedAt: order.partner_confirmed_at,
    rejectedAt: order.partner_rejected_at,
    createdAt: order.created_at,
  }
})
