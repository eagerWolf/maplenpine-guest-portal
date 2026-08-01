import { getDb } from '../../../db/index'

export default defineEventHandler(async event => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<Record<string, unknown>>(event)
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Neveljavna lokacija' })

  const name = String(body.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Vnesite ime lokacije' })
  const latitude = body.latitude === null || body.latitude === '' ? null : Number(body.latitude)
  const longitude = body.longitude === null || body.longitude === '' ? null : Number(body.longitude)
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) throw createError({ statusCode: 400, statusMessage: 'Neveljavna zemljepisna širina' })
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) throw createError({ statusCode: 400, statusMessage: 'Neveljavna zemljepisna dolžina' })
  const mapsUrl = latitude !== null && longitude !== null
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : String(body.google_maps_url ?? '').trim() || null

  const result = getDb().prepare(`
    UPDATE locations SET name=?, address=?, country=?, google_maps_url=?, latitude=?, longitude=?, free_parking=?, active=? WHERE id=?
  `).run(name, String(body.address ?? '').trim() || null, String(body.country ?? '').trim() || 'Slovenia', mapsUrl, latitude, longitude, body.free_parking ? 1 : 0, body.active === 0 ? 0 : 1, id)
  if (!result.changes) throw createError({ statusCode: 404, statusMessage: 'Lokacija ne obstaja' })
  return { success: true }
})
