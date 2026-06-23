import { getDb, now } from '../db/index'
import type { Reservation } from '../db/index'
import { fetchBentralReservations, parseName } from './bentral'
import type { BentralReservation } from './bentral'
import { buildAccessTimes, buildJobPayload, createJob, getSettings } from './jobs'
import { sendAdminSyncError } from './email'
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

export async function syncBentral(tier: Tier): Promise<void> {
  const config = useRuntimeConfig()
  const today = new Date()

  const ranges: Record<Tier, { from: string; to: string }> = {
    hot: { from: addDays(today, 0), to: addDays(today, 1) },
    warm: { from: addDays(today, 1), to: addDays(today, 7) },
    cold: { from: addDays(today, 7), to: addDays(today, 365) },
  }

  const { from, to } = ranges[tier]

  let bentralReservations: BentralReservation[]
  try {
    bentralReservations = await fetchBentralReservations(
      from,
      to,
      config.bentralApiKey,
      config.bentralPropertyId,
    )
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`[sync:${tier}] Bentral fetch error: ${errMsg}`)
    if (config.resendApiKey && config.adminEmailTo) {
      await sendAdminSyncError({
        tier,
        dateFrom: from,
        dateTo: to,
        error: errMsg,
        apiKey: config.resendApiKey,
        from: config.adminEmailFrom,
        to: config.adminEmailTo,
      }).catch(() => {})
    }
    return
  }

  const settings = getSettings()
  const mapleUnitId = config.bentralUnitIdMaple
  const pineUnitId = config.bentralUnitIdPine

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
      // Multi-door: process as combined, skip pine separately
      processedBentralIds.add(pine.id)
      await processReservation(maple, 'Maple,Pine', settings, pine)
    } else {
      if (maple) await processReservation(maple, 'Maple', settings)
      if (pine) await processReservation(pine, 'Pine', settings)
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
    // Skip if already handled above
    if (entry?.maple?.id === res.id || entry?.pine?.id === res.id) continue

    await processReservation(res, door, settings)
  }

  console.log(`[sync:${tier}] Done — processed ${bentralReservations.length} reservations`)
}

async function processReservation(
  br: BentralReservation,
  door: string,
  settings: Record<string, string>,
  pairedRes?: BentralReservation,
): Promise<void> {
  const db = getDb()
  const { firstName, lastName } = parseName(br.guest.name)

  // Step 1: Fast filter by bentral_updated_at
  const existing = db.prepare(
    'SELECT * FROM reservations WHERE bentral_reservation_id = ?',
  ).get(br.id) as Reservation | undefined

  // Determine the "effective" updated timestamp (use the latest of main + paired)
  const effectiveUpdated = pairedRes && pairedRes.updated > br.updated ? pairedRes.updated : br.updated

  if (existing && existing.bentral_updated_at === effectiveUpdated) {
    // Nothing changed
    return
  }

  // Step 2: Detailed field comparison
  const bentralStatus = br.status
  const bentralArrival = br.arrival
  const bentralDeparture = pairedRes
    ? (pairedRes.departure > br.departure ? pairedRes.departure : br.departure)
    : br.departure
  const bentralUnitId = br.units.map(u => u.id).join(',')
  const { validFrom, validUntil } = buildAccessTimes(bentralArrival, bentralDeparture, settings)

  if (!existing) {
    // New reservation
    if (bentralStatus === 'canceled') return // Don't track cancelled-before-seen

    const ts = now()
    const guestCount = br.persons ?? null
    const insertResult = db.prepare(`
      INSERT INTO reservations (
        bentral_reservation_id, door, first_name, last_name, check_in, check_out,
        status, access_valid_from, access_valid_until,
        guest_count, guest_email, guest_phone,
        bentral_arrival, bentral_departure, bentral_status, bentral_unit_id, bentral_updated_at,
        created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      br.id, door, firstName, lastName, bentralArrival, bentralDeparture,
      'active', validFrom, validUntil,
      guestCount, br.guest.email ?? null, br.guest.phone ?? null,
      bentralArrival, bentralDeparture, bentralStatus, bentralUnitId, effectiveUpdated,
      ts, ts,
    )

    const reservationId = insertResult.lastInsertRowid as number
    const payload = buildJobPayload(
      { ...{ id: reservationId, bentral_reservation_id: br.id, door, first_name: firstName, last_name: lastName, access_valid_from: validFrom, access_valid_until: validUntil } } as Reservation,
      'insert',
    )
    createJob(reservationId, 'insert', payload, 'bentral_sync')
    return
  }

  // Existing reservation — compare fields
  const dateChanged = existing.bentral_arrival !== bentralArrival || existing.bentral_departure !== bentralDeparture
  const statusChanged = existing.bentral_status !== bentralStatus
  const isCancelled = bentralStatus === 'canceled'

  // Step 4: Always update snapshot
  db.prepare(`
    UPDATE reservations SET
      bentral_arrival = ?, bentral_departure = ?, bentral_status = ?,
      bentral_unit_id = ?, bentral_updated_at = ?, updated_at = ?
    WHERE id = ?
  `).run(bentralArrival, bentralDeparture, bentralStatus, bentralUnitId, effectiveUpdated, now(), existing.id)

  if (statusChanged && isCancelled && existing.status !== 'cancelled') {
    // Cancel
    db.prepare(`UPDATE reservations SET status = 'cancelled', updated_at = ? WHERE id = ?`)
      .run(now(), existing.id)
    const payload = buildJobPayload(existing, 'cancel')
    createJob(existing.id, 'cancel', payload, 'bentral_sync')
  } else if (dateChanged && !isCancelled) {
    // Date update — recalculate access times
    const { validFrom: newFrom, validUntil: newUntil } = buildAccessTimes(bentralArrival, bentralDeparture, settings)
    db.prepare(`
      UPDATE reservations SET
        check_in = ?, check_out = ?, access_valid_from = ?, access_valid_until = ?, updated_at = ?
      WHERE id = ?
    `).run(bentralArrival, bentralDeparture, newFrom, newUntil, now(), existing.id)
    const updated = { ...existing, door, access_valid_from: newFrom, access_valid_until: newUntil }
    const payload = buildJobPayload(updated, 'update')
    createJob(existing.id, 'update', payload, 'bentral_sync')
  }
}
