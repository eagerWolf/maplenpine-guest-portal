import { getDb, now } from '../../../../db/index'

const FIELDS = [
  'name', 'contact_name', 'contact_email', 'whatsapp', 'notes', 'active', 'breakfast_enabled',
  'breakfast_cost', 'breakfast_margin', 'breakfast_cutoff_hour', 'breakfast_jan1_note',
  'breakfast_min_count', 'breakfast_max_count',
  'breakfast_exceptions',
]

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<Record<string, unknown>>(event)
  const db = getDb()
  const provider = db.prepare("SELECT id FROM partners WHERE id = ? AND category = 'breakfast'").get(id)
  if (!provider) throw createError({ statusCode: 404, statusMessage: 'Ponudnik ne obstaja' })

  const updates: string[] = []
  const values: unknown[] = []
  for (const field of FIELDS) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`)
      values.push(field === 'breakfast_exceptions' ? JSON.stringify(body[field] ?? []) : body[field] === '' ? null : body[field])
    }
  }
  if (!updates.length) return { updated: false }
  updates.push('updated_at = ?')
  values.push(now(), id)
  db.prepare(`UPDATE partners SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  return { updated: true }
})
