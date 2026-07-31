import { getDb } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT id FROM faq_items WHERE id = ?').get(id)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'FAQ ni najden' })
  }

  db.prepare('DELETE FROM faq_items WHERE id = ?').run(id)

  return { success: true }
})
