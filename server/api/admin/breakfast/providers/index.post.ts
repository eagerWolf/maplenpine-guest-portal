import { getDb, now } from '../../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const body = await readBody<Record<string, unknown>>(event)
  if (!String(body.name ?? '').trim()) throw createError({ statusCode: 400, statusMessage: 'Vnesite ime ponudnika' })

  const db = getDb()
  let location = db.prepare('SELECT id FROM locations WHERE active = 1 ORDER BY id LIMIT 1').get() as { id: number } | undefined
  if (!location) {
    const result = db.prepare("INSERT INTO locations (name, country, active, created_at) VALUES ('Bled', 'Slovenia', 1, ?)").run(now())
    location = { id: Number(result.lastInsertRowid) }
  }
  const ts = now()
  const result = db.prepare(`
    INSERT INTO partners (
      location_id, category, name, contact_name, contact_email, whatsapp, notes, active,
      breakfast_enabled, breakfast_cost, breakfast_margin, breakfast_cutoff_hour,
      breakfast_jan1_note, breakfast_min_count, breakfast_max_count, breakfast_exceptions, created_at, updated_at
    ) VALUES (?, 'breakfast', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    location.id, String(body.name).trim(), body.contact_name || null, body.contact_email || null,
    body.whatsapp || null, body.notes || null, body.active === 0 ? 0 : 1,
    body.breakfast_enabled === 0 ? 0 : 1, Number(body.breakfast_cost ?? 12), Number(body.breakfast_margin ?? 2),
    Number(body.breakfast_cutoff_hour ?? 18), body.breakfast_jan1_note || null,
    Number(body.breakfast_min_count ?? 2), Number(body.breakfast_max_count ?? 8),
    JSON.stringify(body.breakfast_exceptions ?? []), ts, ts,
  )
  return { id: Number(result.lastInsertRowid) }
})
