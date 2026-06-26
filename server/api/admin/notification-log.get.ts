import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { limit = '100', offset = '0', event_type, channel, status } = getQuery(event) as {
    limit?: string
    offset?: string
    event_type?: string
    channel?: string
    status?: string
  }

  const db = getDb()

  const conditions: string[] = []
  const params: unknown[] = []

  if (event_type) { conditions.push('event_type = ?'); params.push(event_type) }
  if (channel) { conditions.push('channel = ?'); params.push(channel) }
  if (status) { conditions.push('status = ?'); params.push(status) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const rows = db.prepare(`
    SELECT id, user_email, channel, event_type, recipient, subject, status, error, reference_id, created_at
    FROM notification_log
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset))

  const total = (db.prepare(`SELECT COUNT(*) AS cnt FROM notification_log ${where}`)
    .get(...params) as { cnt: number }).cnt

  return { rows, total }
})
