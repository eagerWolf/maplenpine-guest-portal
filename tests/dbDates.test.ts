import { describe, expect, it } from 'vitest'
import { guestTokenExpiry } from '../server/db/index'

describe('veljavnost guest portala', () => {
  it('poteče ob lokalni polnoči dan po odhodu', () => {
    const expected = new Date('2026-08-01T00:00:00').getTime() + 24 * 60 * 60 * 1000
    expect(new Date(guestTokenExpiry('2026-08-01')).getTime()).toBe(expected)
  })
})
