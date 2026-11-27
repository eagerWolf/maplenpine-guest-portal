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
    const due = (['hot', 'warm', 'cold'] as const).filter(t => time - last[t] >= intervals[t] || (startup && t === 'hot'))
    if (!due.length) return
    busy = true
    let failure: unknown
    try {
      for (const tier of due) {
        last[tier] = time
        try { await options.run(tier) } catch (err) { failure = err }
      }
      if (failure) throw failure
    } finally { busy = false }
  }
}
