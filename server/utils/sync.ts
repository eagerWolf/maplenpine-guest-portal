import { getDb, now } from '../db/index'
import type { Reservation } from '../db/index'
import { fetchBentralReservations, parseName } from './bentral'
import type { BentralReservation } from './bentral'
import { buildAccessTimes, buildJobPayload, createJob, getSettings } from './jobs'
import { notifyAdmins } from './notify'
import { useRuntimeConfig } from '#imports'

type Tier = 'hot' | 'warm' | 'cold'

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function datesOverlap(from1: string, to1: string, from2: string, to2: string): boolean {
  return from1 <= to2 && from2 <= to1
}

export async function syncBentral(tier: Tier, triggeredBy = 'cron'): Promise<void> {
  const config = useRuntimeConfig()
  const db = getDb()
  const today = new Date()

  const ranges: Record<Tier, { from: string; to: string }> = {
    hot: { from: addDays(today, 0), to: addDays(today, 1) },
    warm: { from: addDays(today, 1), to: addDays(today, 7) },
    cold: { from: addDays(today, 7), to: addDays(today, 365) },
  }

  const { from, to } = ranges[tier]

  const dbApiKey = (db.prepare("SELECT value FROM app_settings WHERE key = 'bentral_api_key'").get() as { value: string } | undefined)?.value
  const bentralApiKey = dbApiKey || config.bentralApiKey

  let bentralReservations: BentralReservation[]
  try {
    bentralReservations = await fetchBentralReservations(
      from,
      to,
      bentralApiKey,
      config.bentralPropertyId,
    )
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`[sync:${tier}] Bentral fetch error: ${errMsg}`)
    db.prepare(`INSERT INTO audit_log (action, user_email, detail, created_at) VALUES (?, ?, ?, ?)`)
      .run('sync_error', triggeredBy, JSON.stringify({ tier, from, to, error: errMsg }), now())
    await notifyAdmins({
      event: 'sync_error',
      subject: `⚠ Bentral sync napaka — ${tier}`,
      emailHtml: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#bc4749">Napaka pri Bentral sinhronizaciji</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888">Tier</td><td style="padding:6px 0;font-weight:600">${tier}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Razpon</td><td style="padding:6px 0">${from} → ${to}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Napaka</td><td style="padding:6px 0;color:#bc4749;font-family:monospace">${errMsg}</td></tr>
          </table>
        </div>
      `,
      whatsappText: `⚠ Bentral sync napaka (${tier})\n${from} → ${to}\n${errMsg}`,
    }).catch(() => {})
    return
  }

  const settings = getSettings()
  const mapleUnitId = config.bentralUnitIdMaple
  const pineUnitId = config.bentralUnitIdPine

  let inserted = 0
  let updated = 0
  let cancelled = 0

  // Group by guest name to detect multi-door overlaps
  const byGuest = new Map<string, { maple?: BentralReservation; pine?: BentralReservation }>()
  for (const res of bentralReservations) {
    const key = res.guest.name.toLowerCase().trim()
    const entry = byGuest.get(key) ?? {}
    const unitIds = res.units.map(u => u.id)
    if (unitIds.includes(mapleUnitId)) entry.maple = res
    if (unitIds.includes(pineUnitId)) entry.pine = res
    byGuest.set(key, entry)
  }

  // Build resolved list: multi-door pairs merged into one entry
  const processedBentralIds = new Set<string>()

  for (const [, entry] of byGuest) {
    const { maple, pine } = entry

    if (maple && pine && datesOverlap(maple.arrival, maple.departure, pine.arrival, pine.departure)) {
      processedBentralIds.add(pine.id)
      const action = await processReservation(maple, 'Maple,Pine', settings, pine)
      if (action === 'insert') inserted++
      else if (action === 'update') updated++
      else if (action === 'cancel') cancelled++
    } else {
      if (maple) {
        const action = await processReservation(maple, 'Maple', settings)
        if (action === 'insert') inserted++
        else if (action === 'update') updated++
        else if (action === 'cancel') cancelled++
      }
      if (pine) {
        const action = await processReservation(pine, 'Pine', settings)
        if (action === 'insert') inserted++
        else if (action === 'update') updated++
        else if (action === 'cancel') cancelled++
      }
    }
  }

  // Process any reservations not grouped by the guest map
  for (const res of bentralReservations) {
    if (processedBentralIds.has(res.id)) continue
    const unitIds = res.units.map(u => u.id)
    let door = 'Maple'
    if (unitIds.includes(pineUnitId) && !unitIds.includes(mapleUnitId)) door = 'Pine'
    if (unitIds.includes(mapleUnitId) && unitIds.includes(pineUnitId)) door = 'Maple,Pine'

    const key = res.guest.name.toLowerCase().trim()
    const entry = byGuest.get(key)
    if (entry?.maple?.id === res.id || entry?.pine?.id === res.id) continue

    const action = await processReservation(res, door, settings)
    if (action === 'insert') inserted++
    else if (action === 'update') updated++
    else if (action === 'cancel') cancelled++
  }

  db.prepare(`INSERT INTO audit_log (action, user_email, detail, created_at) VALUES (?, ?, ?, ?)`)
    .run('sync_run', triggeredBy, JSON.stringify({ tier, from, to, fetched: bentralReservations.length, inserted, updated, cancelled }), now())

  console.log(`[sync:${tier}] Done — fetched ${bentralReservations.length}, inserted ${inserted}, updated ${updated}, cancelled ${cancelled}`)
}

type SyncAction = 'insert' | 'update' | 'cancel' | 'skip'

async function processReservation(
  br: BentralReservation,
  door: string,
  settings: Record<string, string>,
  pairedRes?: BentralReservation,
): Promise<SyncAction> {
  const db = getDb()
  const { firstName, lastName } = parseName(br.guest.name)

  const existing = db.prepare(
    'SELECT * FROM reservations WHERE bentral_reservation_id = ?',
  ).get(br.id) as Reservation | undefined

  const effectiveUpdated = pairedRes && pairedRes.updated > br.updated ? pairedRes.updated : br.updated

  if (existing && existing.bentral_updated_at === effectiveUpdated) {
    return 'skip'
  }

  const bentralStatus = br.status
  const bentralArrival = br.arrival
  const bentralDeparture = pairedRes
    ? (pairedRes.departure > br.departure ? pairedRes.departure : br.departure)
    : br.departure
  const bentralUnitId = br.units.map(u => u.id).join(',')
  const { validFrom, validUntil } = buildAccessTimes(bentralArrival, bentralDeparture, settings)

  if (!existing) {
    if (bentralStatus === 'canceled') return 'skip'

    const ts = now()
    const guestCount = br.persons ?? null
    const guestLang = br.guest.lang ?? null
    const insertResult = db.prepare(`
      INSERT INTO reservations (
        bentral_reservation_id, door, first_name, last_name, check_in, check_out,
        status, access_valid_from, access_valid_until,
        guest_count, guest_email, guest_phone, guest_lang,
        bentral_arrival, bentral_departure, bentral_status, bentral_unit_id, bentral_updated_at,
        created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      br.id, door, firstName, lastName, bentralArrival, bentralDeparture,
      'active', validFrom, validUntil,
      guestCount, br.guest.email ?? null, br.guest.phone ?? null, guestLang,
      bentralArrival, bentralDeparture, bentralStatus, bentralUnitId, effectiveUpdated,
      ts, ts,
    )

    const reservationId = insertResult.lastInsertRowid as number
    const payload = buildJobPayload(
      { ...{ id: reservationId, bentral_reservation_id: br.id, door, first_name: firstName, last_name: lastName, access_valid_from: validFrom, access_valid_until: validUntil } } as Reservation,
      'insert',
    )
    createJob(reservationId, 'insert', payload, 'bentral_sync')
    return 'insert'
  }

  const dateChanged = existing.bentral_arrival !== bentralArrival || existing.bentral_departure !== bentralDeparture
  const statusChanged = existing.bentral_status !== bentralStatus
  const isCancelled = bentralStatus === 'canceled'

  db.prepare(`
    UPDATE reservations SET
      bentral_arrival = ?, bentral_departure = ?, bentral_status = ?,
      bentral_unit_id = ?, bentral_updated_at = ?, updated_at = ?
    WHERE id = ?
  `).run(bentralArrival, bentralDeparture, bentralStatus, bentralUnitId, effectiveUpdated, now(), existing.id)

  if (statusChanged && isCancelled && existing.status !== 'cancelled') {
    db.prepare(`UPDATE reservations SET status = 'cancelled', updated_at = ? WHERE id = ?`)
      .run(now(), existing.id)
    const payload = buildJobPayload(existing, 'cancel')
    createJob(existing.id, 'cancel', payload, 'bentral_sync')
    return 'cancel'
  }

  if (dateChanged && !isCancelled) {
    const { validFrom: newFrom, validUntil: newUntil } = buildAccessTimes(bentralArrival, bentralDeparture, settings)
    db.prepare(`
      UPDATE reservations SET
        check_in = ?, check_out = ?, access_valid_from = ?, access_valid_until = ?, updated_at = ?
      WHERE id = ?
    `).run(bentralArrival, bentralDeparture, newFrom, newUntil, now(), existing.id)
    const updatedRes = { ...existing, door, access_valid_from: newFrom, access_valid_until: newUntil }
    const payload = buildJobPayload(updatedRes, 'update')
    createJob(existing.id, 'update', payload, 'bentral_sync')
    return 'update'
  }

  return 'skip'
}
