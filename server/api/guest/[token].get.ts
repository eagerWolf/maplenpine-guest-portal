import { getDb, today } from '../../db/index'
import type { Reservation, GuestToken } from '../../db/index'
import { getSettings } from '../../utils/jobs'
import { guestDetailsVisibility } from '../../utils/guestVisibility'
import { isAdminGuestPreview } from '../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }

  const db = getDb()
  const adminPreview = await isAdminGuestPreview(event)

  const guestToken = db.prepare(
    'SELECT * FROM guest_tokens WHERE token = ?',
  ).get(token) as GuestToken | undefined

  if (!guestToken) {
    throw createError({ statusCode: 404, statusMessage: 'Dostop ni najden' })
  }

  if (!adminPreview && new Date(guestToken.expires_at) < new Date()) {
    throw createError({ statusCode: 410, statusMessage: 'Vaš dostop je potekel' })
  }

  const reservation = db.prepare(
    'SELECT * FROM reservations WHERE id = ?',
  ).get(guestToken.reservation_id) as Reservation | undefined

  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }
  if (!adminPreview && reservation.status === 'cancelled') {
    throw createError({ statusCode: 410, statusMessage: 'Rezervacija je preklicana' })
  }
  if (!adminPreview && reservation.check_out < today()) {
    throw createError({ statusCode: 410, statusMessage: 'Dostop po odjavi ni več mogoč' })
  }

  const settings = getSettings()
  const checkinTime = settings.bentral_checkin_time || '15:00'
  const checkoutTime = settings.bentral_checkout_time || '11:00'

  const visibility = guestDetailsVisibility(reservation.access_valid_from || `${reservation.check_in} ${checkinTime}`)

  return {
    ...visibility,
    adminPreview: adminPreview && (new Date(guestToken.expires_at) < new Date() || reservation.check_out < today()),
    name: `${reservation.first_name} ${reservation.last_name}`,
    door: reservation.door,
    pin: visibility.detailsAvailable ? reservation.pin : null,
    accessValidFrom: reservation.access_valid_from,
    accessValidUntil: reservation.access_valid_until,
    status: reservation.status,
    checkIn: `${reservation.check_in} ${checkinTime}`,
    checkOut: `${reservation.check_out} ${checkoutTime}`,
    guestCount: reservation.guest_count,
    lang: reservation.guest_lang_override || reservation.guest_lang || null,
    contactPhone: visibility.detailsAvailable ? settings.contact_phone || null : null,
    receptionPhone: visibility.detailsAvailable ? settings.reception_whatsapp || null : null,
    receptionWhatsapp: visibility.detailsAvailable ? settings.reception_whatsapp || null : null,
    propertyNavUrl: settings.property_nav_url || null,
  }
})
