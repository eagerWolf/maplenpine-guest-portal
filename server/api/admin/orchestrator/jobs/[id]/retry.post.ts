import { getDb, now } from '../../../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Neveljavno opravilo' })
  const db = getDb()
  const result = db.prepare(`
    UPDATE jobs SET status = 'pending', result = NULL, reason = 'Manual retry', attempt_count = 0,
      lease_expires_at = NULL, updated_at = ?
    WHERE id = ? AND status = 'failed'
  `).run(now(), id)
  if (!result.changes) throw createError({ statusCode: 409, statusMessage: 'Ponoviti je mogoče samo neuspešno opravilo' })
  db.prepare(`INSERT INTO audit_log (user_id, user_email, action, detail, created_at) VALUES (?, ?, 'retry_orchestrator_job', ?, ?)`)
    .run(session.user.id, session.user.email, JSON.stringify({ job_id: id }), now())
  return { success: true }
})
