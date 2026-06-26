import { getDb } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const db = getDb()
  const locations = db.prepare('SELECT * FROM locations ORDER BY name ASC').all()
  return { locations }
})
