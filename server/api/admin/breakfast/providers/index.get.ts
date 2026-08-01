import { getDb } from '../../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })

  const db = getDb()
  const providers = db.prepare(`
    SELECT id, name, contact_name, contact_email, whatsapp, notes, active,
           breakfast_enabled, breakfast_cost, breakfast_margin, breakfast_cutoff_hour,
           breakfast_jan1_note, breakfast_min_count, breakfast_max_count
           , breakfast_exceptions
    FROM partners
    WHERE category = 'breakfast'
    ORDER BY name
  `).all()
  return { providers: (providers as Array<Record<string, unknown>>).map(provider => ({
    ...provider,
    breakfast_exceptions: JSON.parse(String(provider.breakfast_exceptions || '[]')),
  })) }
})
