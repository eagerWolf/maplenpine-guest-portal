import { getDb } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT id FROM house_rules WHERE id = ?').get(id)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Pravilo ni najdeno' })
  }

  db.prepare('DELETE FROM house_rules WHERE id = ?').run(id)

  return { success: true }
})
