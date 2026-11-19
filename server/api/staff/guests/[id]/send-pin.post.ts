import { randomUUID } from 'node:crypto'
import { getDb, now, guestTokenExpiry } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'
import { enqueueIntegration } from '../../../../utils/integrationOutbox'

export default defineEventHandler(async event => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const db = getDb()
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(getRouterParam(event, 'id')) as Reservation | undefined
  if (!reservation) throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  if (!/^\d{4}$/.test(reservation.pin || '')) throw createError({ statusCode: 400, statusMessage: 'PIN ni dodeljen' })
  if (reservation.status !== 'active') throw createError({ statusCode: 400, statusMessage: 'Rezervacija ni aktivna' })
  if (new Date(guestTokenExpiry(reservation.check_out)).getTime() <= Date.now()) throw createError({ statusCode: 410, statusMessage: 'Dostop je potekel' })
  const requestId = randomUUID()
  db.transaction(() => {
    let access = db.prepare('SELECT token FROM guest_tokens WHERE reservation_id = ? AND expires_at > ? ORDER BY id DESC LIMIT 1').get(reservation.id, now()) as { token: string } | undefined
    if (!access) {
      access = { token: randomUUID() }
      db.prepare('INSERT INTO guest_tokens (reservation_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)').run(reservation.id, access.token, guestTokenExpiry(reservation.check_out), now())
    }
    const portalLink = `${String(useRuntimeConfig().public.baseUrl).replace(/\/$/, '')}/guest/${access.token}`
    enqueueIntegration(`manual:${requestId}:bentral`, 'bentral_ekey', { reservationId: reservation.id, pin: reservation.pin! })
    enqueueIntegration(`manual:${requestId}:guest-pin`, 'bentral_guest_message', { reservationId: reservation.id, pin: reservation.pin!, portalLink })
    db.prepare("INSERT INTO audit_log (user_id, user_email, action, detail, created_at) VALUES (?, ?, 'queue_pin_bentral', ?, ?)").run(session.user.id, session.user.email, JSON.stringify({ reservation_id: reservation.id }), now())
  })()
  return { ok: true, queued: true, message: 'PIN in sporočilo s povezavo sta dodana v vrsto za Bentral.' }
})
