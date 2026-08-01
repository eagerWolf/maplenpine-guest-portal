import { getDb, now } from '../../../db/index'
import type { SuggestionRow } from '../../../db/index'
import { parseLocalizedText, parseLocalizedLinks } from '../../../utils/localized'
import { validateSuggestionDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT * FROM suggestions WHERE id = ?').get(id) as SuggestionRow | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Suggestion ni najden' })
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

  const title = body.title !== undefined ? parseLocalizedText(body.title, 'Naslov') : JSON.parse(item.title)
  const description = body.description !== undefined ? parseLocalizedText(body.description, 'Opis') : JSON.parse(item.description)
  const buttons = body.buttons !== undefined ? parseLocalizedLinks(body.buttons, 'Gumbi') : (item.buttons ? JSON.parse(item.buttons) : [])
  const recurring = body.recurring !== undefined ? !!body.recurring : !!item.recurring
  const rawValidFrom = 'valid_from' in body ? body.valid_from : item.valid_from
  const rawValidTo = 'valid_to' in body ? body.valid_to : item.valid_to
  const { validFrom, validTo } = validateSuggestionDates(rawValidFrom, rawValidTo, recurring)
  const active = body.active ?? !!item.active
  const sort_order = body.sort_order ?? item.sort_order

  db.prepare(`
    UPDATE suggestions
    SET title = ?, description = ?, buttons = ?, recurring = ?, valid_from = ?, valid_to = ?, active = ?, sort_order = ?, website_slug = ?, youtube_url = ?, updated_at = ?
    WHERE id = ?
  `).run(
    JSON.stringify(title), JSON.stringify(description), buttons?.length ? JSON.stringify(buttons) : null,
    recurring ? 1 : 0, validFrom, validTo, active ? 1 : 0, sort_order,
    body.website_slug !== undefined ? body.website_slug.trim() || null : item.website_slug,
    body.youtube_url !== undefined ? body.youtube_url.trim() || null : item.youtube_url,
    now(), id,
  )

  return { success: true }
})
