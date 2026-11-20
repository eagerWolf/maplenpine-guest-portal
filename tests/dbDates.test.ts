import { describe, expect, it } from 'vitest'
import { guestTokenExpiry } from '../server/db/index'

describe('veljavnost guest portala', () => {
  it('poteče ob 13:00 po slovenskem poletnem času na dan odhoda', () => {
    expect(guestTokenExpiry('2026-08-01')).toBe('2026-08-01T11:00:00.000Z')
  })
  it('poteče ob 13:00 po slovenskem zimskem času na dan odhoda', () => {
    expect(guestTokenExpiry('2026-12-03')).toBe('2026-12-03T12:00:00.000Z')
  })
})
