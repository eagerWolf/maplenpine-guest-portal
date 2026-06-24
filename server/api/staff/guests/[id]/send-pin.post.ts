import { getDb, now } from '../../../../db/index'
import type { Reservation, GuestToken } from '../../../../db/index'
import { sendBentralMessage, buildBentralPinMessage } from '../../../../utils/bentral'
import { getSettings, computeDisplayFrom, computeDisplayUntil } from '../../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const config = useRuntimeConfig()
  if (!config.bentralApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Bentral API ključ ni nastavljen' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }
  if (!reservation.pin) {
    throw createError({ statusCode: 400, statusMessage: 'PIN ni dodeljen' })
  }

  const tokenRow = db.prepare(
    'SELECT * FROM guest_tokens WHERE reservation_id = ? ORDER BY created_at DESC LIMIT 1',
  ).get(reservation.id) as GuestToken | undefined

  const portalLink = tokenRow
    ? `${config.public.baseUrl}/guest/${tokenRow.token}`
    : config.public.baseUrl

  const settings = getSettings()
  const message = buildBentralPinMessage(
    `${reservation.first_name} ${reservation.last_name}`,
    reservation.door,
    reservation.pin,
    portalLink,
    computeDisplayFrom(reservation, settings),
    computeDisplayUntil(reservation, settings),
  )

  await sendBentralMessage(config.bentralApiKey, reservation.bentral_reservation_id, message)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'send_pin_bentral', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({
      reservation_id: reservation.id,
      name: `${reservation.first_name} ${reservation.last_name}`,
      bentral_id: reservation.bentral_reservation_id,
    }),
    now(),
  )

  return { ok: true }
})