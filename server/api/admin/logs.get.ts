import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { limit = '100', offset = '0' } = getQuery(event) as { limit?: string; offset?: string }

  const db = getDb()

  const jobs = db.prepare(`
    SELECT
      j.id,
      j.action,
      j.status,
      j.triggered_by,
      j.reason,
      j.created_at,
      j.updated_at,
      r.first_name || ' ' || r.last_name AS guest_name,
      r.door,
      r.bentral_reservation_id AS bentral_id
    FROM jobs j
    JOIN reservations r ON r.id = j.reservation_id
    ORDER BY j.created_at DESC
    LIMIT ? OFFSET ?
  `).all(Number(limit), Number(offset))

  const total = (db.prepare('SELECT COUNT(*) AS cnt FROM jobs').get() as { cnt: number }).cnt

  return { jobs, total }
})
