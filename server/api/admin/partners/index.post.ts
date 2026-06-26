import { getDb, now } from '../../../db/index'

interface PartnerBody {
  location_id: number
  category: string
  name: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  whatsapp?: string
  notes?: string
  active?: number
}

const ALLOWED_CATEGORIES = ['breakfast', 'ebike', 'transfer', 'laundry', 'activities', 'other']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const body = await readBody<PartnerBody>(event)
  if (!body.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Manjka ime partnerja' })
  if (!body.location_id) throw createError({ statusCode: 400, statusMessage: 'Manjka lokacija' })
  if (!ALLOWED_CATEGORIES.includes(body.category)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljavna kategorija' })
  }

  const db = getDb()
  const location = db.prepare('SELECT id FROM locations WHERE id = ?').get(body.location_id)
  if (!location) throw createError({ statusCode: 400, statusMessage: 'Lokacija ne obstaja' })

  const ts = now()
  const result = db.prepare(`
    INSERT INTO partners (location_id, category, name, contact_name, contact_phone, contact_email, whatsapp, notes, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    body.location_id,
    body.category,
    body.name.trim(),
    body.contact_name ?? null,
    body.contact_phone ?? null,
    body.contact_email ?? null,
    body.whatsapp ?? null,
    body.notes ?? null,
    body.active ?? 1,
    ts, ts,
  )

  return { id: result.lastInsertRowid }
})
