import { getDb, now } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'
import { buildJobPayload, createJob } from '../../../../utils/jobs'

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
  if (reservation.status === 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Rezervacija je preklicana' })
  }

  const triggeredBy = `staff:${session.user.email}`

  if (reservation.pin) {
    // Must cancel old PIN before issuing a new one
    const cancelPayload = buildJobPayload(reservation, 'cancel')
    createJob(reservation.id, 'cancel', cancelPayload, triggeredBy)

    // Clear pin immediately so guest portal shows "pending"
    db.prepare('UPDATE reservations SET pin = NULL, updated_at = ? WHERE id = ?')
      .run(now(), reservation.id)
  }

  const fresh = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation
  const insertPayload = buildJobPayload(fresh, 'insert')
  createJob(reservation.id, 'insert', insertPayload, triggeredBy)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'create_pin', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({
      reservation_id: reservation.id,
      name: `${reservation.first_name} ${reservation.last_name}`,
      replaced: !!reservation.pin,
    }),
    now(),
  )

  return { ok: true }
})