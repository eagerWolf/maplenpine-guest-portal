import { randomUUID } from 'crypto'
import { getDb, now } from '../../db/index'
import type { Job, Reservation } from '../../db/index'
import { updateJobResult, getSettings, computeDisplayFrom, computeDisplayUntil } from '../../utils/jobs'
import { sendGuestPin } from '../../utils/email'
import { sendBentralMessage, buildBentralPinMessage } from '../../utils/bentral'
import { notifyAdmins } from '../../utils/notify'

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
        db.prepare('UPDATE reservations SET pin = ?, updated_at = ? WHERE id = ?')
          .run(result.pin, now(), reservation.id)

        const token = randomUUID()
        const expiresAt = new Date(
          new Date(reservation.check_out + 'T00:00:00').getTime() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString()
        db.prepare('INSERT INTO guest_tokens (reservation_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)')
          .run(reservation.id, token, expiresAt, now())

        const portalLink = `${config.public.baseUrl}/guest/${token}`

        if (reservation.guest_email && config.resendApiKey) {
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
          }).catch(async (err) => {
            console.error('[email:guest]', err)
            const errMsg = err instanceof Error ? err.message : String(err)
            await notifyAdmins({
              event: 'pin_send_failed',
              subject: `⚠ Napaka pri pošiljanju PIN gostom — ${guestName}`,
              emailHtml: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
                  <h2 style="color:#bc4749">Napaka pri pošiljanju PIN gostom</h2>
                  <table style="width:100%;border-collapse:collapse">
                    <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${guestName}</td></tr>
                    <tr><td style="padding:6px 0;color:#888">Email gosta</td><td style="padding:6px 0">${reservation.guest_email}</td></tr>
                    <tr><td style="padding:6px 0;color:#888">Napaka</td><td style="padding:6px 0;color:#bc4749;font-family:monospace">${errMsg}</td></tr>
                  </table>
                </div>
              `,
              whatsappText: `⚠ Napaka pri pošiljanju PIN gostom ${guestName}\nEmail: ${reservation.guest_email}\nNapaka: ${errMsg}`,
            }).catch(() => {})
          })
        }

        if (config.bentralApiKey) {
          const settings = getSettings()
          const bentralMsg = buildBentralPinMessage(
            guestName,
            reservation.door,
            result.pin,
            portalLink,
            computeDisplayFrom(reservation, settings),
            computeDisplayUntil(reservation, settings),
          )
          await sendBentralMessage(config.bentralApiKey, reservation.bentral_reservation_id, bentralMsg)
            .catch(async (err) => {
              console.error('[bentral:message]', err)
              const errMsg = err instanceof Error ? err.message : String(err)
              await notifyAdmins({
                event: 'pin_send_failed',
                subject: `⚠ Napaka pri Bentral sporočilu — ${guestName}`,
                emailHtml: `
                  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
                    <h2 style="color:#bc4749">Napaka pri pošiljanju Bentral sporočila</h2>
                    <table style="width:100%;border-collapse:collapse">
                      <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${guestName}</td></tr>
                      <tr><td style="padding:6px 0;color:#888">Napaka</td><td style="padding:6px 0;color:#bc4749;font-family:monospace">${errMsg}</td></tr>
                    </table>
                  </div>
                `,
                whatsappText: `⚠ Napaka pri Bentral sporočilu za ${guestName}\nNapaka: ${errMsg}`,
              }).catch(() => {})
            })
        }

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

  return { success: true }
})
