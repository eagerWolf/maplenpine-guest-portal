import { messagingEnabled, bentralGuestMessagesEnabled, workerAlertsEnabled, isWorkerAlert } from './servicePolicy'
import { getDb, now } from '../db/index'
import type { Reservation } from '../db/index'
import { guestAccessMessage } from './guestAccessMessage'
import { patchBentralEntranceCode, sendBentralGuestMessage, BentralMessageDeliveryUnknown } from './bentral'
import { computeDisplayFrom, computeDisplayUntil, getSettings } from './jobs'
import { notifyAdmins, resolveNotification } from './notify'
import { getSettingValue } from './secretSettings'

export type OutboxType = 'guest_pin_email' | 'bentral_guest_message' | 'bentral_ekey' | 'admin_notification'

interface GuestPinPayload { reservationId: number; pin: string; portalLink: string; messageKind?: 'created' | 'updated' | 'replaced'; publicationKey?: string }
interface BentralPayload { reservationId: number; pin: string }
interface AdminNotificationPayload {
  event: 'orchestrator_offline' | 'orchestrator_recovered' | 'orchestrator_reboot' | 'orchestrator_recovery_failed'
  subject: string
  emailHtml: string
  whatsappText: string
}
type OutboxPayload = GuestPinPayload | BentralPayload | AdminNotificationPayload

export function enqueueIntegration(uniqueKey: string, type: OutboxType, payload: OutboxPayload): boolean {
  if (type === 'guest_pin_email') return false // SendGrid guest delivery is retired.
  if (type === 'admin_notification' && !messagingEnabled() && !(workerAlertsEnabled() && isWorkerAlert((payload as AdminNotificationPayload).event))) return false
  const ts = now()
  const result = getDb().prepare(`
    INSERT OR IGNORE INTO integration_outbox
      (unique_key, type, payload, status, attempt_count, next_attempt_at, created_at, updated_at)
    VALUES (?, ?, ?, 'pending', 0, ?, ?, ?)
  `).run(uniqueKey, type, JSON.stringify(payload), ts, ts, ts)
  if (result.changes > 0 && type === 'bentral_guest_message') {
    // Coalesce only messages that have never been attempted; unknown deliveries remain reviewable.
    getDb().prepare(`UPDATE integration_outbox SET status = 'superseded', updated_at = ?
      WHERE type = 'bentral_guest_message' AND status = 'pending' AND attempt_count = 0
      AND unique_key != ? AND json_extract(payload, '$.reservationId') = ?`)
      .run(ts, uniqueKey, (payload as GuestPinPayload).reservationId)
  }
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
  if (!unitId) return []
  // Bentral may return a valid unit with name=""; identity is its ID.
  return unitId.split(',').map((id, index) => ({ id, name: (unitName || '').split(',')[index] ?? '' })).filter(unit => unit.id)
}

function getBentralApiKey(): string {
  const dbValue = getSettingValue('bentral_api_key').trim()
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
  if (!targets.length) throw new Error('Reservation has no Bentral units for PIN publication')
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
  // Recheck at delivery time: a reservation can be cancelled while a retry waits.
  if (reservation.status !== 'active') return
  if (type === 'bentral_ekey') return patchBentral(reservation, integrationPayload.pin)
  if (type === 'guest_pin_email') throw new Error('Legacy SendGrid guest delivery is disabled')
  const messagePayload = integrationPayload as GuestPinPayload
  if (!/^\d{4}$/.test(reservation.pin || '') || reservation.pin !== messagePayload.pin) {
    throw new Error('Queued PIN no longer matches the current reservation')
  }
  const link = new URL(messagePayload.portalLink)
  if (!['https:', 'http:'].includes(link.protocol)) throw new Error('Invalid guest portal link')
  const token = link.pathname.split('/').pop()
  const access = getDb().prepare('SELECT expires_at FROM guest_tokens WHERE reservation_id = ? AND token = ?').get(reservation.id, token) as { expires_at: string } | undefined
  if (!access || new Date(access.expires_at).getTime() <= new Date(now()).getTime()) throw new Error('Guest portal link is missing or expired')
  if (!reservation.bentral_reservation_id) throw new Error('Bentral reservation ID is missing')
  const published = messagePayload.publicationKey
    ? getDb().prepare("SELECT id FROM integration_outbox WHERE unique_key = ? AND type = 'bentral_ekey' AND status = 'completed'").get(messagePayload.publicationKey)
    : getDb().prepare(`SELECT id FROM integration_outbox WHERE type = 'bentral_ekey' AND status = 'completed'
    AND json_extract(payload, '$.reservationId') = ? AND json_extract(payload, '$.pin') = ? LIMIT 1`).get(reservation.id, messagePayload.pin)
  if (!published) throw new Error('PIN has not yet been published to Bentral')
  const apiKey = getBentralApiKey()
  if (!apiKey) throw new Error('Bentral API key is not configured')
  await sendBentralGuestMessage(apiKey, reservation.bentral_reservation_id, guestAccessMessage(reservation, messagePayload.pin, messagePayload.portalLink, messagePayload.messageKind))
}

interface OutboxRow { id: number; unique_key: string; type: OutboxType; payload: string; attempt_count: number }

export async function processIntegrationOutbox(referenceTime = now(), limit = 20): Promise<{ completed: number; retried: number; failed: number }> {
  const db = getDb()
  const abandonedBefore = new Date(new Date(referenceTime).getTime() - 15 * 60_000).toISOString()
  // If the process crashed during a message POST, do not send again blindly.
  db.prepare(`UPDATE integration_outbox SET status = 'failed', updated_at = ?, last_error = ?
    WHERE status = 'processing' AND type = 'bentral_guest_message' AND updated_at <= ?`)
    .run(referenceTime, 'Delivery unknown after restart. Check Bentral conversation before manual retry.', abandonedBefore)
  db.prepare(`
    UPDATE integration_outbox SET status = 'pending', next_attempt_at = ?, updated_at = ?
    WHERE status = 'processing' AND updated_at <= ?
  `).run(referenceTime, referenceTime, abandonedBefore)
  const rows = db.prepare(`
    SELECT id, unique_key, type, payload, attempt_count FROM integration_outbox
    WHERE status = 'pending' AND next_attempt_at <= ?
      AND (type = 'bentral_ekey' OR (type = 'admin_notification' AND ? = 1) OR (type = 'bentral_guest_message' AND ? = 1))
      ORDER BY created_at ASC, id ASC LIMIT ?
  `).all(referenceTime, (messagingEnabled() || workerAlertsEnabled()) ? 1 : 0, bentralGuestMessagesEnabled() ? 1 : 0, limit) as OutboxRow[]
  const summary = { completed: 0, retried: 0, failed: 0 }
  for (const row of rows) {
    if (row.type === 'admin_notification' && !messagingEnabled() && !isWorkerAlert(JSON.parse(row.payload).event)) continue
    const claimed = db.prepare("UPDATE integration_outbox SET status = 'processing', updated_at = ? WHERE id = ? AND status = 'pending'")
      .run(referenceTime, row.id)
    if (!claimed.changes) continue
    try {
      await execute(row.type, JSON.parse(row.payload))
      const ts = now()
      db.prepare("UPDATE integration_outbox SET status = 'completed', completed_at = ?, updated_at = ?, last_error = NULL WHERE id = ?")
        .run(ts, ts, row.id)
      summary.completed++
      if (!db.prepare("SELECT id FROM integration_outbox WHERE type=? AND status='failed' LIMIT 1").get(row.type)) {
        await resolveNotification('pin_send_failed', `⚠ Integracija je trajno odpovedala — ${row.type}`, `Integracija ${row.type} je ponovno uspešno zaključena.`).catch(() => {})
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const attempt = row.attempt_count + 1
      const deliveryUnknown = row.type === 'bentral_guest_message' && error instanceof BentralMessageDeliveryUnknown
      if (deliveryUnknown || attempt >= 12) {
        db.prepare("UPDATE integration_outbox SET status = 'failed', attempt_count = ?, last_error = ?, updated_at = ? WHERE id = ?")
          .run(attempt, message, now(), row.id)
        summary.failed++
        await notifyAdmins({
          event: 'pin_send_failed',
          subject: `⚠ Integracija je trajno odpovedala — ${row.type}`,
          emailHtml: `<p>Opravilo <code>${row.unique_key}</code> je odpovedalo po ${attempt} poskusih.</p><p>${message}</p>`,
          whatsappText: `⚠ Integracija ${row.type} potrebuje pregled po ${attempt} poskusih: ${message}`,
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
