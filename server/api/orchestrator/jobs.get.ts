import { getDb } from '../../db/index'
import type { Job, Reservation } from '../../db/index'
import { getPendingJobs, markJobsInProgress } from '../../utils/jobs'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || authHeader !== `Bearer ${config.orchestratorApiKey}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const pendingJobs = getPendingJobs()

  if (pendingJobs.length === 0) {
    return { jobs: [] }
  }

  const ids = pendingJobs.map(j => j.id)
  markJobsInProgress(ids)

  const jobs = pendingJobs.map(j => {
    const payload = j.payload ? JSON.parse(j.payload) : {}
    return {
      jobId: payload.jobId ?? j.id,
      _internalJobId: j.id,
      action: j.action,
      door: payload.door,
      firstName: payload.firstName,
      lastName: payload.lastName,
      validFrom: payload.validFrom,
      validTo: payload.validTo,
    }
  })

  return { jobs }
})
