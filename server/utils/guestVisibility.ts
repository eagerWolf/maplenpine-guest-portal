import { fromZonedTime } from 'date-fns-tz'

// Use the property's local check-in time, independent of the server timezone.
export function guestDetailsVisibility(arrival: string, now = new Date()) {
  const checkIn = fromZonedTime(arrival, 'Europe/Ljubljana')
  const availableAt = new Date(checkIn.getTime() - 72 * 60 * 60 * 1000)
  return {
    detailsAvailable: Number.isFinite(availableAt.getTime()) && now.getTime() >= availableAt.getTime(),
    detailsAvailableAt: Number.isFinite(availableAt.getTime()) ? availableAt.toISOString() : null,
  }
}
