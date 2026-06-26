import { getDb, now } from '../../db/index'
import type { DbUser } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { email, role, notification_level = 'none', whatsapp_phone = '' } = await readBody<{
    email: string
    role: string
    notification_level?: string
    whatsapp_phone?: string
  }>(event)

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven email' })
  }
  if (!['admin', 'staff'].includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljavna vloga' })
  }
  if (!['none', 'errors', 'all'].includes(notification_level)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven nivo obvestil' })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim())
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Uporabnik že obstaja' })
  }

  const ts = now()
  const phone = whatsapp_phone.trim() || null
  const result = db.prepare(
    'INSERT INTO users (email, role, notification_level, whatsapp_phone, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(email.toLowerCase().trim(), role, notification_level, phone, ts)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'add_staff', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ added_email: email, role, notification_level }),
    ts,
  )

  return { id: result.lastInsertRowid, email, role, notification_level, whatsapp_phone: phone, created_at: ts }
})
