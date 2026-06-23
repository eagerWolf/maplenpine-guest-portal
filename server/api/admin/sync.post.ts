import { syncBentral } from '../../utils/sync'
import { getDb, now } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { tier } = await readBody<{ tier?: 'hot' | 'warm' | 'cold' }>(event)
  const syncTier = tier ?? 'hot'

  // Fire-and-forget — return immediately
  syncBentral(syncTier).catch(err => console.error('[admin:sync]', err))

  const db = getDb()
  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'manual_sync', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ tier: syncTier }),
    now(),
  )

  return { success: true, tier: syncTier }
})
