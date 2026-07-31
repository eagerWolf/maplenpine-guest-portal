import { getDb } from '../../../db/index'
import type { SuggestionRow } from '../../../db/index'
import { normalizeLocalizedLabel } from '../../../utils/localized'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const rows = db.prepare('SELECT * FROM suggestions ORDER BY sort_order, id').all() as SuggestionRow[]

  return rows.map(s => ({
    ...s,
    imagePath: s.image_path ? `/api/uploads/suggestions/${s.image_path}` : null,
    title: JSON.parse(s.title),
    description: JSON.parse(s.description),
    buttons: s.buttons ? JSON.parse(s.buttons).map((b:any)=>({...b,label:normalizeLocalizedLabel(b.label)})) : [],
  }))
})
