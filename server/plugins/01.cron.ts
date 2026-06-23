import cron from 'node-cron'
import { syncBentral } from '../utils/sync'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()

  const hotExpr = config.bentralHotCron || '*/30 * * * *'
  const warmExpr = config.bentralWarmCron || '0 */5 * * *'
  const coldExpr = config.bentralColdCron || '0 3 * * *'

  cron.schedule(hotExpr, () => {
    syncBentral('hot').catch(err => console.error('[cron:hot]', err))
  })

  cron.schedule(warmExpr, () => {
    syncBentral('warm').catch(err => console.error('[cron:warm]', err))
  })

  cron.schedule(coldExpr, () => {
    syncBentral('cold').catch(err => console.error('[cron:cold]', err))
  })

  // Run hot sync once on startup
  setImmediate(() => {
    syncBentral('hot').catch(err => console.error('[cron:startup]', err))
  })

  console.log('[cron] Scheduled — hot:', hotExpr, '| warm:', warmExpr, '| cold:', coldExpr)
})
