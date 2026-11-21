import cron from 'node-cron'
import { syncBentral } from '../utils/sync'
import { queueStaffReminders, processStaffNotifications } from '../utils/staffNotifications'
import { getDb } from '../db/index'
import { useRuntimeConfig } from '#imports'
import { queueExpiredManagedCodeCleanup } from '../utils/jobs'
import { processIntegrationOutbox } from '../utils/integrationOutbox'
import { checkOrchestratorHealth } from '../utils/orchestratorHealth'
import { notifyAdmins, resolveNotification } from '../utils/notify'
import { backupDatabase } from '../utils/dbBackup'
import { triggerWebsitePublish } from '../utils/websiteContent'

async function runBackup() {
  try {
    await backupDatabase()
    await resolveNotification('backup_failed','Napaka varnostne kopije','Varnostna kopija je ponovno uspešno pripravljena.')
  } catch {
    await notifyAdmins({event:'backup_failed',subject:'Napaka varnostne kopije',emailHtml:'<p>Preverite varnostno kopiranje.</p>',whatsappText:'Varnostna kopija portala ni uspela. Preverite strežnik in prostor na disku.'})
  }
}

export default defineNitroPlugin(() => {
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
    console.log('[cron] Background tasks disabled (isolated staging)')
    return
  }

  const config = useRuntimeConfig()

  const hotExpr = config.bentralHotCron || '*/30 * * * *'
  const warmExpr = config.bentralWarmCron || '0 */5 * * *'
  const coldExpr = config.bentralColdCron || '0 3 * * *'
  const hkExpr = '*/5 * * * *'
  const ekeyCleanupExpr = '15 3 * * *'
  const outboxExpr = '* * * * *'
  const orchestratorHealthExpr = '*/5 * * * *'
  const backupExpr = '30 2 * * *'
  const websitePublishExpr = '15 1 * * *'

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
    checkOrchestratorHealth().catch(err => console.error('[cron:orchestrator-health]', err))
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
    if (isSyncEnabled()) syncBentral('hot').catch(err => console.error('[cron:startup]', err))
    processIntegrationOutbox().catch(err => console.error('[cron:integration-outbox:startup]', err))
    runBackup().catch(err => console.error('[cron:backup:startup]', err))
    try {
      const queued = queueExpiredManagedCodeCleanup()
      if (queued) console.log(`[cron:ekey-cleanup:startup] Queued ${queued} managed code deletion(s)`)
    } catch (err) {
      console.error('[cron:ekey-cleanup:startup]', err)
    }
  })

  console.log('[cron] Scheduled — hot:', hotExpr, '| warm:', warmExpr, '| cold:', coldExpr, '| housekeeper:', hkExpr, '| eKey cleanup:', ekeyCleanupExpr, '| outbox:', outboxExpr, '| Orchestrator health:', orchestratorHealthExpr, '| backup:', backupExpr, '| website:', websitePublishExpr)
})
