import { getDb } from '../../db/index'
import type { Reservation } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const query = getQuery(event)
  const year = parseInt(String(query.year))
  const month = parseInt(String(query.month))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven mesec ali leto' })
  }

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const daysInMonth = new Date(year, month, 0).getDate()
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const db = getDb()
  const all = db.prepare(`
    SELECT * FROM reservations
    WHERE check_in <= ?
      AND check_out >= ?
    ORDER BY check_in ASC, last_name ASC
  `).all(lastDay, firstDay) as Reservation[]

  const map = (r: Reservation) => ({
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
    guestCount: r.guest_count,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    status: r.status,
  })

  return {
    reservations: all.filter(r => r.status !== 'cancelled').map(map),
    allReservations: all.map(map),
  }
})
