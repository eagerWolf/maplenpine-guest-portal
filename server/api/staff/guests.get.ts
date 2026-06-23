import { getDb } from '../../db/index'
import type { Reservation } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()

  const today = new Date().toISOString().slice(0, 10)

  const reservations = db.prepare(`
    SELECT * FROM reservations
    WHERE status = 'active'
      AND check_out >= ?
    ORDER BY check_in ASC, last_name ASC
  `).all(today) as Reservation[]

  return reservations.map(r => ({
    id: r.id,
    bentralId: r.bentral_reservation_id,
    name: `${r.first_name} ${r.last_name}`,
    firstName: r.first_name,
    lastName: r.last_name,
    door: r.door,
    checkIn: r.check_in,
    checkOut: r.check_out,
    pin: r.pin,
    accessValidFrom: r.access_valid_from,
    accessValidUntil: r.access_valid_until,
    status: r.status,
  }))
})
