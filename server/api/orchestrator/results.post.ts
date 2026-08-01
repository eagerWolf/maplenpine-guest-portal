import { randomUUID } from 'crypto'
import { getDb, now, guestTokenExpiry } from '../../db/index'
import type { Job, Reservation } from '../../db/index'
import { updateJobResult } from '../../utils/jobs'
import { notifyAdmins } from '../../utils/notify'
import { hasValidOrchestratorToken, parseOrchestratorResults } from '../../utils/orchestrator'
import { enqueueIntegration } from '../../utils/integrationOutbox'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const configuredKey = (getDb().prepare('SELECT value FROM app_settings WHERE key = ?').get('orchestrator_api_key') as { value: string } | undefined)?.value?.trim()
  const authHeader = getHeader(event, 'authorization')

  if (!hasValidOrchestratorToken(configuredKey, authHeader)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  let results
  try {
    results = parseOrchestratorResults(await readBody<unknown>(event))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const db = getDb()
  const heartbeat = now()
  db.prepare(`
    INSERT INTO app_settings (key, value, updated_at) VALUES ('orchestrator_last_seen', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(heartbeat, heartbeat)

  let processed = 0
  let duplicates = 0
  let unknown = 0
  for (const result of results) {
    let job = result._internalJobId
      ? (db.prepare("SELECT * FROM jobs WHERE id = ?").get(result._internalJobId) as Job | undefined)
      : undefined

    if (!job && result.jobId) {
      job = db.prepare(`
        SELECT j.* FROM jobs j
        JOIN reservations r ON r.id = j.reservation_id
        WHERE r.bentral_reservation_id = ? AND j.status = 'in_progress'
        ORDER BY j.created_at ASC LIMIT 1
      `).get(result.jobId) as Job | undefined
    }

    if (!job) {
      console.warn('[orchestrator:results] Unknown jobId:', result.jobId)
      unknown++
      continue
    }

    if (result.status === 'success' && job.action === 'insert' && !/^\d{4}$/.test(result.pin ?? '')) {
      throw createError({ statusCode: 400, statusMessage: 'Successful insert requires a four-digit PIN' })
    }

    // Result reporting is at-least-once. A repeated result must acknowledge successfully
    // without sending a second PIN message or repeating external side effects.
    if (job.status === 'success' || job.status === 'failed' || job.status === 'superseded') {
      duplicates++
      continue
    }

    const jobPayload = job.payload ? JSON.parse(job.payload) : {}
    const mergedJobIds: number[] = jobPayload._mergedJobIds ?? []
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(job.reservation_id) as Reservation | undefined
    db.transaction(() => {
      updateJobResult(job.id, result.status, { ...result }, result.reason)
      for (const siblingId of mergedJobIds) updateJobResult(siblingId, result.status, { ...result }, result.reason)
      if (!reservation || result.status !== 'success') return
      if (job.action === 'insert' && result.pin) {
        db.prepare('UPDATE reservations SET pin = ?, updated_at = ? WHERE id = ?').run(result.pin, now(), reservation.id)
        const token = randomUUID()
        db.prepare('INSERT INTO guest_tokens (reservation_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)')
          .run(reservation.id, token, guestTokenExpiry(reservation.check_out), now())
        const portalLink = `${config.public.baseUrl}/guest/${token}`
        enqueueIntegration(`ekey-job:${job.id}:guest-pin`, 'guest_pin_email', { reservationId: reservation.id, pin: result.pin, portalLink })
        enqueueIntegration(`ekey-job:${job.id}:bentral`, 'bentral_ekey', { reservationId: reservation.id, pin: result.pin })
      } else if (job.action === 'update' && reservation.pin) {
        enqueueIntegration(`ekey-job:${job.id}:bentral`, 'bentral_ekey', { reservationId: reservation.id, pin: reservation.pin })
      } else if (job.action === 'cancel') {
        db.prepare('UPDATE reservations SET pin = NULL, updated_at = ? WHERE id = ?').run(now(), reservation.id)
      }
    })()
    processed++
    if (!reservation) continue

    const guestName = `${reservation.first_name} ${reservation.last_name}`

    if (result.status === 'success') {
      if (job.action === 'insert' && result.pin) {
        const doorDisplay = reservation.door === 'Maple,Pine' ? 'Maple & Pine' : reservation.door
        await notifyAdmins({
          event: 'pin_added',
          subject: `✓ PIN dodan — ${guestName}`,
          emailHtml: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#2d6a4f">PIN koda uspešno dodana</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${guestName}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Vrata</td><td style="padding:6px 0">${doorDisplay}</td></tr>
                <tr><td style="padding:6px 0;color:#888">PIN</td><td style="padding:6px 0;font-family:monospace;font-size:18px;font-weight:700">${result.pin}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Veljavno od</td><td style="padding:6px 0">${reservation.access_valid_from ?? reservation.check_in}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Veljavno do</td><td style="padding:6px 0">${reservation.access_valid_until ?? reservation.check_out}</td></tr>
              </table>
            </div>
          `,
          whatsappText: `✓ PIN dodan — ${guestName} (${doorDisplay})\nPIN: ${result.pin}\nOd: ${reservation.access_valid_from ?? reservation.check_in}\nDo: ${reservation.access_valid_until ?? reservation.check_out}`,
        }).catch(() => {})

      } else if (job.action === 'update') {
        const triggeredBy = job.triggered_by === 'bentral_sync' ? 'Bentral sync' : (job.triggered_by ?? 'unknown')
        await notifyAdmins({
          event: 'pin_updated',
          subject: `✎ Dostop posodobljen — ${guestName}`,
          emailHtml: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#bc4749">Dostop posodobljen</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${guestName}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Nova veljavnost od</td><td style="padding:6px 0">${reservation.access_valid_from ?? reservation.check_in}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Nova veljavnost do</td><td style="padding:6px 0">${reservation.access_valid_until ?? reservation.check_out}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Sprožil</td><td style="padding:6px 0">${triggeredBy}</td></tr>
              </table>
            </div>
          `,
          whatsappText: `✎ Dostop posodobljen — ${guestName}\nOd: ${reservation.access_valid_from ?? reservation.check_in}\nDo: ${reservation.access_valid_until ?? reservation.check_out}\nSprožil: ${triggeredBy}`,
        }).catch(() => {})
      }
    } else if (result.status === 'failed') {
      await notifyAdmins({
        event: 'job_failed',
        subject: `✗ Napaka pri jobu — ${guestName}`,
        emailHtml: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#bc4749">Napaka pri izvedbi joba</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${guestName}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Akcija</td><td style="padding:6px 0">${job.action}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Razlog</td><td style="padding:6px 0;color:#bc4749">${result.reason ?? result.message ?? 'Unknown error'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Job ID</td><td style="padding:6px 0;font-family:monospace">${job.id}</td></tr>
            </table>
          </div>
        `,
        whatsappText: `✗ Napaka pri jobu — ${guestName}\nAkcija: ${job.action}\nRazlog: ${result.reason ?? result.message ?? 'Unknown error'}\nJob ID: ${job.id}`,
      }).catch(() => {})
    }
  }

  return { success: true, processed, duplicates, unknown }
})
