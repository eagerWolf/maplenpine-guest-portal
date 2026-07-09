import { getDb, now } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { title_sl, title_en, content_sl, content_en, active = true, valid_from, valid_to } = await readBody<{
    title_sl: string
    title_en: string
    content_sl: string
    content_en: string
    active?: boolean
    valid_from?: string | null
    valid_to?: string | null
  }>(event)

  if (!title_sl?.trim() || !title_en?.trim() || !content_sl?.trim() || !content_en?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Vsa polja (SL/EN naslov in vsebina) so obvezna' })
  }
  if (valid_from && valid_to && valid_from > valid_to) {
    throw createError({ statusCode: 400, statusMessage: '"Veljavno od" mora biti pred "veljavno do"' })
  }

  const db = getDb()
  const ts = now()
  const result = db.prepare(`
    INSERT INTO news (title_sl, title_en, content_sl, content_en, active, valid_from, valid_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title_sl.trim(), title_en.trim(), content_sl.trim(), content_en.trim(), active ? 1 : 0, valid_from || null, valid_to || null, ts, ts)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'news_create', ?, ?)
  `).run(session.user.id, session.user.email, JSON.stringify({ id: result.lastInsertRowid, title_sl }), ts)

  return { id: result.lastInsertRowid }
})
