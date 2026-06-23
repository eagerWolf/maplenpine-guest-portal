import { getDb } from '../../db/index'
import type { DbUser } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const users = db.prepare('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC').all() as DbUser[]
  return users
})
