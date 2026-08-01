import { getDb, now } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'
import { buildJobPayload } from '../../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = Number(getRouterParam(event, 'id'))
  const { pin: rawPin } = await readBody<{ pin?: string }>(event)
  const pin = String(rawPin ?? '').trim()

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljavna rezervacija' })
  }
  if (!/^\d{4}$/.test(pin)) {
    throw createError({ statusCode: 400, statusMessage: 'PIN mora vsebovati natanko 4 številke' })
  }

  const db = getDb()
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined
  if (!reservation) throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  if (reservation.status === 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Preklicane rezervacije ni mogoče prevzeti' })
  }

  const running = db.prepare(`
    SELECT id FROM jobs WHERE reservation_id = ? AND status = 'in_progress' LIMIT 1
  `).get(id) as { id: number } | undefined
  if (running) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Orchestrator to rezervacijo že obdeluje. Počakaj na rezultat in poskusi ponovno.',
    })
  }

  const ts = now()
  const payload = buildJobPayload(reservation, 'insert')
  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE jobs SET status = 'superseded', reason = ?, updated_at = ?
      WHERE reservation_id = ? AND status = 'pending'
    `).run('Koda prevzeta iz obstoječega eKey vnosa', ts, id)

    db.prepare('UPDATE reservations SET pin = ?, updated_at = ? WHERE id = ?').run(pin, ts, id)

    // Ta zaključeni zapis je dokaz, da sme čiščenje prevzeti MPAUTO vnos upravljati.
    db.prepare(`
      INSERT INTO jobs (reservation_id, action, status, triggered_by, payload, result, created_at, updated_at)
      VALUES (?, 'insert', 'success', 'manual_migration', ?, ?, ?, ?)
    `).run(
      id,
      JSON.stringify(payload),
      JSON.stringify({ status: 'success', pin, adopted: true }),
      ts,
      ts,
    )

    db.prepare(`
      INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
      VALUES (?, ?, 'adopt_existing_pin', ?, ?)
    `).run(
      session.user.id,
      session.user.email,
      JSON.stringify({
        reservation_id: id,
        bentral_id: reservation.bentral_reservation_id,
        guest: `${reservation.first_name} ${reservation.last_name}`,
      }),
      ts,
    )
  })

  transaction()
  return { success: true }
})
