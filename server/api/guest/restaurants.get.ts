import { getDb, today } from '../../db/index'
import { isActiveToday } from '../../utils/dateRange'
import type { RestaurantRow } from '../../db/index'
import { validateGuestToken, isAdminGuestPreview } from '../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka token' })
  }
  validateGuestToken(token, await isAdminGuestPreview(event))

  const db = getDb()
  const rows = db.prepare('SELECT * FROM restaurants WHERE active = 1 ORDER BY sort_order, id').all() as RestaurantRow[]

  return rows.filter(r => isActiveToday(r.valid_from,r.valid_to,!!r.recurring,today())).map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    website: r.website,
    imagePath: r.image_path ? `/api/uploads/restaurants/${r.image_path}` : null,
    description: JSON.parse(r.description),
  }))
})
