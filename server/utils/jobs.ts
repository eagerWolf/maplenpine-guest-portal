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
