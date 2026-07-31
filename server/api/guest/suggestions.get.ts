import { getDb, today } from '../../db/index'
import type { SuggestionRow } from '../../db/index'
import { validateGuestToken, isAdminGuestPreview } from '../../utils/breakfast'
import { isActiveToday } from '../../utils/dateRange'
import { normalizeLocalizedLabel } from '../../utils/localized'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }
  validateGuestToken(token, await isAdminGuestPreview(event))

  const db = getDb()
  const rows = db.prepare('SELECT * FROM suggestions WHERE active = 1 ORDER BY sort_order, id').all() as SuggestionRow[]
  const todayIso = today()

  return rows
    .filter(s => isActiveToday(s.valid_from, s.valid_to, !!s.recurring, todayIso))
    .map(s => ({
      id: s.id,
      title: JSON.parse(s.title),
      description: JSON.parse(s.description),
      buttons: s.buttons ? JSON.parse(s.buttons).map((b:any)=>({...b,label:normalizeLocalizedLabel(b.label)})) : [],
      imagePath: s.image_path ? `/api/uploads/suggestions/${s.image_path}` : null,
    }))
})
