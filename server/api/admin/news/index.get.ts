import { getDb } from '../../../db/index'
import type { News } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const news = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all() as News[]

  return news.map(n => ({ ...n, title: JSON.parse(n.title), content: JSON.parse(n.content) }))
})
