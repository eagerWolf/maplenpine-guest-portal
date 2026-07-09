import { getDb, now } from '../../../db/index'
import type { News } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()

  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as News | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Novica ni najdena' })
  }

  const body = await readBody<{
    title_sl?: string
    title_en?: string
    content_sl?: string
    content_en?: string
    active?: boolean
    valid_from?: string | null
    valid_to?: string | null
  }>(event)

  const title_sl = body.title_sl?.trim() ?? item.title_sl
  const title_en = body.title_en?.trim() ?? item.title_en
  const content_sl = body.content_sl?.trim() ?? item.content_sl
  const content_en = body.content_en?.trim() ?? item.content_en
  const active = body.active ?? !!item.active
  const valid_from = 'valid_from' in body ? (body.valid_from || null) : item.valid_from
  const valid_to = 'valid_to' in body ? (body.valid_to || null) : item.valid_to

  if (!title_sl || !title_en || !content_sl || !content_en) {
    throw createError({ statusCode: 400, statusMessage: 'Vsa polja (SL/EN naslov in vsebina) so obvezna' })
  }
  if (valid_from && valid_to && valid_from > valid_to) {
    throw createError({ statusCode: 400, statusMessage: '"Veljavno od" mora biti pred "veljavno do"' })
  }

  db.prepare(`
    UPDATE news SET title_sl = ?, title_en = ?, content_sl = ?, content_en = ?, active = ?, valid_from = ?, valid_to = ?, updated_at = ?
    WHERE id = ?
  `).run(title_sl, title_en, content_sl, content_en, active ? 1 : 0, valid_from, valid_to, now(), id)

  return { success: true }
})
