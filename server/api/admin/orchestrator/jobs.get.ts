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
    WHERE j.status IN ('pending', 'in_progress')
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
    mergesWithCount: mergeSiblingCount.get(r.id) ?? 0,
    orchestratorPayload: toOrchestratorJob(r),
  }))

  const publishSetting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('auto_publish_ekey') as { value: string } | undefined
  const autoPublishEnabled = !publishSetting || publishSetting.value !== '0'

  return {
    jobs,
    autoPublishEnabled,
    batchPayload: { jobs: merged.map(m => m.orchestratorJob) },
  }
})
