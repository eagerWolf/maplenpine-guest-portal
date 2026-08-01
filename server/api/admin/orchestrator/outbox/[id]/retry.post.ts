import { getDb, now } from '../../../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Neveljavno outbox opravilo' })
  const db = getDb()
  const result = db.prepare(`
    UPDATE integration_outbox SET status = 'pending', attempt_count = 0, next_attempt_at = ?, last_error = NULL, updated_at = ?, completed_at = NULL
    WHERE id = ? AND status = 'failed'
  `).run(now(), now(), id)
  if (!result.changes) throw createError({ statusCode: 409, statusMessage: 'Ponoviti je mogoče samo neuspešno integracijo' })
  db.prepare(`INSERT INTO audit_log (user_id, user_email, action, detail, created_at) VALUES (?, ?, 'retry_integration_outbox', ?, ?)`)
    .run(session.user.id, session.user.email, JSON.stringify({ outbox_id: id }), now())
  return { success: true }
})
