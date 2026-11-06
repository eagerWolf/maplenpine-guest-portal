import { describe, expect, it, vi } from 'vitest'
import { condition, createWeatherService, normalizeWeather } from '../server/utils/weather'

const start = Date.parse('2026-10-20T10:00:00Z')
function fixture() {
  return {
    forecast24h: { tsUpdated: '2026-10-20T09:00:00Z', params: { ff_val: { unit: 'km/h' }, tp_24h_acc: { unit: 'mm' } }, features: [{ properties: {
      id: 'METEO-0038_', days: ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24'].map(date => ({
        date, timeline: [{ tnsyn: '4', txsyn: '14', ff_val: '6', tp_24h_acc: '0', clouds_icon_wwsyn_icon: 'prevCloudy_lightRA_day' }],
      })),
    } }] },
    observation: { features: [{ properties: { id: 'METEO-0038_', days: [{ timeline: [{
      t: '12', valid: '2026-10-20T09:00:00Z', clouds_icon_wwsyn_icon: 'overcast_day',
    }] }] } }] },
  }
}
describe('ARSO public weather', () => {
  it('normalizes only Bled data, distinguishing nowcast from station measurements', () => {
    const result = normalizeWeather(fixture(), start)
    expect(result.days).toHaveLength(5)
    expect(result.days[0]).toEqual({ date: '2026-10-20', min: 4, max: 14, condition: 'rain', windKmh: 6, precipitationMm: 0 })
    expect(result.current?.kind).toBe('nowcast')
    expect(result.current?.temperature).toBe(12)
  })
  it('rejects outdated, malformed and incomplete forecasts', () => {
    expect(() => normalizeWeather(fixture(), start + 7 * 3600_000)).toThrow()
    expect(() => normalizeWeather({}, start)).toThrow()
    const data = fixture()
    data.forecast24h.features[0]!.properties.days[0]!.timeline[0]!.tnsyn = ''
    expect(() => normalizeWeather(data, start)).toThrow()
  })
  it('maps weather codes including snow, thunder and fog', () => {
    expect(condition('overcast_modTSRA_day')).toBe('storm')
    expect(condition('overcast_RASN_day')).toBe('snow')
    expect(condition('FG_day')).toBe('fog')
    expect(condition(null)).toBe('unknown')
  })
  it('rejects three-day feeds and omits details with unknown units', () => {
    const data = fixture()
    data.forecast24h.params.ff_val.unit = 'm/s'
    expect(normalizeWeather(data, start).days[0]?.windKmh).toBeNull()
    data.forecast24h.features[0]!.properties.days.length = 3
    expect(() => normalizeWeather(data, start)).toThrow('Incomplete')
  })
  it('coalesces requests, caches, retains stale data on failure and expires it', async () => {
    let now = start
    const fetcher = vi.fn(async () => fixture())
    const get = createWeatherService(fetcher, () => now)
    await Promise.all([get(), get(), get()])
    expect(fetcher).toHaveBeenCalledTimes(1)
    await get()
    expect(fetcher).toHaveBeenCalledTimes(1)
    now += 16 * 60_000
    fetcher.mockRejectedValue(new Error('offline'))
    expect((await get()).stale).toBe(true)
    await get()
    expect(fetcher).toHaveBeenCalledTimes(2)
    now += 6 * 3600_000
    await expect(get()).rejects.toMatchObject({ statusCode: 503 })
  })
  it('returns unavailable on initial outage and limits repeated retries', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'))
    const get = createWeatherService(fetcher, () => start)
    await expect(get()).rejects.toMatchObject({ statusCode: 503 })
    await expect(get()).rejects.toMatchObject({ statusCode: 503 })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
