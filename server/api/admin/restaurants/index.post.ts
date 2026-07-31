import { getDb, now } from '../../../db/index'
import { parseLocalizedText } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

const ALLOWED_TYPES = ['fineDining', 'traditional', 'casual']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const body = await readBody<{
    name?: string
    type?: string
    website?: string
    description?: unknown
    active?: boolean
    sort_order?: number
    recurring?: boolean; valid_from?: string | null; valid_to?: string | null
  }>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Ime restavracije je obvezno' })
  }
  const type = body.type && ALLOWED_TYPES.includes(body.type) ? body.type : 'casual'
  const description = parseLocalizedText(body.description, 'Opis')
  const recurring = !!body.recurring
  const dates = validateContentDates(body.valid_from, body.valid_to, recurring)

  const db = getDb()
  const ts = now()
  const result = db.prepare(`
    INSERT INTO restaurants (name, type, website, description, active, sort_order, recurring, valid_from, valid_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(body.name.trim(), type, body.website?.trim() || null, JSON.stringify(description), body.active === false ? 0 : 1, body.sort_order ?? 0, recurring?1:0, dates.validFrom, dates.validTo, ts, ts)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'restaurant_create', ?, ?)
  `).run(session.user.id, session.user.email, JSON.stringify({ id: result.lastInsertRowid, name: body.name }), ts)

  return { id: result.lastInsertRowid }
})
