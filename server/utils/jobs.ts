import { getDb, now } from '../db/index'
import type { Reservation, Job } from '../db/index'

export interface JobPayload {
  jobId: string
  action: 'insert' | 'update' | 'cancel'
  door?: string
  firstName: string
  lastName: string
  validFrom?: string
  validTo?: string
}

export function buildJobPayload(
  reservation: Reservation,
  action: 'insert' | 'update' | 'cancel',
): JobPayload {
  const base = {
    jobId: reservation.bentral_reservation_id,
    action,
    firstName: reservation.first_name,
    lastName: reservation.last_name,
  }
  if (action === 'cancel') return base
  return {
    ...base,
    door: reservation.door,
    validFrom: reservation.access_valid_from ?? undefined,
    validTo: reservation.access_valid_until ?? undefined,
  }
}

export function createJob(
  reservationId: number,
  action: 'insert' | 'update' | 'cancel',
  payload: JobPayload,
  triggeredBy: string,
): number {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO jobs (reservation_id, action, status, triggered_by, payload, created_at)
    VALUES (?, ?, 'pending', ?, ?, ?)
  `).run(reservationId, action, triggeredBy, JSON.stringify(payload), now())
  return result.lastInsertRowid as number
}

export function getPendingJobs(): Array<Job & { bentral_reservation_id: string }> {
  const db = getDb()
  return db.prepare(`
    SELECT j.*, r.bentral_reservation_id
    FROM jobs j
    JOIN reservations r ON r.id = j.reservation_id
    WHERE j.status = 'pending'
    ORDER BY j.created_at ASC
  `).all() as Array<Job & { bentral_reservation_id: string }>
}

export function toOrchestratorJob(job: Job): {
  jobId: string | number
  _internalJobId: number
  action: string
  door?: string
  firstName?: string
  lastName?: string
  validFrom?: string
  validTo?: string
} {
  const payload = job.payload ? JSON.parse(job.payload) : {}
  return {
    jobId: payload.jobId ?? job.id,
    _internalJobId: job.id,
    action: job.action,
    door: payload.door,
    firstName: payload.firstName,
    lastName: payload.lastName,
    validFrom: payload.validFrom,
    validTo: payload.validTo,
  }
}

export interface MergedOrchestratorJob {
  jobId: string | number
  _internalJobId: number
  action: string
  door?: string
  firstName?: string
  lastName?: string
  validFrom?: string
  validTo?: string
}

/**
 * Multiple jobs can pile up pending for the same reservation (e.g. an "insert" queued by
 * sync, then an "update" queued by a staff-triggered access extension before the orchestrator
 * has picked either up). Sending both to the orchestrator would mean two separate hardware
 * calls for what is really one desired end-state, so they're collapsed into a single call:
 * action favours cancel > insert > update (you can't update a PIN that hasn't been inserted
 * yet, and a queued cancel always wins), field values come from the most recently queued job.
 */
export function mergePendingJobs(jobs: Job[]): Array<{ orchestratorJob: MergedOrchestratorJob; allJobIds: number[] }> {
  const byReservation = new Map<number, Job[]>()
  for (const job of jobs) {
    const list = byReservation.get(job.reservation_id) ?? []
    list.push(job)
    byReservation.set(job.reservation_id, list)
  }

  const merged: Array<{ orchestratorJob: MergedOrchestratorJob; allJobIds: number[] }> = []
  for (const group of byReservation.values()) {
    const sorted = [...group].sort((a, b) => a.created_at.localeCompare(b.created_at))
    const primary = sorted[0]
    const latest = sorted[sorted.length - 1]
    const latestPayload = latest.payload ? JSON.parse(latest.payload) : {}
    const hasCancel = sorted.some(j => j.action === 'cancel')
    const hasInsert = sorted.some(j => j.action === 'insert')
    const action = hasCancel ? 'cancel' : hasInsert ? 'insert' : 'update'

    merged.push({
      allJobIds: sorted.map(j => j.id),
      orchestratorJob: {
        jobId: latestPayload.jobId ?? primary.id,
        _internalJobId: primary.id,
        action,
        firstName: latestPayload.firstName,
        lastName: latestPayload.lastName,
        ...(action === 'cancel' ? {} : {
          door: latestPayload.door,
          validFrom: latestPayload.validFrom,
          validTo: latestPayload.validTo,
        }),
      },
    })
  }
  return merged
}

export function markJobsInProgress(ids: number[]): void {
  if (ids.length === 0) return
  const db = getDb()
  const placeholders = ids.map(() => '?').join(',')
  db.prepare(`UPDATE jobs SET status = 'in_progress', updated_at = ? WHERE id IN (${placeholders})`)
    .run(now(), ...ids)
}

export function updateJobResult(
  jobId: number,
  status: 'success' | 'failed',
  result: Record<string, unknown>,
  reason?: string,
): void {
  const db = getDb()
  db.prepare(`
    UPDATE jobs SET status = ?, result = ?, reason = ?, updated_at = ? WHERE id = ?
  `).run(status, JSON.stringify(result), reason ?? null, now(), jobId)
}

export function getSettings(): Record<string, string> {
  const db = getDb()
  const rows = db.prepare('SELECT key, value FROM app_settings').all() as Array<{ key: string; value: string }>
  const defaults: Record<string, string> = {
    bentral_checkin_time: '15:00',
    bentral_checkout_time: '11:00',
    checkin_offset_minutes: '-120',
    checkout_offset_minutes: '30',
    hot_interval_minutes: '30',
    warm_interval_hours: '5',
    cold_interval_hours: '24',
    contact_phone: '',
    property_nav_url: '',
  }
  for (const row of rows) {
    defaults[row.key] = row.value
  }
  return defaults
}

function applyOffset(dateStr: string, timeStr: string, offsetMin: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [h, m] = timeStr.split(':').map(Number)
  let total = h * 60 + m + offsetMin
  const dayShift = Math.floor(total / 1440)
  total = ((total % 1440) + 1440) % 1440
  // new Date(y, m, d) uses local calendar — safe for day arithmetic only
  const base = new Date(year, month - 1, day + dayShift)
  const yyyy = base.getFullYear()
  const mm = String(base.getMonth() + 1).padStart(2, '0')
  const dd = String(base.getDate()).padStart(2, '0')
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mi = String(total % 60).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

/**
 * Returns the time string a guest should see in their message.
 * Standard case: shows the official check-in/out time (e.g. 15:00, 11:00).
 * If admin has manually adjusted the access time, shows the adjusted value directly.
 */
export function computeDisplayFrom(reservation: Reservation, settings: Record<string, string>): string {
  const arrival = reservation.bentral_arrival ?? reservation.check_in
  const departure = reservation.bentral_departure ?? reservation.check_out
  const standard = buildAccessTimes(arrival, departure, settings)
  if (!reservation.access_valid_from || reservation.access_valid_from === standard.validFrom) {
    return `${arrival} ${settings.bentral_checkin_time || '15:00'}`
  }
  return reservation.access_valid_from
}

export function computeDisplayUntil(reservation: Reservation, settings: Record<string, string>): string {
  const arrival = reservation.bentral_arrival ?? reservation.check_in
  const departure = reservation.bentral_departure ?? reservation.check_out
  const standard = buildAccessTimes(arrival, departure, settings)
  if (!reservation.access_valid_until || reservation.access_valid_until === standard.validUntil) {
    return `${departure} ${settings.bentral_checkout_time || '11:00'}`
  }
  return reservation.access_valid_until
}

export function buildAccessTimes(arrival: string, departure: string, settings: Record<string, string>) {
  const checkinTime = settings.bentral_checkin_time || '15:00'
  const checkoutTime = settings.bentral_checkout_time || '11:00'
  const checkinOffset = parseInt(settings.checkin_offset_minutes || '-120', 10)
  const checkoutOffset = parseInt(settings.checkout_offset_minutes || '30', 10)
  return {
    validFrom: applyOffset(arrival, checkinTime, checkinOffset),
    validUntil: applyOffset(departure, checkoutTime, checkoutOffset),
  }
}
