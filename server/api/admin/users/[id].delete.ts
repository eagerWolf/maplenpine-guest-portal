import { getDb, now } from '../../../db/index'
import type { DbUser } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Uporabnik ni najden' })
  }
  if (user.id === session.user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Ne morete izbrisati svojega računa' })
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'remove_staff', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ removed_email: user.email, role: user.role }),
    now(),
  )

  return { success: true }
})
