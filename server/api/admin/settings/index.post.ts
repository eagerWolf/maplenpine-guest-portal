import { getDb, now } from '../../../db/index'

const ALLOWED_KEYS = [
  'bentral_checkin_time',
  'bentral_checkout_time',
  'checkin_offset_minutes',
  'checkout_offset_minutes',
  'hot_interval_minutes',
  'warm_interval_hours',
  'cold_interval_hours',
  'contact_phone',
  'property_nav_url',
]

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const body = await readBody<Record<string, string>>(event)
  const db = getDb()
  const ts = now()

  const upsert = db.prepare(
    'INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
  )

  const updated: string[] = []
  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      upsert.run(key, String(body[key]), ts)
      updated.push(key)
    }
  }

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'update_settings', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ updated, values: Object.fromEntries(updated.map(k => [k, body[k]])) }),
    ts,
  )

  return { success: true, updated }
})
