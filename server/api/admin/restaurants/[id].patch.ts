import { getDb, now } from '../../../db/index'
import type { RestaurantRow } from '../../../db/index'
import { parseLocalizedText } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

const ALLOWED_TYPES = ['fineDining', 'traditional', 'casual']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id) as RestaurantRow | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Restavracija ni najdena' })
  }

  const body = await readBody<{
    name?: string
    type?: string
    website?: string
    location_id?: number | null
    description?: unknown
    active?: boolean
    sort_order?: number
    recurring?: boolean; valid_from?: string | null; valid_to?: string | null
    website_slug?: string
  }>(event)

  const name = body.name?.trim() ?? item.name
  const type = body.type !== undefined ? (ALLOWED_TYPES.includes(body.type) ? body.type : item.type) : item.type
  const website = 'website' in body ? (body.website?.trim() || null) : item.website
  const locationId = 'location_id' in body ? (body.location_id || null) : (item as any).location_id
  const description = body.description !== undefined ? parseLocalizedText(body.description, 'Opis') : JSON.parse(item.description)
  const active = body.active ?? !!item.active
  const sort_order = body.sort_order ?? item.sort_order
  const recurring = body.recurring === undefined ? !!item.recurring : !!body.recurring
  const dates = validateContentDates('valid_from' in body ? body.valid_from : item.valid_from, 'valid_to' in body ? body.valid_to : item.valid_to, recurring)

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime restavracije je obvezno' })
  }

  db.prepare(`
    UPDATE restaurants SET name = ?, type = ?, website = ?, location_id = ?, description = ?, active = ?, sort_order = ?, recurring=?, valid_from=?, valid_to=?, website_slug=?, updated_at = ?
    WHERE id = ?
  `).run(name, type, website, locationId, JSON.stringify(description), active ? 1 : 0, sort_order, recurring?1:0, dates.validFrom, dates.validTo, body.website_slug !== undefined ? body.website_slug.trim() || null : item.website_slug, now(), id)

  return { success: true }
})
