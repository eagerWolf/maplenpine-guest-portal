import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { limit = '50', offset = '0' } = getQuery(event) as { limit?: string; offset?: string }

  const db = getDb()

  const rows = db.prepare(`
    SELECT id, action, user_email, detail, created_at
    FROM audit_log
    WHERE action IN ('sync_run', 'sync_error')
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(Number(limit), Number(offset)) as Array<{
    id: number
    action: string
    user_email: string | null
    detail: string | null
    created_at: string
  }>

  const total = (db.prepare(`
    SELECT COUNT(*) AS cnt FROM audit_log WHERE action IN ('sync_run', 'sync_error')
  `).get() as { cnt: number }).cnt

  const runs = rows.map(r => {
    let detail: Record<string, unknown> = {}
    try { detail = r.detail ? JSON.parse(r.detail) : {} } catch {}
    return {
      id: r.id,
      isError: r.action === 'sync_error',
      tier: detail.tier as string ?? '—',
      from: detail.from as string ?? null,
      to: detail.to as string ?? null,
      fetched: detail.fetched as number ?? null,
      inserted: detail.inserted as number ?? null,
      updated: detail.updated as number ?? null,
      cancelled: detail.cancelled as number ?? null,
      error: detail.error as string ?? null,
      triggeredBy: r.user_email ?? 'cron',
      createdAt: r.created_at,
    }
  })

  return { runs, total }
})
