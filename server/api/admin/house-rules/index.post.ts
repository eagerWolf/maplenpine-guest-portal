import { getDb, now } from '../../../db/index'
import { parseLocalizedText } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const body = await readBody<{ text?: unknown; active?: boolean; sort_order?: number; recurring?: boolean; valid_from?: string|null; valid_to?: string|null }>(event)
  const text = parseLocalizedText(body.text, 'Besedilo')
  const recurring=!!body.recurring; const dates=validateContentDates(body.valid_from,body.valid_to,recurring)

  const db = getDb()
  const ts = now()
  const result = db.prepare(`
    INSERT INTO house_rules (text, active, sort_order, recurring, valid_from, valid_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(JSON.stringify(text), body.active === false ? 0 : 1, body.sort_order ?? 0, recurring?1:0, dates.validFrom, dates.validTo, ts, ts)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'house_rule_create', ?, ?)
  `).run(session.user.id, session.user.email, JSON.stringify({ id: result.lastInsertRowid, text: text.en }), ts)

  return { id: result.lastInsertRowid }
})
