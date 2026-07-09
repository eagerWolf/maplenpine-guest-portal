import { getDb, now } from '../../../../db/index'
import type { Reservation } from '../../../../db/index'
import { patchBentralEntranceCode } from '../../../../utils/bentral'
import { getSettings, computeDisplayFrom, computeDisplayUntil } from '../../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!['admin', 'staff'].includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const config = useRuntimeConfig()
  if (!config.bentralApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Bentral API ključ ni nastavljen' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as Reservation | undefined
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  }
  if (!reservation.pin) {
    throw createError({ statusCode: 400, statusMessage: 'PIN ni dodeljen' })
  }

  const settings = getSettings()

  const parseTime = (dt: string | null, fallbackDate: string, fallbackTime: string) => {
    if (dt) { const [d = '', t = ''] = dt.split(' '); if (d && t) return { date: d, time: t } }
    return { date: fallbackDate, time: fallbackTime }
  }
  const checkin = parseTime(computeDisplayFrom(reservation, settings), reservation.check_in, '15:00')
  const checkout = parseTime(computeDisplayUntil(reservation, settings), reservation.check_out, '11:00')

  const buildUnits = (unitId: string | null, unitName: string | null) => {
    if (!unitId || !unitName) return []
    return unitId.split(',').map((id, i) => ({ id, name: unitName.split(',')[i] ?? '' })).filter(u => u.id && u.name)
  }

  const primaryUnits = buildUnits(reservation.bentral_unit_id, reservation.bentral_unit_name)
  if (primaryUnits.length > 0) {
    await patchBentralEntranceCode(
      config.bentralApiKey,
      reservation.bentral_reservation_id,
      primaryUnits,
      reservation.pin,
      checkin.date, checkin.time,
      checkout.date, checkout.time,
    )
  }

  if (reservation.bentral_paired_reservation_id) {
    const pairedUnits = buildUnits(reservation.bentral_paired_unit_id, reservation.bentral_paired_unit_name)
    if (pairedUnits.length > 0) {
      await patchBentralEntranceCode(
        config.bentralApiKey,
        reservation.bentral_paired_reservation_id,
        pairedUnits,
        reservation.pin,
        checkin.date, checkin.time,
        checkout.date, checkout.time,
      )
    }
  }

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'send_pin_bentral', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({
      reservation_id: reservation.id,
      name: `${reservation.first_name} ${reservation.last_name}`,
      bentral_id: reservation.bentral_reservation_id,
    }),
    now(),
  )

  return { ok: true }
})