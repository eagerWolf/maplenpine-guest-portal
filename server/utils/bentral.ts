export interface BentralReservation {
  id: string
  arrival: string       // YYYY-MM-DD
  departure: string     // YYYY-MM-DD
  status: string        // confirmed, canceled, pending, ...
  created?: string      // YYYY-MM-DD HH:MM:SS
  updated: string       // YYYY-MM-DD HH:MM:SS
  units: Array<{ id: string; name?: string }>
  guest: {
    name: string
    email?: string
    phone?: string | { type: string; number: string }
    lang?: string
  }
  persons?: number      // number of guests
  size?: number
}

export interface BentralPropertyTimes {
  checkinFrom: string   // "HH:MM" — earliest check-in
  checkoutTo: string    // "HH:MM" — latest checkout
}

export async function fetchBentralPropertyTimes(
  apiKey: string,
  propertyId: string,
): Promise<BentralPropertyTimes> {
  const url = `https://api.bentral.com/v1/properties/${propertyId}?fields=checkin,checkout`
  const res = await fetch(url, {
    headers: { 'X-API-KEY': apiKey },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Bentral API ${res.status}: ${body}`)
  }
  const data = await res.json() as {
    checkin?: { from?: string; to?: string }
    checkout?: { from?: string; to?: string }
  }
  return {
    checkinFrom: data.checkin?.from ?? '15:00',
    checkoutTo: data.checkout?.to ?? '11:00',
  }
}

interface BentralResponse {
  data?: BentralReservation[]
  reservations?: BentralReservation[]
  size?: number
  total?: number
}

export async function fetchBentralReservations(
  from: string,
  to: string,
  apiKey: string,
): Promise<BentralReservation[]> {
  const all: BentralReservation[] = []
  let offset = 0
  let totalSize: number | null = null

  while (true) {
    const params = new URLSearchParams({
      from,
      to,
      limit: '100',
      offset: String(offset),
      fields: 'id,arrival,departure,status,created,updated,units,guest,persons',
    })
    const url = `https://api.bentral.com/v1/reservations?${params}`

    const res = await fetch(url, {
      headers: { 'X-API-KEY': apiKey },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Bentral API ${res.status}: ${body}`)
    }

    const json = (await res.json()) as BentralResponse
    const batch: BentralReservation[] = json.data ?? json.reservations ?? (json as unknown as BentralReservation[])

    if (!Array.isArray(batch) || batch.length === 0) break

    all.push(...batch)

    if (totalSize === null) {
      totalSize = json.size ?? json.total ?? null
    }

    if (totalSize !== null && all.length >= totalSize) break
    if (batch.length < 100) break

    offset += 100
  }

  return all
}

export function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

export function formatDateLocal(date: string, time: string): string {
  return `${date} ${time}`
}

function parseDt(dt: string | null): { date: string; time: string } {
  if (!dt) return { date: '', time: '' }
  const [datePart = '', timePart = ''] = dt.split(' ')
  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day) return { date: datePart, time: timePart }
  return { date: `${parseInt(day)}. ${parseInt(month)}. ${year}`, time: timePart }
}

function formatDoor(door: string): string {
  if (door.includes(',')) return 'apartmaja Maple in Pine'
  return `apartma ${door}`
}

export async function patchBentralEntranceCode(
  apiKey: string,
  reservationId: string,
  units: Array<{ id: string; name: string }>,
  pin: string,
  checkinDate: string,
  checkinTime: string,
  checkoutDate: string,
  checkoutTime: string,
): Promise<void> {
  const body = JSON.stringify({
    entrance: {
      locks: {
        list: units.map(unit => ({
          unit: { id: unit.id, name: unit.name },
          entranceCode: pin,
          checkinDate,
          checkinTime,
          checkoutDate,
          checkoutTime,
        })),
      },
    },
  })

  const res = await fetch(`https://api.bentral.com/v1/reservations/${reservationId}`, {
    method: 'PATCH',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'text/plain',
    },
    body,
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Bentral eKey PATCH ${res.status}: ${text}`)
  }
}

export async function sendBentralGuestMessage(apiKey: string, reservationId: string, message: string): Promise<void> {
  const res = await fetch('https://api.bentral.com/v1/messages', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'email', reservationId, message }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Bentral message API ${res.status}: ${await res.text()}`)
}
