import { getDb, now } from '../db/index'
import { enqueueIntegration } from './integrationOutbox'

const OFFLINE_AFTER_MS = 15 * 60_000
const startupAt = Date.now()

function setting(key: string): string | undefined {
  return (getDb().prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as { value: string } | undefined)?.value
}

function setSetting(key: string, value: string): void {
  const ts = now()
  getDb().prepare(`
    INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, ts)
}

export async function checkOrchestratorHealth(reference = new Date()): Promise<'online' | 'offline' | 'waiting' | 'disabled'> {
  if (setting('auto_publish_ekey') === '0') return 'disabled'
  const lastSeen = setting('orchestrator_last_seen')
  const previous = setting('orchestrator_health_state')
  const lastSeenMs = lastSeen ? new Date(lastSeen).getTime() : NaN
  if (!lastSeen && reference.getTime() - startupAt <= OFFLINE_AFTER_MS) return 'waiting'
  const offline = Number.isFinite(lastSeenMs)
    ? reference.getTime() - lastSeenMs > OFFLINE_AFTER_MS
    : reference.getTime() - startupAt > OFFLINE_AFTER_MS

  if (!offline) {
    if (previous === 'offline') {
      enqueueIntegration(`orchestrator-health:recovered:${lastSeen}`, 'admin_notification', {
        event: 'orchestrator_recovered',
        subject: '✓ Orchestrator je ponovno povezan',
        emailHtml: '<p>Windows eKey Orchestrator se je ponovno povezal s portalom.</p>',
        whatsappText: '✓ Windows eKey Orchestrator je ponovno povezan s portalom.',
      })
    }
    setSetting('orchestrator_health_state', 'online')
    return 'online'
  }

  if (previous !== 'offline') {
    const detail = lastSeen ? `Zadnja povezava: ${lastSeen}` : 'Orchestrator se po zagonu portala še ni povezal.'
    enqueueIntegration(`orchestrator-health:offline:${lastSeen ?? 'never'}`, 'admin_notification', {
      event: 'orchestrator_offline',
      subject: '⚠ eKey Orchestrator ni dosegljiv',
      emailHtml: `<p>Windows eKey Orchestrator se več kot 15 minut ni javil portalu.</p><p>${detail}</p>`,
      whatsappText: `⚠ Windows eKey Orchestrator se več kot 15 minut ni javil. ${detail}`,
    })
    setSetting('orchestrator_health_state', 'offline')
  }
  return 'offline'
}
