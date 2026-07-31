import { getDb, now } from '../../../db/index'
import type { FaqItemRow } from '../../../db/index'
import { parseLocalizedText, parseLocalizedLinks } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT * FROM faq_items WHERE id = ?').get(id) as FaqItemRow | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'FAQ ni najden' })
  }

  const body = await readBody<{
    title?: unknown
    description?: unknown
    links?: Array<{ label: string; href: string }>
    active?: boolean
    sort_order?: number
    recurring?: boolean; valid_from?: string | null; valid_to?: string | null
  }>(event)

  const title = body.title !== undefined ? parseLocalizedText(body.title, 'Naslov') : JSON.parse(item.title)
  const description = body.description !== undefined ? parseLocalizedText(body.description, 'Opis') : JSON.parse(item.description)
  const links = body.links !== undefined ? parseLocalizedLinks(body.links, 'Povezave') : (item.links ? JSON.parse(item.links) : [])
  const active = body.active ?? !!item.active
  const sort_order = body.sort_order ?? item.sort_order
  const recurring=body.recurring===undefined?!!item.recurring:!!body.recurring; const dates=validateContentDates('valid_from' in body?body.valid_from:item.valid_from,'valid_to' in body?body.valid_to:item.valid_to,recurring)

  db.prepare(`
    UPDATE faq_items SET title = ?, description = ?, links = ?, active = ?, sort_order = ?, recurring=?, valid_from=?, valid_to=?, updated_at = ?
    WHERE id = ?
  `).run(JSON.stringify(title), JSON.stringify(description), links?.length ? JSON.stringify(links) : null, active ? 1 : 0, sort_order, recurring?1:0, dates.validFrom, dates.validTo, now(), id)

  return { success: true }
})
