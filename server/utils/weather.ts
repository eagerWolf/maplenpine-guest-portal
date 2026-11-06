const URL = 'https://vreme.arso.gov.si/api/1.0/location/?location=Bled'
const TTL = 15 * 60_000
const MAX_AGE = 6 * 60 * 60_000

export function condition(icon: unknown) {
  const value = String(icon || '')
  if (/TS/.test(value)) return 'storm'
  if (/SN|RASN/.test(value)) return 'snow'
  if (/RA|DZ/.test(value)) return 'rain'
  if (/FG/.test(value)) return 'fog'
  if (/^(clear|mostClear)/.test(value)) return 'sun'
  if (/^(slightCloudy|partCloudy|modCloudy)/.test(value)) return 'partly'
  if (/^(prevCloudy|overcast)/.test(value)) return 'cloud'
  return 'unknown'
}
function number(value: unknown) {
  if (value === '' || value == null) return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}
function iso(value: unknown) {
  const stamp = Date.parse(String(value))
  if (!Number.isFinite(stamp)) throw new Error('Invalid ARSO timestamp')
  return new Date(stamp).toISOString()
}
function dateInBled(now: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Ljubljana',
    year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now))
}
export function normalizeWeather(raw: any, now = Date.now()) {
  const forecast = raw?.forecast24h
  const issuedAt = iso(forecast?.tsUpdated)
  if (now - Date.parse(issuedAt) > MAX_AGE || Date.parse(issuedAt) > now + 3600_000) {
    throw new Error('Outdated ARSO forecast')
  }
  const feature = forecast?.features?.find((f: any) => f?.properties?.id === 'METEO-0038_')
  const days = (feature?.properties?.days || [])
    .filter((day: any) => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && day.date >= dateInBled(now))
    .slice(0, 5).map((day: any) => {
      const point = day.timeline?.[0] || {}
      return { date: day.date, min: number(point.tnsyn), max: number(point.txsyn),
        condition: condition(point.clouds_icon_wwsyn_icon),
        windKmh: forecast.params?.ff_val?.unit === 'km/h' ? number(point.ff_val) : null,
        precipitationMm: forecast.params?.tp_24h_acc?.unit === 'mm' ? number(point.tp_24h_acc) : null }
    })
  if (days.length !== 5 || days.some((d: any) => d.min === null || d.max === null)) {
    throw new Error('Incomplete ARSO forecast')
  }
  const observation = raw?.observation?.features?.find((f: any) => f?.properties?.id === 'METEO-0038_')
  const point = observation?.properties?.days?.flatMap((d: any) => d.timeline || []).at(-1)
  const valid = Date.parse(point?.valid)
  const current = point && Number.isFinite(valid) && now - valid < MAX_AGE && valid <= now + 3600_000
    && number(point.t) !== null
    ? { temperature: number(point.t), condition: condition(point.clouds_icon_wwsyn_icon),
        validAt: new Date(valid).toISOString(), kind: 'nowcast' as const } : null
  return { location: 'Bled', source: 'ARSO', issuedAt, current, days }
}

// One process-wide cache shared by all devices. Coalesce simultaneous requests;
// retry failed upstream requests at most once a minute.
export function createWeatherService(fetchData: () => Promise<unknown>, clock = Date.now) {
  let cached: ReturnType<typeof normalizeWeather> | undefined
  let fetchedAt = 0
  let retryAfter = 0
  let inFlight: Promise<void> | undefined
  return async () => {
    const now = clock()
    if ((!cached || now - fetchedAt >= TTL || cached.days[0]?.date !== dateInBled(now)) && now >= retryAfter) {
      if (!inFlight) {
        inFlight = (async () => {
          try {
            cached = normalizeWeather(await fetchData(), clock())
            fetchedAt = clock()
            retryAfter = 0
          } catch {
            retryAfter = clock() + 60_000
          } finally {
            inFlight = undefined
          }
        })()
      }
      await inFlight
    }
    if (!cached || clock() - Date.parse(cached.issuedAt) > MAX_AGE
      || cached.days[0]?.date !== dateInBled(clock())) {
      throw createError({ statusCode: 503, statusMessage: 'Weather temporarily unavailable' })
    }
    return { ...cached, fetchedAt: new Date(fetchedAt).toISOString(),
      stale: clock() - fetchedAt >= TTL || clock() - Date.parse(cached.issuedAt) > 3 * 3600_000 }
  }
}
export const getWeather = createWeatherService(async () => {
  const response = await fetch(URL, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('ARSO unavailable')
  return response.json()
})
