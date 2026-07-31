import { getDb, today } from '../../db/index'
import type { News } from '../../db/index'
import { validateGuestToken, isAdminGuestPreview } from '../../utils/breakfast'
import { isActiveToday } from '../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }

  validateGuestToken(token, await isAdminGuestPreview(event))

  const db = getDb()
  const news = db.prepare('SELECT * FROM news WHERE active = 1 ORDER BY created_at DESC').all() as News[]

  return news.filter(n => isActiveToday(n.valid_from, n.valid_to, !!n.recurring, today())).map(n => ({
    id: n.id,
    title: JSON.parse(n.title),
    content: JSON.parse(n.content),
    createdAt: n.created_at,
  }))
})
