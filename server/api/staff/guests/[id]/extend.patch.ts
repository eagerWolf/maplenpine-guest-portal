import { getDb, now } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'
import { buildJobPayload, createJob } from '../../../../utils/jobs'

function normalise(raw: string | undefined): string | null {
  if (!raw) return null
  const v = raw.replace('T', ' ').trim()
  return /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(v) ? v : null
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody<{ accessValidFrom?: string; accessValidUntil?: string }>(event)

  const accessValidFrom = normalise(body.accessValidFrom)
  const accessValidUntil = normalise(body.accessValidUntil)

  if (!accessValidFrom && !accessValidUntil) {
    throw createError({ statusCode: 400, statusMessage: 'Ni podanih vrednosti za spremembo' })
  }

  const db = getDb()
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined

  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }
  if (reservation.status === 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Rezervacija je preklicana' })
  }

  // Build the partial update
  const updates: string[] = []
  const params: (string | number)[] = []

  if (accessValidFrom) { updates.push('access_valid_from = ?'); params.push(accessValidFrom) }
  if (accessValidUntil) { updates.push('access_valid_until = ?'); params.push(accessValidUntil) }
  updates.push('updated_at = ?'); params.push(now())
  params.push(reservation.id)

  db.prepare(`UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  const updated = {
    ...reservation,
    ...(accessValidFrom ? { access_valid_from: accessValidFrom } : {}),
    ...(accessValidUntil ? { access_valid_until: accessValidUntil } : {}),
  }
  const payload = buildJobPayload(updated, 'update')
  const triggeredBy = `staff:${session.user.email}`
  createJob(reservation.id, 'update', payload, triggeredBy)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'extend_access', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({
      reservation_id: reservation.id,
      name: `${reservation.first_name} ${reservation.last_name}`,
      ...(accessValidFrom ? { newFrom: accessValidFrom } : {}),
      ...(accessValidUntil ? { newUntil: accessValidUntil } : {}),
    }),
    now(),
  )

  return { success: true, accessValidFrom, accessValidUntil }
})
