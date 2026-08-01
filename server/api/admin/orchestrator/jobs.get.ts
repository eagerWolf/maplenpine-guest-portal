import { getDb } from '../../../db/index'
import type { Job } from '../../../db/index'
import { toOrchestratorJob, mergePendingJobs } from '../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const db = getDb()
  const rows = db.prepare(`
    SELECT j.*, r.first_name || ' ' || r.last_name AS guest_name, r.door AS reservation_door
    FROM jobs j
    JOIN reservations r ON r.id = j.reservation_id
    WHERE j.status IN ('pending', 'in_progress', 'failed')
    ORDER BY j.created_at ASC
  `).all() as Array<Job & { guest_name: string; reservation_door: string }>

  // Jobs queued for the same reservation while still pending get collapsed into a single
  // orchestrator call — see mergePendingJobs. Only 'pending' rows are eligible, matching what
  // the real GET /api/orchestrator/jobs would pick up on its next poll.
  const pendingRows = rows.filter(r => r.status === 'pending')
  const merged = mergePendingJobs(pendingRows)
  const mergeSiblingCount = new Map<number, number>()
  for (const m of merged) {
    if (m.allJobIds.length > 1) {
      for (const id of m.allJobIds) mergeSiblingCount.set(id, m.allJobIds.length - 1)
    }
  }

  const jobs = rows.map(r => ({
    id: r.id,
    guestName: r.guest_name,
    door: r.reservation_door,
    status: r.status,
    triggeredBy: r.triggered_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    stale: r.status === 'in_progress' && Date.now() - new Date(r.updated_at ?? r.created_at).getTime() > 30 * 60 * 1000,
    mergesWithCount: mergeSiblingCount.get(r.id) ?? 0,
    orchestratorPayload: toOrchestratorJob(r),
  }))

  const publishSetting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('auto_publish_ekey') as { value: string } | undefined
  const autoPublishEnabled = !publishSetting || publishSetting.value !== '0'
  const orchestratorApiKey = (db.prepare('SELECT value FROM app_settings WHERE key = ?').get('orchestrator_api_key') as { value: string } | undefined)?.value ?? ''
  const orchestratorLeaseMinutes = (db.prepare('SELECT value FROM app_settings WHERE key = ?').get('orchestrator_lease_minutes') as { value: string } | undefined)?.value ?? '30'
  const orchestratorMaxAttempts = (db.prepare('SELECT value FROM app_settings WHERE key = ?').get('orchestrator_max_attempts') as { value: string } | undefined)?.value ?? '5'
  const orchestratorLastSeen = (db.prepare('SELECT value FROM app_settings WHERE key = ?').get('orchestrator_last_seen') as { value: string } | undefined)?.value ?? null
  const portalOrigin = getRequestURL(event).origin
  const outbox = db.prepare(`
    SELECT id, unique_key, type, status, attempt_count, next_attempt_at, last_error, created_at, completed_at
    FROM integration_outbox
    WHERE status != 'completed' OR completed_at >= datetime('now', '-1 day')
    ORDER BY created_at DESC LIMIT 50
  `).all()

  return {
    jobs,
    autoPublishEnabled,
    orchestratorApiKey,
    orchestratorLeaseMinutes,
    orchestratorMaxAttempts,
    orchestratorLastSeen,
    jobsUrl: `${portalOrigin}/api/orchestrator/jobs`,
    resultsUrl: `${portalOrigin}/api/orchestrator/results`,
    batchPayload: { jobs: merged.map(m => m.orchestratorJob) },
    outbox,
  }
})
