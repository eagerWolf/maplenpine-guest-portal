import { getDb, today } from '../../db/index'
import type { Reservation, GuestToken } from '../../db/index'
import { getSettings } from '../../utils/jobs'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }

  const db = getDb()

  const guestToken = db.prepare(
    'SELECT * FROM guest_tokens WHERE token = ?',
  ).get(token) as GuestToken | undefined

  if (!guestToken) {
    throw createError({ statusCode: 404, statusMessage: 'Dostop ni najden' })
  }

  if (new Date(guestToken.expires_at) < new Date()) {
    throw createError({ statusCode: 410, statusMessage: 'Vaš dostop je potekel' })
  }

  const reservation = db.prepare(
    'SELECT * FROM reservations WHERE id = ?',
  ).get(guestToken.reservation_id) as Reservation | undefined

  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }
  if (reservation.check_out < today()) {
    throw createError({ statusCode: 410, statusMessage: 'Dostop po odjavi ni več mogoč' })
  }

  const settings = getSettings()
  const checkinTime = settings.bentral_checkin_time || '15:00'
  const checkoutTime = settings.bentral_checkout_time || '11:00'

  return {
    name: `${reservation.first_name} ${reservation.last_name}`,
    door: reservation.door,
    pin: reservation.pin,
    accessValidFrom: reservation.access_valid_from,
    accessValidUntil: reservation.access_valid_until,
    status: reservation.status,
    checkIn: `${reservation.check_in} ${checkinTime}`,
    checkOut: `${reservation.check_out} ${checkoutTime}`,
    guestCount: reservation.guest_count,
    lang: reservation.guest_lang || null,
    contactPhone: settings.contact_phone || null,
    propertyNavUrl: settings.property_nav_url || null,
  }
})
