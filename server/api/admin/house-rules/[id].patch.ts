import { getDb, now } from '../../../db/index'
import type { HouseRuleRow } from '../../../db/index'
import { parseLocalizedText } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT * FROM house_rules WHERE id = ?').get(id) as HouseRuleRow | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Pravilo ni najdeno' })
  }

  const body = await readBody<{ text?: unknown; active?: boolean; sort_order?: number; recurring?: boolean; valid_from?: string|null; valid_to?: string|null }>(event)
  const text = body.text !== undefined ? parseLocalizedText(body.text, 'Besedilo') : JSON.parse(item.text)
  const active = body.active ?? !!item.active
  const sort_order = body.sort_order ?? item.sort_order
  const recurring=body.recurring===undefined?!!item.recurring:!!body.recurring; const dates=validateContentDates('valid_from' in body?body.valid_from:item.valid_from,'valid_to' in body?body.valid_to:item.valid_to,recurring)

  db.prepare(`
    UPDATE house_rules SET text = ?, active = ?, sort_order = ?, recurring=?, valid_from=?, valid_to=?, updated_at = ?
    WHERE id = ?
  `).run(JSON.stringify(text), active ? 1 : 0, sort_order, recurring?1:0, dates.validFrom, dates.validTo, now(), id)

  return { success: true }
})
