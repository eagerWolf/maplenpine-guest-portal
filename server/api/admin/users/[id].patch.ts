import { getDb, now } from '../../../db/index'
import type { DbUser } from '../../../db/index'

const VALID_LEVELS = ['none', 'errors', 'all']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const { notification_level, whatsapp_phone, notify_housekeeper, notify_checkin, notes, active } = await readBody<{
    notification_level?: string
    whatsapp_phone?: string
    notify_housekeeper?: boolean
    notify_checkin?: boolean
    notes?: string
    active?: boolean
  }>(event)

  if (notification_level !== undefined && !VALID_LEVELS.includes(notification_level)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven nivo obvestil' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Uporabnik ni najden' })
  }

  const ts = now()
  const fields: string[] = []
  const values: unknown[] = []

  if (notification_level !== undefined) {
    fields.push('notification_level = ?')
    values.push(notification_level)
  }
  if (whatsapp_phone !== undefined) {
    fields.push('whatsapp_phone = ?')
    values.push(whatsapp_phone.trim() || null)
  }
  if (notify_housekeeper !== undefined) {
    fields.push('notify_housekeeper = ?')
    values.push(notify_housekeeper ? 1 : 0)
  }
  if (notify_checkin !== undefined) {
    fields.push('notify_checkin = ?')
    values.push(notify_checkin ? 1 : 0)
  }
  if (notes !== undefined) {
    fields.push('notes = ?')
    values.push(notes.trim() || null)
  }
  if (active !== undefined && !active) {
    if (user.id === session.user.id) {
      throw createError({ statusCode: 400, statusMessage: 'Ne morete deaktivirati svojega računa' })
    }
    if (user.role === 'admin') {
      const activeAdmins = (db.prepare(
        "SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin' AND active != 0",
      ).get() as { cnt: number }).cnt
      if (activeAdmins <= 1) {
        throw createError({ statusCode: 400, statusMessage: 'Vsaj en admin mora ostati aktiven' })
      }
    }
    fields.push('active = ?')
    values.push(0)
  } else if (active !== undefined) {
    fields.push('active = ?')
    values.push(1)
  }

  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nič za posodobiti' })
  }

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
    .run(...values, id)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'update_user_notifications', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ target_email: user.email, notification_level, whatsapp_phone }),
    ts,
  )

  return { success: true }
})
