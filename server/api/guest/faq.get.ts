import { getDb, today } from '../../db/index'
import { isActiveToday } from '../../utils/dateRange'
import { normalizeLocalizedLabel } from '../../utils/localized'
import type { FaqItemRow } from '../../db/index'
import { validateGuestToken, isAdminGuestPreview } from '../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }
  validateGuestToken(token, await isAdminGuestPreview(event))

  const db = getDb()
  const rows = db.prepare('SELECT * FROM faq_items WHERE active = 1 ORDER BY sort_order, id').all() as FaqItemRow[]

  return rows.filter(f=>isActiveToday(f.valid_from,f.valid_to,!!f.recurring,today())).map(f => ({
    id: f.id,
    title: JSON.parse(f.title),
    description: JSON.parse(f.description),
    links: f.links ? JSON.parse(f.links).map((l:any)=>({...l,label:normalizeLocalizedLabel(l.label)})) : [],
  }))
})
