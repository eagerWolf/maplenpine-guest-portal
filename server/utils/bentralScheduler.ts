import { bentralIntervals } from '../../shared/bentralIntervals'

type Tier = 'hot' | 'warm' | 'cold'

// Read settings on each tick: arbitrary hour intervals work without cron-field
// truncation, and saves take effect without restarting the process.
export function createBentralScheduler(options: {
  settings: () => Record<string, string>
  run: (tier: Tier) => Promise<void>
  now?: () => number
}) {
  const clock = options.now ?? Date.now
  const last = { hot: clock(), warm: clock(), cold: clock() }
  let busy = false
  return async (startup = false) => {
    const settings = options.settings()
    if (busy || settings.auto_sync_bentral === '0') return
    const time = clock()
    const intervals = bentralIntervals(settings)
    const tier = (['cold', 'warm', 'hot'] as const).find(t => time - last[t] >= intervals[t]) ?? (startup ? 'hot' : undefined)
    if (!tier) return
    busy = true
    // Wider ranges cover smaller ranges. Count attempts to avoid API storms
    // after errors; a failed request waits for its configured interval.
    for (const t of ['hot', ...(tier !== 'hot' ? ['warm'] : []), ...(tier === 'cold' ? ['cold'] : [])] as Tier[]) last[t] = time
    try { await options.run(tier) } finally { busy = false }
  }
}
