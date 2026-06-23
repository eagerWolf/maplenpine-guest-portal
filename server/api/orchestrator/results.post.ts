import { randomUUID } from 'crypto'
import { getDb, now } from '../../db/index'
import type { Job, Reservation } from '../../db/index'
import { updateJobResult } from '../../utils/jobs'
import {
  sendGuestPin,
  sendAdminPinAdded,
  sendAdminPinUpdated,
  sendAdminJobFailed,
} from '../../utils/email'

interface OrchestratorResult {
  _internalJobId?: number
  jobId?: string
  status: 'success' | 'failed'
  pin?: string
  message?: string
  reason?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || authHeader !== `Bearer ${config.orchestratorApiKey}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { results } = await readBody<{ results: OrchestratorResult[] }>(event)

  if (!Array.isArray(results)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const db = getDb()

  for (const result of results) {
    // Find the job — prefer _internalJobId, fall back to searching by bentral_reservation_id
    let job = result._internalJobId
      ? (db.prepare("SELECT * FROM jobs WHERE id = ?").get(result._internalJobId) as Job | undefined)
      : undefined

    if (!job && result.jobId) {
      job = db.prepare(`
        SELECT j.* FROM jobs j
        JOIN reservations r ON r.id = j.reservation_id
        WHERE r.bentral_reservation_id = ? AND j.status = 'in_progress'
        ORDER BY j.created_at DESC LIMIT 1
      `).get(result.jobId) as Job | undefined
    }

    if (!job) {
      console.warn('[orchestrator:results] Unknown jobId:', result.jobId)
      continue
    }

    updateJobResult(job.id, result.status, { ...result }, result.reason)

    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(job.reservation_id) as Reservation | undefined
    if (!reservation) continue

    const guestName = `${reservation.first_name} ${reservation.last_name}`

    if (result.status === 'success') {
      if (job.action === 'insert' && result.pin) {
        // Store PIN
        db.prepare('UPDATE reservations SET pin = ?, updated_at = ? WHERE id = ?')
          .run(result.pin, now(), reservation.id)

        // Create guest token
        const token = randomUUID()
        const expiresAt = new Date(
          new Date(reservation.check_out + 'T00:00:00').getTime() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString()
        db.prepare('INSERT INTO guest_tokens (reservation_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)')
          .run(reservation.id, token, expiresAt, now())

        // Send guest email if we have their address
        if (reservation.guest_email && config.resendApiKey) {
          const portalLink = `${config.public.baseUrl}/guest/${token}`
          await sendGuestPin({
            to: reservation.guest_email,
            guestName,
            pin: result.pin,
            door: reservation.door,
            validFrom: reservation.access_valid_from ?? reservation.check_in,
            validUntil: reservation.access_valid_until ?? reservation.check_out,
            portalLink,
            apiKey: config.resendApiKey,
            from: config.guestEmailFrom,
          }).catch(err => console.error('[email:guest]', err))
        }

        // Admin notification
        if (config.resendApiKey && config.adminEmailTo) {
          await sendAdminPinAdded({
            guestName,
            door: reservation.door,
            pin: result.pin,
            validFrom: reservation.access_valid_from ?? reservation.check_in,
            validUntil: reservation.access_valid_until ?? reservation.check_out,
            apiKey: config.resendApiKey,
            from: config.adminEmailFrom,
            to: config.adminEmailTo,
          }).catch(err => console.error('[email:admin]', err))
        }
      } else if (job.action === 'update') {
        const triggeredBy = job.triggered_by === 'bentral_sync' ? 'Bentral sync' : (job.triggered_by ?? 'unknown')
        if (config.resendApiKey && config.adminEmailTo) {
          await sendAdminPinUpdated({
            guestName,
            validFrom: reservation.access_valid_from ?? reservation.check_in,
            validUntil: reservation.access_valid_until ?? reservation.check_out,
            triggeredBy,
            apiKey: config.resendApiKey,
            from: config.adminEmailFrom,
            to: config.adminEmailTo,
          }).catch(err => console.error('[email:admin]', err))
        }
      }
    } else if (result.status === 'failed') {
      if (config.resendApiKey && config.adminEmailTo) {
        await sendAdminJobFailed({
          guestName,
          action: job.action,
          reason: result.reason ?? result.message ?? 'Unknown error',
          jobId: job.id,
          apiKey: config.resendApiKey,
          from: config.adminEmailFrom,
          to: config.adminEmailTo,
        }).catch(err => console.error('[email:admin]', err))
      }
    }
  }

  return { success: true }
})
