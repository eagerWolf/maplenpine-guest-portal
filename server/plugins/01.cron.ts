import { evaluateWorkerWatchdog } from '../utils/workerWatchdog'
import cron from 'node-cron'
import { syncBentral } from '../utils/sync'
import { queueStaffReminders, processStaffNotifications } from '../utils/staffNotifications'
import { getDb } from '../db/index'
import { queueExpiredManagedCodeCleanup } from '../utils/jobs'
import { processIntegrationOutbox } from '../utils/integrationOutbox'
import { checkOrchestratorHealth } from '../utils/orchestratorHealth'
import { notifyAdmins, resolveNotification } from '../utils/notify'
import { backupDatabase } from '../utils/dbBackup'
import { triggerWebsitePublish } from '../utils/websiteContent'
import { createBentralScheduler } from '../utils/bentralScheduler'

async function runBackup() {
  try {
    await backupDatabase()
    await resolveNotification('backup_failed','Napaka varnostne kopije','Varnostna kopija je ponovno uspešno pripravljena.')
  } catch {
    await notifyAdmins({event:'backup_failed',subject:'Napaka varnostne kopije',emailHtml:'<p>Preverite varnostno kopiranje.</p>',whatsappText:'Varnostna kopija portala ni uspela. Preverite strežnik in prostor na disku.'})
  }
}

export default defineNitroPlugin(() => {
  const backgroundDisabled = process.env.PORTAL_DISABLE_BACKGROUND_TASKS === 'true'
  if (process.env.PORTAL_WORKER_WATCHDOG_ENABLED === 'true') {
    setImmediate(() => { try { evaluateWorkerWatchdog() } catch { console.error('[cron:worker-watchdog] Startup check failed') } })
    cron.schedule('* * * * *', () => { try { evaluateWorkerWatchdog() } catch (err) { console.error('[cron:worker-watchdog]',err) } })
  }
  if (!backgroundDisabled || process.env.PORTAL_BENTRAL_SYNC_ENABLED === 'true') {
    const tick = createBentralScheduler({
      settings: () => Object.fromEntries((getDb().prepare('SELECT key, value FROM app_settings WHERE key IN (\'auto_sync_bentral\', \'hot_interval_minutes\', \'warm_interval_hours\', \'cold_interval_hours\')').all() as Array<{key: string; value: string}>).map(row => [row.key, row.value])),
      run: tier => syncBentral(tier),
    })
    cron.schedule('* * * * *', () => { tick().catch(err => console.error('[cron:bentral]', err)) })
    setImmediate(() => { tick(true).catch(err => console.error('[cron:bentral:startup]', err)) })
    console.log('[cron] Bentral sync enabled; live intervals from settings')
  }
  if (process.env.PORTAL_DISABLE_BACKGROUND_TASKS === 'true') {
    // Explicit opt-in for testing delivery while reservation sync, cleanup,
    // notifications and website publishing remain paused.
    if (process.env.PORTAL_INTEGRATION_OUTBOX_ENABLED === 'true') {
      cron.schedule('* * * * *', () => {
        processStaffNotifications().catch(err => console.error('[cron:staff-notifications]', err))
        processIntegrationOutbox().catch(err => console.error('[cron:integration-outbox]', err))
      })
      console.log('[cron] Integration outbox enabled; other background tasks remain disabled')
    }
    console.log('[cron] Other background tasks disabled (isolated staging)')
    return
  }

  const hkExpr = '*/5 * * * *'
  const ekeyCleanupExpr = '15 3 * * *'
  const outboxExpr = '* * * * *'
  const orchestratorHealthExpr = '*/5 * * * *'
  const backupExpr = '30 2 * * *'
  const websitePublishExpr = '15 1 * * *'

  cron.schedule(hkExpr, () => {
    try { queueStaffReminders() } catch (err) { console.error('[cron:staff-reminders]', err) }
  })

  cron.schedule(ekeyCleanupExpr, () => {
    try {
      const queued = queueExpiredManagedCodeCleanup()
      if (queued) console.log(`[cron:ekey-cleanup] Queued ${queued} managed code deletion(s)`)
    } catch (err) {
      console.error('[cron:ekey-cleanup]', err)
    }
  })

  cron.schedule(outboxExpr, () => {
    processStaffNotifications().catch(err => console.error('[cron:staff-notifications]', err))
    processIntegrationOutbox().catch(err => console.error('[cron:integration-outbox]', err))
  })

  cron.schedule(orchestratorHealthExpr, () => {
    if (process.env.PORTAL_WORKER_WATCHDOG_ENABLED !== 'true') checkOrchestratorHealth().catch(err => console.error('[cron:orchestrator-health]', err))
  })

  cron.schedule(backupExpr, () => {
    runBackup().catch(err => console.error('[cron:backup]', err))
  })

  cron.schedule(websitePublishExpr, () => {
    const enabled = (getDb().prepare("SELECT value FROM app_settings WHERE key='website_nightly_publish'").get() as { value: string } | undefined)?.value === '1'
    if (!enabled) return
    triggerWebsitePublish('scheduled').catch(err => console.error('[cron:website-publish]', err))
  })

  // Run hot sync once on startup
  setImmediate(() => {
    processIntegrationOutbox().catch(err => console.error('[cron:integration-outbox:startup]', err))
    runBackup().catch(err => console.error('[cron:backup:startup]', err))
    try {
      const queued = queueExpiredManagedCodeCleanup()
      if (queued) console.log(`[cron:ekey-cleanup:startup] Queued ${queued} managed code deletion(s)`)
    } catch (err) {
      console.error('[cron:ekey-cleanup:startup]', err)
    }
  })

  console.log('[cron] Scheduled — housekeeper:', hkExpr, '| eKey cleanup:', ekeyCleanupExpr, '| outbox:', outboxExpr, '| Orchestrator health:', orchestratorHealthExpr, '| backup:', backupExpr, '| website:', websitePublishExpr)
})
