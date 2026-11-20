import { randomUUID } from 'node:crypto'
import { getDb, now } from '../db/index'
import { prepareBentralGuestMessage, processIntegrationOutbox } from './integrationOutbox'
import { bentralGuestMessagesEnabled } from './servicePolicy'

function leaseTable() {
  getDb().exec(`CREATE TABLE IF NOT EXISTS bentral_message_leases (
    outbox_id INTEGER PRIMARY KEY REFERENCES integration_outbox(id),
    token TEXT NOT NULL UNIQUE
  )`)
}

export async function claimWindowsMessage() {
  if (process.env.BENTRAL_MESSAGE_SENDER !== 'windows' || !bentralGuestMessagesEnabled()) return null
  // Publishes queued PINs first; Windows-owned messages are excluded here.
  await processIntegrationOutbox()
  leaseTable()
  const db = getDb()
  return db.transaction(() => {
    const rows = db.prepare(`SELECT id, payload FROM integration_outbox
      WHERE type = 'bentral_guest_message' AND status = 'pending' AND next_attempt_at <= ?
      ORDER BY id LIMIT 20`).all(now()) as Array<{ id: number; payload: string }>
    for (const row of rows) {
      let prepared
      try { prepared = prepareBentralGuestMessage(JSON.parse(row.payload)) }
      catch { continue } // dependency not ready; no message may be claimed yet
      if (!prepared) {
        db.prepare("UPDATE integration_outbox SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?").run(now(), now(), row.id)
        continue
      }
      const token = randomUUID()
      const claimed = db.prepare("UPDATE integration_outbox SET status = 'processing', updated_at = ? WHERE id = ? AND status = 'pending'").run(now(), row.id)
      if (!claimed.changes) continue
      db.prepare('INSERT OR REPLACE INTO bentral_message_leases (outbox_id, token) VALUES (?, ?)').run(row.id, token)
      return { id: row.id, leaseToken: token, ...prepared }
    }
    return null
  })()
}

export function acknowledgeWindowsMessage(body: unknown) {
  if (!body || typeof body !== 'object') throw new Error('Invalid message result')
  const result = body as Record<string, unknown>
  if (!Number.isSafeInteger(result.id) || Number(result.id) <= 0 || typeof result.leaseToken !== 'string'
    || !['sent', 'rejected', 'unknown'].includes(String(result.status))) throw new Error('Invalid message result')
  leaseTable()
  const db = getDb()
  return db.transaction(() => {
    const row = db.prepare(`SELECT o.status FROM integration_outbox o JOIN bentral_message_leases l ON l.outbox_id = o.id
      WHERE o.id = ? AND l.token = ? AND o.type = 'bentral_guest_message'`).get(result.id, result.leaseToken) as { status: string } | undefined
    if (!row) throw new Error('Unknown message lease')
    if (row.status !== 'processing') return { success: true, duplicate: true }
    const sent = result.status === 'sent'
    const reason = sent ? null : result.status === 'unknown'
      ? 'Windows delivery unknown. Check Bentral conversation before manual retry.'
      : 'Bentral rejected the Windows delivery. Check configuration before manual retry.'
    db.prepare(`UPDATE integration_outbox SET status = ?, completed_at = ?, updated_at = ?, last_error = ?, attempt_count = attempt_count + 1 WHERE id = ?`)
      .run(sent ? 'completed' : 'failed', sent ? now() : null, now(), reason, result.id)
    return { success: true, duplicate: false }
  })()
}
