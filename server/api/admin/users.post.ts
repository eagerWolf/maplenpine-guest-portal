import { getDb, now } from '../../db/index'
import type { DbUser } from '../../db/index'
import { randomBytes } from 'node:crypto'
import { getEmailConfig, sendEmail } from '../../utils/email'

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

  const normalizedEmail = email.toLowerCase().trim()
  const activationToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  db.prepare('DELETE FROM auth_tokens WHERE email = ? AND used = 0').run(normalizedEmail)
  db.prepare('INSERT INTO auth_tokens (email, token, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)')
    .run(normalizedEmail, activationToken, expiresAt, ts)
  const baseUrl = String(useRuntimeConfig().public.baseUrl).replace(/\/$/, '')
  const activationUrl = `${baseUrl}/activate?token=${activationToken}`

  const mail = getEmailConfig()
  let activationEmailSent = false
  if (mail.configured) {
    try {
      await sendEmail({
        apiKey: mail.apiKey, from: mail.from, to: normalizedEmail,
        subject: 'Aktivacija računa — Maple & Pine Portal',
        html: `<p>Administrator vam je ustvaril račun.</p><p><a href="${activationUrl}">Aktivirajte račun in nastavite geslo</a></p><p>Povezava velja 24 ur.</p>`,
      })
      activationEmailSent = true
    } catch (error) {
      console.error('[users:activation-email]', error)
    }
  }

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'add_staff', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ added_email: email, role, notification_level }),
    ts,
  )

  return { id: result.lastInsertRowid, email: normalizedEmail, role, notification_level, whatsapp_phone: phone, created_at: ts, activationUrl, activationEmailSent }
})
