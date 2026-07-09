import { getDb } from '../../db/index'
import { getPendingJobs, markJobsInProgress, mergePendingJobs } from '../../utils/jobs'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || authHeader !== `Bearer ${config.orchestratorApiKey}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = getDb()
  const publishSetting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('auto_publish_ekey') as { value: string } | undefined
  if (publishSetting && publishSetting.value === '0') {
    return { jobs: [] }
  }

  const pendingJobs = getPendingJobs()

  if (pendingJobs.length === 0) {
    return { jobs: [] }
  }

  const merged = mergePendingJobs(pendingJobs)

  markJobsInProgress(merged.flatMap(m => m.allJobIds))

  // Stash sibling job ids on the primary row so /api/orchestrator/results can resolve
  // all of them together once the orchestrator reports back on the merged call.
  for (const m of merged) {
    const siblingIds = m.allJobIds.filter(id => id !== m.orchestratorJob._internalJobId)
    if (siblingIds.length === 0) continue
    const primaryRow = db.prepare('SELECT payload FROM jobs WHERE id = ?').get(m.orchestratorJob._internalJobId) as { payload: string | null }
    const payload = primaryRow.payload ? JSON.parse(primaryRow.payload) : {}
    payload._mergedJobIds = siblingIds
    db.prepare('UPDATE jobs SET payload = ? WHERE id = ?').run(JSON.stringify(payload), m.orchestratorJob._internalJobId)
  }

  const jobs = merged.map(m => m.orchestratorJob)

  return { jobs }
})
