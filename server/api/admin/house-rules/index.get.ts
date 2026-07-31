import { getDb } from '../../../db/index'
import type { HouseRuleRow } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const rows = db.prepare('SELECT * FROM house_rules ORDER BY sort_order, id').all() as HouseRuleRow[]

  return rows.map(r => ({
    ...r,
    text: JSON.parse(r.text),
  }))
})
