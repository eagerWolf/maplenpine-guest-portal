import { getDb, now } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const body = await readBody<{ name: string; country?: string }>(event)
  if (!body.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Manjka ime lokacije' })

  const db = getDb()
  const result = db.prepare(
    'INSERT INTO locations (name, country, active, created_at) VALUES (?, ?, 1, ?)',
  ).run(body.name.trim(), body.country ?? 'Slovenia', now())

  return { id: result.lastInsertRowid }
})
