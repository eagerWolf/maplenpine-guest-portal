import { getDb, today } from '../../db/index'
import { isActiveToday } from '../../utils/dateRange'
import type { HouseRuleRow } from '../../db/index'
import { validateGuestToken, isAdminGuestPreview } from '../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }
  validateGuestToken(token, await isAdminGuestPreview(event))

  const db = getDb()
  const rows = db.prepare('SELECT * FROM house_rules WHERE active = 1 ORDER BY sort_order, id').all() as HouseRuleRow[]

  return rows.filter(r=>isActiveToday(r.valid_from,r.valid_to,!!r.recurring,today())).map(r => ({
    id: r.id,
    text: JSON.parse(r.text),
  }))
})
