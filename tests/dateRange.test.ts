import { describe, expect, it } from 'vitest'
import { isActiveToday, validateContentDates } from '../server/utils/dateRange'

describe('veljavnost vsebin', () => {
  it('vnos brez obdobja je vedno aktiven', () => expect(isActiveToday(null, null, false, '2026-08-01')).toBe(true))
  it('upošteva enkratno obdobje', () => {
    expect(isActiveToday('2026-07-01', '2026-08-31', false, '2026-08-01')).toBe(true)
    expect(isActiveToday('2026-07-01', '2026-08-31', false, '2026-09-01')).toBe(false)
  })
  it('upošteva vsakoletno obdobje', () => {
    expect(isActiveToday('06-01', '08-31', true, '2030-07-15')).toBe(true)
    expect(isActiveToday('06-01', '08-31', true, '2030-12-15')).toBe(false)
  })
  it('podpira zimsko obdobje čez novo leto', () => {
    expect(isActiveToday('12-01', '02-28', true, '2030-01-15')).toBe(true)
    expect(isActiveToday('12-01', '02-28', true, '2030-07-15')).toBe(false)
  })
  it('normalizira prazne datume', () => expect(validateContentDates('', undefined, false)).toEqual({ validFrom: null, validTo: null }))
  it('zavrne napačen format in obrnjen interval', () => {
    expect(() => validateContentDates('08-01', null, false)).toThrow('YYYY-MM-DD')
    expect(() => validateContentDates('2026-09-01', '2026-08-01', false)).toThrow('mora biti pred')
  })
})
