import { getDb, now } from '../../../db/index'

const ALLOWED_CATEGORIES = ['breakfast', 'ebike', 'transfer', 'laundry', 'activities', 'other']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  const db = getDb()

  const existing = db.prepare('SELECT * FROM partners WHERE id = ?').get(id) as { id: number } | undefined
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Partner ne obstaja' })

  const body = await readBody<Record<string, unknown>>(event)
  const allowed = ['location_id', 'category', 'name', 'contact_name', 'contact_phone', 'contact_email', 'whatsapp', 'notes', 'active']
  const updates: string[] = []
  const params: unknown[] = []

  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'category' && !ALLOWED_CATEGORIES.includes(body[key] as string)) continue
      updates.push(`${key} = ?`)
      params.push(body[key])
    }
  }

  if (updates.length === 0) return { updated: false }

  updates.push('updated_at = ?')
  params.push(now())
  params.push(id)

  db.prepare(`UPDATE partners SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  return { updated: true }
})
