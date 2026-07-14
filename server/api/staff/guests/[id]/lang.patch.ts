import { getDb, now } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'

const SUPPORTED_LANGS = ['en', 'sl', 'de', 'hr', 'sr']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody<{ lang?: string | null }>(event)

  const lang = body.lang || null
  if (lang && !SUPPORTED_LANGS.includes(lang)) {
    throw createError({ statusCode: 400, statusMessage: 'Nepodprt jezik' })
  }

  const db = getDb()
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined

  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }

  db.prepare('UPDATE reservations SET guest_lang_override = ?, updated_at = ? WHERE id = ?')
    .run(lang, now(), reservation.id)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'set_guest_lang_override', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({
      reservation_id: reservation.id,
      name: `${reservation.first_name} ${reservation.last_name}`,
      previousLang: reservation.guest_lang_override,
      newLang: lang,
    }),
    now(),
  )

  return { success: true, lang }
})