import { getDb, today } from '../../db/index'
import type { News } from '../../db/index'
import { validateGuestToken } from '../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }

  validateGuestToken(token)

  const db = getDb()
  const news = db.prepare(`
    SELECT * FROM news
    WHERE active = 1
      AND (valid_from IS NULL OR valid_from <= ?)
      AND (valid_to IS NULL OR valid_to >= ?)
    ORDER BY created_at DESC
  `).all(today(), today()) as News[]

  return news.map(n => ({
    id: n.id,
    titleSl: n.title_sl,
    titleEn: n.title_en,
    contentSl: n.content_sl,
    contentEn: n.content_en,
    createdAt: n.created_at,
  }))
})
