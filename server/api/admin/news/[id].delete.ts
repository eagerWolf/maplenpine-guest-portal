import { getDb } from '../../../db/index'
import type { News } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()

  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as News | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Novica ni najdena' })
  }

  db.prepare('DELETE FROM news WHERE id = ?').run(id)

  return { success: true }
})
