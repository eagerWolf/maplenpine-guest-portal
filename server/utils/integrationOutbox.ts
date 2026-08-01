import { getDb, now } from '../db/index'
import type { Reservation } from '../db/index'
import { getEmailConfig, sendGuestPin } from './email'
import { patchBentralEntranceCode } from './bentral'
import { computeDisplayFrom, computeDisplayUntil, getSettings } from './jobs'
import { notifyAdmins } from './notify'

export type OutboxType = 'guest_pin_email' | 'bentral_ekey' | 'admin_notification'

interface GuestPinPayload { reservationId: number; pin: string; portalLink: string }
interface BentralPayload { reservationId: number; pin: string }
interface AdminNotificationPayload {
  event: 'orchestrator_offline' | 'orchestrator_recovered'
  subject: string
  emailHtml: string
  whatsappText: string
}
type OutboxPayload = GuestPinPayload | BentralPayload | AdminNotificationPayload

export function enqueueIntegration(uniqueKey: string, type: OutboxType, payload: OutboxPayload): boolean {
  const ts = now()
  const result = getDb().prepare(`
    INSERT OR IGNORE INTO integration_outbox
      (unique_key, type, payload, status, attempt_count, next_attempt_at, created_at, updated_at)
    VALUES (?, ?, ?, 'pending', 0, ?, ?, ?)
  `).run(uniqueKey, type, JSON.stringify(payload), ts, ts, ts)
  return result.changes > 0
}

function parseAccessTime(dt: string | null, fallbackDate: string, fallbackTime: string): { date: string; time: string } {
  if (dt) {
    const [date = '', time = ''] = dt.split(' ')
    if (date && time) return { date, time }
  }
  return { date: fallbackDate, time: fallbackTime }
}

function buildUnits(unitId: string | null, unitName: string | null) {
  if (!unitId || !unitName) return []
  return unitId.split(',').map((id, index) => ({ id, name: unitName.split(',')[index] ?? '' })).filter(unit => unit.id && unit.name)
}

function getBentralApiKey(): string {
  const dbValue = (getDb().prepare("SELECT value FROM app_settings WHERE key = 'bentral_api_key'").get() as { value: string } | undefined)?.value?.trim()
  return dbValue || String(useRuntimeConfig().bentralApiKey || '')
}

async function patchBentral(reservation: Reservation, pin: string): Promise<void> {
  const settings = getSettings()
  const checkin = parseAccessTime(computeDisplayFrom(reservation, settings), reservation.check_in, '15:00')
  const checkout = parseAccessTime(computeDisplayUntil(reservation, settings), reservation.check_out, '11:00')
  const targets = [
    { reservationId: reservation.bentral_reservation_id, units: buildUnits(reservation.bentral_unit_id, reservation.bentral_unit_name) },
    { reservationId: reservation.bentral_paired_reservation_id, units: buildUnits(reservation.bentral_paired_unit_id, reservation.bentral_paired_unit_name) },
  ].filter(target => target.reservationId && target.units.length > 0)
  if (!targets.length) return
  const apiKey = getBentralApiKey()
  if (!apiKey) throw new Error('Bentral API key is not configured')
  for (const target of targets) {
    await patchBentralEntranceCode(apiKey, target.reservationId!, target.units, pin, checkin.date, checkin.time, checkout.date, checkout.time)
  }
}

async function execute(type: OutboxType, payload: OutboxPayload): Promise<void> {
  if (type === 'admin_notification') {
    const notification = payload as AdminNotificationPayload
    return notifyAdmins({ ...notification, requireDelivery: true })
  }
  const integrationPayload = payload as GuestPinPayload | BentralPayload
  const reservation = getDb().prepare('SELECT * FROM reservations WHERE id = ?').get(integrationPayload.reservationId) as Reservation | undefined
  if (!reservation) throw new Error(`Reservation ${integrationPayload.reservationId} not found`)
  if (type === 'bentral_ekey') return patchBentral(reservation, integrationPayload.pin)
  const emailPayload = integrationPayload as GuestPinPayload
  if (!reservation.guest_email) return
  const config = getEmailConfig()
  if (!config.configured) throw new Error('SendGrid is not configured')
  await sendGuestPin({
    to: reservation.guest_email,
    guestName: `${reservation.first_name} ${reservation.last_name}`,
    pin: emailPayload.pin,
    door: reservation.door,
    validFrom: reservation.access_valid_from ?? reservation.check_in,
    validUntil: reservation.access_valid_until ?? reservation.check_out,
    portalLink: emailPayload.portalLink,
    apiKey: config.apiKey,
    from: config.from,
    lang: reservation.guest_lang_override || reservation.guest_lang || 'en',
  })
}

interface OutboxRow { id: number; unique_key: string; type: OutboxType; payload: string; attempt_count: number }

export async function processIntegrationOutbox(referenceTime = now(), limit = 20): Promise<{ completed: number; retried: number; failed: number }> {
  const db = getDb()
  const abandonedBefore = new Date(new Date(referenceTime).getTime() - 15 * 60_000).toISOString()
  db.prepare(`
    UPDATE integration_outbox SET status = 'pending', next_attempt_at = ?, updated_at = ?
    WHERE status = 'processing' AND updated_at <= ?
  `).run(referenceTime, referenceTime, abandonedBefore)
  const rows = db.prepare(`
    SELECT id, unique_key, type, payload, attempt_count FROM integration_outbox
    WHERE status = 'pending' AND next_attempt_at <= ? ORDER BY created_at ASC LIMIT ?
  `).all(referenceTime, limit) as OutboxRow[]
  const summary = { completed: 0, retried: 0, failed: 0 }
  for (const row of rows) {
    const claimed = db.prepare("UPDATE integration_outbox SET status = 'processing', updated_at = ? WHERE id = ? AND status = 'pending'")
      .run(referenceTime, row.id)
    if (!claimed.changes) continue
    try {
      await execute(row.type, JSON.parse(row.payload))
      const ts = now()
      db.prepare("UPDATE integration_outbox SET status = 'completed', completed_at = ?, updated_at = ?, last_error = NULL WHERE id = ?")
        .run(ts, ts, row.id)
      summary.completed++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const attempt = row.attempt_count + 1
      if (attempt >= 12) {
        db.prepare("UPDATE integration_outbox SET status = 'failed', attempt_count = ?, last_error = ?, updated_at = ? WHERE id = ?")
          .run(attempt, message, now(), row.id)
        summary.failed++
        await notifyAdmins({
          event: 'pin_send_failed',
          subject: `⚠ Integracija je trajno odpovedala — ${row.type}`,
          emailHtml: `<p>Opravilo <code>${row.unique_key}</code> je odpovedalo po ${attempt} poskusih.</p><p>${message}</p>`,
          whatsappText: `⚠ Integracija ${row.type} je odpovedala po ${attempt} poskusih: ${message}`,
        }).catch(() => {})
      } else {
        const delayMinutes = Math.min(360, 2 ** Math.min(attempt - 1, 8))
        const nextAttempt = new Date(new Date(referenceTime).getTime() + delayMinutes * 60_000).toISOString()
        db.prepare("UPDATE integration_outbox SET status = 'pending', attempt_count = ?, last_error = ?, next_attempt_at = ?, updated_at = ? WHERE id = ?")
          .run(attempt, message, nextAttempt, now(), row.id)
        summary.retried++
      }
    }
  }
  return summary
}
