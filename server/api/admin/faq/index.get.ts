import { getDb } from '../../../db/index'
import type { FaqItemRow } from '../../../db/index'
import { normalizeLocalizedLabel } from '../../../utils/localized'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const rows = db.prepare('SELECT * FROM faq_items ORDER BY sort_order, id').all() as FaqItemRow[]

  return rows.map(f => ({
    ...f,
    title: JSON.parse(f.title),
    description: JSON.parse(f.description),
    links: f.links ? JSON.parse(f.links).map((l:any)=>({...l,label:normalizeLocalizedLabel(l.label)})) : [],
  }))
})
