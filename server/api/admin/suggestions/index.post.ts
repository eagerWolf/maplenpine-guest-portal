import { getDb, now } from '../../../db/index'
import { parseLocalizedText, parseLocalizedLinks } from '../../../utils/localized'
import { validateSuggestionDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const body = await readBody<{
    title?: unknown
    description?: unknown
    buttons?: Array<{ label: string; href: string; target?: string }>
    recurring?: boolean
    valid_from?: string | null
    valid_to?: string | null
    active?: boolean
    sort_order?: number
    website_slug?: string
    youtube_url?: string
  }>(event)

  const title = parseLocalizedText(body.title, 'Naslov')
  const description = parseLocalizedText(body.description, 'Opis')
  const buttons = parseLocalizedLinks(body.buttons, 'Gumbi')
  const recurring = !!body.recurring
  const { validFrom, validTo } = validateSuggestionDates(body.valid_from, body.valid_to, recurring)

  const db = getDb()
  const ts = now()
  const result = db.prepare(`
    INSERT INTO suggestions (title, description, buttons, recurring, valid_from, valid_to, active, sort_order, website_slug, youtube_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    JSON.stringify(title), JSON.stringify(description), buttons.length ? JSON.stringify(buttons) : null,
    recurring ? 1 : 0, validFrom, validTo, body.active === false ? 0 : 1, body.sort_order ?? 0, body.website_slug?.trim() || null, body.youtube_url?.trim() || null, ts, ts,
  )

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'suggestion_create', ?, ?)
  `).run(session.user.id, session.user.email, JSON.stringify({ id: result.lastInsertRowid, title: title.en }), ts)

  return { id: result.lastInsertRowid }
})
