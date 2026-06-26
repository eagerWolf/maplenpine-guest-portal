import { getDb, now } from '../../../db/index'
import {
  getBreakfastSettings,
  computeAvailableDates,
  generateBreakfastToken,
  validateGuestToken,
} from '../../../utils/breakfast'
import { getPaymentProvider } from '../../../utils/payment/index'
import { useRuntimeConfig } from '#imports'

interface OrderBody {
  token: string
  selectedDates: string[]
  deliverySlot: string
  breakfastCount: number
  vegetarianCount: number
  glutenFreeCount: number
  guestPhone?: string
  guestNotes?: string
}

const VALID_SLOTS = ['08:00-09:00', '09:00-10:00', '10:00-11:00']

export default defineEventHandler(async (event) => {
  const body = await readBody<OrderBody>(event)
  const { token, selectedDates, deliverySlot, breakfastCount, vegetarianCount, glutenFreeCount } = body

  if (!token) throw createError({ statusCode: 400, statusMessage: 'Manjka token' })

  const { reservation, reservationId } = validateGuestToken(token)
  const settings = getBreakfastSettings()

  if (!settings.enabled) {
    throw createError({ statusCode: 403, statusMessage: 'Naročanje zajtrkov trenutno ni na voljo' })
  }

  // ── Validate inputs ──────────────────────────────────────────────────────────
  if (!Array.isArray(selectedDates) || selectedDates.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Izberite vsaj en datum' })
  }

  if (!VALID_SLOTS.includes(deliverySlot)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven termin dostave' })
  }

  const maxCount = reservation.guest_count ?? settings.maxCountFallback
  if (breakfastCount < settings.minCount || breakfastCount > maxCount) {
    throw createError({ statusCode: 400, statusMessage: `Število zajtrkov mora biti med ${settings.minCount} in ${maxCount}` })
  }

  if (vegetarianCount % 2 !== 0 || glutenFreeCount % 2 !== 0) {
    throw createError({ statusCode: 400, statusMessage: 'Posebne opcije morajo biti v sodih številih' })
  }

  if (vegetarianCount + glutenFreeCount > breakfastCount) {
    throw createError({ statusCode: 400, statusMessage: 'Posebne opcije ne smejo preseči skupnega števila zajtrkov' })
  }

  // Validate each date is available
  const availableDates = computeAvailableDates({
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    orderCutoffHour: settings.orderCutoffHour,
  })
  const availableSet = new Set(availableDates.filter(d => !d.disabled).map(d => d.date))

  for (const date of selectedDates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw createError({ statusCode: 400, statusMessage: `Neveljaven datum: ${date}` })
    }
    if (!availableSet.has(date)) {
      throw createError({ statusCode: 400, statusMessage: `Datum ${date} ni na voljo` })
    }
  }

  // ── Compute price ────────────────────────────────────────────────────────────
  const partnerCost = settings.partnerCost
  const margin = settings.margin
  const totalPrice = parseFloat((breakfastCount * selectedDates.length * (partnerCost + margin)).toFixed(2))

  const guestName = `${reservation.first_name} ${reservation.last_name}`
  const apartment = reservation.door
  const confirmationToken = generateBreakfastToken()
  const ts = now()
  const db = getDb()

  // ── Create order ─────────────────────────────────────────────────────────────
  const result = db.prepare(`
    INSERT INTO partner_orders (
      reservation_id, guest_token, guest_name, guest_phone, apartment,
      selected_dates, delivery_slot, breakfast_count, vegetarian_count, gluten_free_count,
      guest_notes, partner_provision_per_unit, margin_per_unit, total_price,
      status, payment_provider, partner_confirmation_token, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reservationId, token, guestName, body.guestPhone ?? null, apartment,
    JSON.stringify(selectedDates), deliverySlot, breakfastCount, vegetarianCount, glutenFreeCount,
    body.guestNotes ?? null, partnerCost, margin, totalPrice,
    'pending_payment', 'sumup', confirmationToken, ts, ts,
  )

  const orderId = result.lastInsertRowid as number

  // ── Create SumUp checkout ────────────────────────────────────────────────────
  const config = useRuntimeConfig()
  const baseUrl = (config.public.baseUrl as string) || 'http://localhost:3000'
  const returnUrl = `${baseUrl}/guest/${token}/breakfast?order=${orderId}`

  try {
    const provider = getPaymentProvider('sumup')
    const payment = await provider.createPayment({
      orderId,
      amount: totalPrice,
      currency: 'EUR',
      description: `Zajtrk ${apartment} – ${selectedDates.join(', ')}`,
      returnUrl,
    })

    db.prepare(
      'UPDATE partner_orders SET payment_id = ?, status = ?, updated_at = ? WHERE id = ?',
    ).run(payment.paymentId, 'pending_payment', now(), orderId)

    return { orderId, checkoutUrl: payment.checkoutUrl }
  } catch (err: any) {
    db.prepare(
      'UPDATE partner_orders SET status = ?, updated_at = ? WHERE id = ?',
    ).run('payment_failed', now(), orderId)
    throw createError({ statusCode: 502, statusMessage: `Napaka pri ustvarjanju plačila: ${err.message}` })
  }
})
