import { randomUUID } from 'crypto'
import { getDb, now, guestTokenExpiry } from '../../../../db/index'
import type { Reservation, GuestToken } from '../../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }

  // This opens the exact same link a guest would get — if the reservation has already
  // checked out, it shows the same "access ended" screen for staff too, by design.
  const existing = db.prepare(
    'SELECT * FROM guest_tokens WHERE reservation_id = ? ORDER BY id DESC LIMIT 1',
  ).get(reservation.id) as GuestToken | undefined

  let token = existing?.token
  if (!token || new Date(existing!.expires_at) < new Date()) {
    token = randomUUID()
    const expiresAt = guestTokenExpiry(reservation.check_out)
    db.prepare('INSERT INTO guest_tokens (reservation_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)')
      .run(reservation.id, token, expiresAt, now())
  }

  const origin = getRequestURL(event).origin
  return { url: `${origin}/guest/${token}` }
})
