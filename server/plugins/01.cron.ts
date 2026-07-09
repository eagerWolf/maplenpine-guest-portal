import cron from 'node-cron'
import { syncBentral } from '../utils/sync'
import { notifyHousekeeper, notifyReception } from '../utils/notify'
import { getDb } from '../db/index'
import { useRuntimeConfig } from '#imports'

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

async function runHousekeeperReminders(): Promise<void> {
  const db = getDb()
  const tomorrow = addDays(new Date(), 1)
  const checkouts = db.prepare(`
    SELECT id, door FROM reservations
    WHERE check_out = ? AND status = 'active'
  `).all(tomorrow) as Array<{ id: number; door: string }>

  for (const res of checkouts) {
    await notifyHousekeeper(res.id, res.door).catch(err =>
      console.error('[cron:housekeeper]', err),
    )
  }

  if (checkouts.length) {
    console.log(`[cron:housekeeper] Processed ${checkouts.length} checkout(s) for ${tomorrow}`)
  }
}

async function runReceptionReminders(): Promise<void> {
  const db = getDb()
  const tomorrow = addDays(new Date(), 1)
  const arrivals = db.prepare(`
    SELECT id, door FROM reservations
    WHERE check_in = ? AND status = 'active'
  `).all(tomorrow) as Array<{ id: number; door: string }>

  for (const res of arrivals) {
    await notifyReception(res.id, res.door).catch(err =>
      console.error('[cron:reception]', err),
    )
  }

  if (arrivals.length) {
    console.log(`[cron:reception] Processed ${arrivals.length} arrival(s) for ${tomorrow}`)
  }
}

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()

  const hotExpr = config.bentralHotCron || '*/30 * * * *'
  const warmExpr = config.bentralWarmCron || '0 */5 * * *'
  const coldExpr = config.bentralColdCron || '0 3 * * *'
  const hkExpr = config.housekeeperCron || '0 10 * * *'

  function isSyncEnabled(): boolean {
    const db = getDb()
    const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('auto_sync_bentral') as { value: string } | undefined
    return row ? row.value !== '0' : true
  }

  cron.schedule(hotExpr, () => {
    if (!isSyncEnabled()) return
    syncBentral('hot').catch(err => console.error('[cron:hot]', err))
  })

  cron.schedule(warmExpr, () => {
    if (!isSyncEnabled()) return
    syncBentral('warm').catch(err => console.error('[cron:warm]', err))
  })

  cron.schedule(coldExpr, () => {
    if (!isSyncEnabled()) return
    syncBentral('cold').catch(err => console.error('[cron:cold]', err))
  })

  cron.schedule(hkExpr, () => {
    runHousekeeperReminders().catch(err => console.error('[cron:housekeeper]', err))
    runReceptionReminders().catch(err => console.error('[cron:reception]', err))
  })

  // Run hot sync once on startup
  setImmediate(() => {
    if (!isSyncEnabled()) return
    syncBentral('hot').catch(err => console.error('[cron:startup]', err))
  })

  console.log('[cron] Scheduled — hot:', hotExpr, '| warm:', warmExpr, '| cold:', coldExpr, '| housekeeper:', hkExpr)
})
