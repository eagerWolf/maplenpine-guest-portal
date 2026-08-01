import { describe, expect, it } from 'vitest'
import { formatDateLocal, parseName } from '../server/utils/bentral'

describe('Bentral podatki', () => {
  it('razdeli ime in priimek', () => {
    expect(parseName('Ana Marija Novak')).toEqual({ firstName: 'Ana', lastName: 'Marija Novak' })
    expect(parseName('Ana')).toEqual({ firstName: 'Ana', lastName: '' })
  })
  it('združi lokalni datum in uro brez pretvorbe časovnega pasu', () => expect(formatDateLocal('2026-08-01', '15:00')).toBe('2026-08-01 15:00'))
})
