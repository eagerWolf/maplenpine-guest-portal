import { getDb } from '../../../db/index'

export default defineEventHandler(async event => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })
  const id = Number(getRouterParam(event, 'id'))
  const db = getDb()
  const restaurantCount = (db.prepare('SELECT COUNT(*) count FROM restaurants WHERE location_id=?').get(id) as { count: number }).count
  const partnerCount = (db.prepare('SELECT COUNT(*) count FROM partners WHERE location_id=? OR pickup_location_id=? OR return_location_id=?').get(id, id, id) as { count: number }).count
  if (restaurantCount || partnerCount) {
    throw createError({
      statusCode: 409,
      statusMessage: `Lokacija je še v uporabi (${restaurantCount} restavracij, ${partnerCount} ponudnikov). Najprej odstranite povezave.`,
    })
  }
  const result = db.prepare('DELETE FROM locations WHERE id=?').run(id)
  if (!result.changes) throw createError({ statusCode: 404, statusMessage: 'Lokacija ne obstaja' })
  return { success: true }
})
