export const bentralIntervalRules = {
  hot_interval_minutes: { min: 5, max: 120, fallback: 30, unit: 60_000 },
  warm_interval_hours: { min: 1, max: 24, fallback: 5, unit: 3_600_000 },
  cold_interval_hours: { min: 12, max: 168, fallback: 24, unit: 3_600_000 },
} as const

export function validBentralInterval(key: keyof typeof bentralIntervalRules, value: unknown): boolean {
  const rule = bentralIntervalRules[key]
  return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isInteger(Number(value)) && Number(value) >= rule.min && Number(value) <= rule.max
}

export function bentralIntervals(settings: Record<string, string>) {
  const duration = (key: keyof typeof bentralIntervalRules) => {
    const rule = bentralIntervalRules[key]
    return (validBentralInterval(key, settings[key]) ? Number(settings[key]) : rule.fallback) * rule.unit
  }
  return { hot: duration('hot_interval_minutes'), warm: duration('warm_interval_hours'), cold: duration('cold_interval_hours') }
}
