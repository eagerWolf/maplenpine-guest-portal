import { getDb, now } from '../../db/index'
import type { BentralReservation } from '../../utils/bentral'
import { processBentralWebhookReservation } from '../../utils/sync'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Payload can be a single reservation object or list-wrapped {size, data:[...]}
  let reservations: BentralReservation[] = []
  if (body?.data && Array.isArray(body.data)) {
    reservations = body.data
  } else if (body?.id) {
    reservations = [body as BentralReservation]
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unrecognised payload' })
  }

  const db = getDb()
  const results: Array<{ id: string; action: string } | { id: string; error: string }> = []

  for (const br of reservations) {
    if (!br.id || !br.status) continue
    try {
      const action = await processBentralWebhookReservation(br)
      db.prepare('INSERT INTO audit_log (action, user_email, detail, created_at) VALUES (?, ?, ?, ?)')
        .run('webhook_bentral', 'webhook', JSON.stringify({ id: br.id, status: br.status, action }), now())
      results.push({ id: br.id, action })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[webhook:bentral]', br.id, msg)
      results.push({ id: br.id, error: msg })
    }
  }

  return { ok: true, results }
})
