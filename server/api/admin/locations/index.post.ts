import { getDb, now } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const body = await readBody<{ name: string; country?: string; address?: string; google_maps_url?: string; latitude?: number; longitude?: number; free_parking?: boolean }>(event)
  const latitude = Number(body.latitude)
  const longitude = Number(body.longitude)
  const generatedName = body.address?.trim() || (Number.isFinite(latitude) && Number.isFinite(longitude) ? `Lokacija ${latitude}, ${longitude}` : '')
  const name = body.name?.trim() || generatedName
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Manjka ime ali položaj lokacije' })

  const db = getDb()
  const result = db.prepare(
    'INSERT INTO locations (name, country, address, google_maps_url, latitude, longitude, free_parking, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
  ).run(name, body.country ?? 'Slovenia', body.address?.trim() || null, body.google_maps_url?.trim() || null, Number.isFinite(latitude) ? latitude : null, Number.isFinite(longitude) ? longitude : null, body.free_parking ? 1 : 0, now())

  return { id: result.lastInsertRowid }
})
