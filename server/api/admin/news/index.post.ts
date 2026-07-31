import { getDb, now } from '../../../db/index'
import { parseLocalizedText } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const body = await readBody<any>(event)
  const title = parseLocalizedText(body.title, 'Naslov')
  const content = parseLocalizedText(body.content, 'Vsebina')
  const recurring = !!body.recurring
  const { validFrom, validTo } = validateContentDates(body.valid_from, body.valid_to, recurring)
  const db = getDb(); const ts = now()
  const result = db.prepare(`INSERT INTO news
    (title_sl,title_en,content_sl,content_en,title,content,recurring,active,valid_from,valid_to,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      title.sl, title.en, content.sl, content.en, JSON.stringify(title), JSON.stringify(content), recurring ? 1 : 0,
      body.active === false ? 0 : 1, validFrom, validTo, ts, ts)
  db.prepare(`INSERT INTO audit_log (user_id,user_email,action,detail,created_at) VALUES (?,?,'news_create',?,?)`)
    .run(session.user.id, session.user.email, JSON.stringify({ id: result.lastInsertRowid, title: title.sl }), ts)
  return { id: result.lastInsertRowid }
})
