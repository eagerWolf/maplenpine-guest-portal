import { getDb, now } from '../../db/index'
import type { DbUser } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { email, role } = await readBody<{ email: string; role: string }>(event)

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven email' })
  }
  if (!['admin', 'staff'].includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljavna vloga' })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim())
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Uporabnik že obstaja' })
  }

  const ts = now()
  const result = db.prepare(
    'INSERT INTO users (email, role, created_at) VALUES (?, ?, ?)',
  ).run(email.toLowerCase().trim(), role, ts)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'add_staff', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ added_email: email, role }),
    ts,
  )

  return { id: result.lastInsertRowid, email, role, created_at: ts }
})
