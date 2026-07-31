import { getDb, today } from '../../db/index'
import { isActiveToday } from '../../utils/dateRange'
import { normalizeLocalizedLabel } from '../../utils/localized'
import type { HowtoItemRow } from '../../db/index'
import { validateGuestToken, isAdminGuestPreview } from '../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }
  validateGuestToken(token, await isAdminGuestPreview(event))

  const db = getDb()
  const rows = db.prepare('SELECT * FROM howto_items WHERE active = 1 ORDER BY sort_order, id').all() as HowtoItemRow[]

  return rows.filter(h=>isActiveToday(h.valid_from,h.valid_to,!!h.recurring,today())).map(h => ({
    id: h.id,
    title: JSON.parse(h.title),
    description: JSON.parse(h.description),
    imagePath: h.image_path ? `/api/uploads/howto/${h.image_path}` : null,
    links: h.links ? JSON.parse(h.links).map((l:any)=>({...l,label:normalizeLocalizedLabel(l.label)})) : [],
  }))
})
