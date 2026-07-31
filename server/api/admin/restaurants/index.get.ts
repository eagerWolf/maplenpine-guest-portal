import { getDb } from '../../../db/index'
import type { RestaurantRow } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const rows = db.prepare('SELECT * FROM restaurants ORDER BY sort_order, id').all() as RestaurantRow[]

  return rows.map(r => ({
    ...r,
    imagePath: r.image_path ? `/api/uploads/restaurants/${r.image_path}` : null,
    description: JSON.parse(r.description),
  }))
})
