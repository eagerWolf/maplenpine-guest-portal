import { getDb } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const query = getQuery(event)
  const conditions: string[] = []
  const params: unknown[] = []

  if (query.category) {
    conditions.push('p.category = ?')
    params.push(query.category)
  }
  if (query.location_id) {
    conditions.push('p.location_id = ?')
    params.push(query.location_id)
  }
  if (query.active === '1') {
    conditions.push('p.active = 1')
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  const db = getDb()

  const partners = db.prepare(`
    SELECT p.*, l.name AS location_name
    FROM partners p
    LEFT JOIN locations l ON l.id = p.location_id
    ${where}
    ORDER BY p.name ASC
  `).all(...params)

  return { partners }
})
