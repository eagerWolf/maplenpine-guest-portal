import { getDb } from '../../../db/index'
import type { HowtoItemRow } from '../../../db/index'
import { normalizeLocalizedLabel } from '../../../utils/localized'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const rows = db.prepare('SELECT * FROM howto_items ORDER BY sort_order, id').all() as HowtoItemRow[]

  return rows.map(h => ({
    ...h,
    imagePath: h.image_path ? `/api/uploads/howto/${h.image_path}` : null,
    title: JSON.parse(h.title),
    description: JSON.parse(h.description),
    links: h.links ? JSON.parse(h.links).map((l:any)=>({...l,label:normalizeLocalizedLabel(l.label)})) : [],
  }))
})
