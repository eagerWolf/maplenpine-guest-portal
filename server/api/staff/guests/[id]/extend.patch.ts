import { getDb, now } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'
import { buildJobPayload, createJob } from '../../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const { accessValidUntil: rawUntil } = await readBody<{ accessValidUntil: string }>(event)

  // Normalise datetime-local (2026-06-25T13:00) → "2026-06-25 13:00"
  const accessValidUntil = (rawUntil ?? '').replace('T', ' ').trim()
  if (!accessValidUntil || !/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(accessValidUntil)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven format datuma' })
  }

  const db = getDb()
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined

  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }
  if (reservation.status === 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Rezervacija je preklicana' })
  }

  db.prepare(`
    UPDATE reservations SET access_valid_until = ?, updated_at = ? WHERE id = ?
  `).run(accessValidUntil, now(), reservation.id)

  const updated = { ...reservation, access_valid_until: accessValidUntil }
  const payload = buildJobPayload(updated, 'update')
  const triggeredBy = `staff:${session.user.email}`
  createJob(reservation.id, 'update', payload, triggeredBy)

  // Audit log
  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'extend_access', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ reservation_id: reservation.id, name: `${reservation.first_name} ${reservation.last_name}`, newUntil: accessValidUntil }),
    now(),
  )

  return { success: true, accessValidUntil }
})
