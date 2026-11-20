import { expect, it } from 'vitest'
import { guestDetailsVisibility } from '../server/utils/guestVisibility'

it('keeps details hidden before the exact 72-hour boundary', () => {
  expect(guestDetailsVisibility('2026-12-06 13:00', new Date('2026-12-03T11:59:59Z')).detailsAvailable).toBe(false)
  expect(guestDetailsVisibility('2026-12-06 13:00', new Date('2026-12-03T12:00:00Z')).detailsAvailable).toBe(true)
})
it('uses Slovenia summer time and remains available during the stay', () => {
  expect(guestDetailsVisibility('2026-08-06 13:00', new Date('2026-08-03T11:00:00Z')).detailsAvailable).toBe(true)
  expect(guestDetailsVisibility('2026-08-06 13:00', new Date('2026-08-06T14:00:00Z')).detailsAvailable).toBe(true)
})
it('subtracts 72 elapsed hours across the daylight saving change', () => {
  expect(guestDetailsVisibility('2026-03-30 13:00').detailsAvailableAt).toBe('2026-03-27T11:00:00.000Z')
})
it('fails closed for an invalid arrival', () => {
  expect(guestDetailsVisibility('invalid')).toEqual({ detailsAvailable: false, detailsAvailableAt: null })
})
