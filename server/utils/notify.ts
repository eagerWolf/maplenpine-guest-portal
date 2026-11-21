import { messagingEnabled } from './servicePolicy'
import { getDb, now } from '../db/index'
import { getWhatsAppProvider } from './whatsapp'
import { getEmailConfig, sendEmail } from './email'

export type NotificationEvent =
  | 'job_failed'
  | 'pin_send_failed'
  | 'sync_error'
  | 'pin_added'
  | 'pin_updated'
  | 'breakfast_order'
  | 'housekeeper_reminder'
  | 'checkin_reminder'
  | 'orchestrator_offline'
  | 'orchestrator_recovered'
  | 'issue_recovered'
  | 'backup_failed'

type NotificationLevel = 'none' | 'errors' | 'all'
type ReminderEvent = 'housekeeper_reminder' | 'checkin_reminder'

const EVENT_MIN_LEVEL: Record<Exclude<NotificationEvent, ReminderEvent>, NotificationLevel> = {
  job_failed: 'errors',
  pin_send_failed: 'errors',
  sync_error: 'errors',
  pin_added: 'all',
  pin_updated: 'all',
  breakfast_order: 'all',
  orchestrator_offline: 'errors',
  orchestrator_recovered: 'errors',
  issue_recovered: 'errors',
  backup_failed: 'errors',
}

const LEVEL_RANK: Record<NotificationLevel, number> = { none: 0, errors: 1, all: 2 }

function logEntry(opts: {
  channel: string
  event: NotificationEvent
  recipient: string
  subject: string | null
  body: string
  status: 'sent' | 'failed'
  error?: string
  userId?: number
  userEmail?: string
  referenceId?: number
}): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO notification_log
      (user_id, user_email, channel, event_type, recipient, subject, body, status, error, reference_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    opts.userId ?? null,
    opts.userEmail ?? null,
    opts.channel,
    opts.event,
    opts.recipient,
    opts.subject ?? null,
    opts.body,
    opts.status,
    opts.error ?? null,
    opts.referenceId ?? null,
    now(),
  )
}

export async function notifyAdmins(opts: {
  event: Exclude<NotificationEvent, ReminderEvent>
  subject: string
  emailHtml: string
  whatsappText: string
  requireDelivery?: boolean
}): Promise<void> {
  if (['pin_added','pin_updated','breakfast_order'].includes(opts.event)) return
  if (!messagingEnabled()) {
    if (opts.requireDelivery) throw new Error('Portal messaging is disabled')
    return
  }
  const emailConfig = getEmailConfig()
  const db = getDb()

  type UserRow = { id: number; email: string; notification_level: string; whatsapp_phone: string | null }
  const users = db.prepare(`
    SELECT id, email, notification_level, whatsapp_phone
    FROM users
    WHERE role = 'admin' AND notification_level != 'none' AND active != 0
  `).all() as UserRow[]

  const minLevel = EVENT_MIN_LEVEL[opts.event]
  const eligible = users.filter(u => {
    const level = u.notification_level as NotificationLevel
    return LEVEL_RANK[level] >= LEVEL_RANK[minLevel]
  })
  const incidentKey = `${opts.event}:${opts.subject}`
  const isIncident = ['job_failed','pin_send_failed','sync_error','backup_failed'].includes(opts.event)
  if (isIncident) {
    const active = db.prepare('SELECT incident_key FROM notification_incidents WHERE incident_key=? AND resolved_at IS NULL').get(incidentKey)
    if (active) return
    db.prepare(`INSERT INTO notification_incidents(incident_key,alerted_at,resolved_at) VALUES(?,?,NULL)
      ON CONFLICT(incident_key) DO UPDATE SET alerted_at=excluded.alerted_at,resolved_at=NULL`).run(incidentKey,now())
  }
  let attempted = 0
  let succeeded = 0

  await Promise.allSettled(eligible.map(async (user) => {
    if (emailConfig.configured) {
      attempted++
      try {
        await sendEmail({
          apiKey: emailConfig.apiKey,
          from: emailConfig.from,
          to: user.email,
          subject: opts.subject,
          html: opts.emailHtml,
        })
        logEntry({ channel: 'email', event: opts.event, recipient: user.email, subject: opts.subject, body: opts.emailHtml, status: 'sent', userId: user.id, userEmail: user.email })
        succeeded++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logEntry({ channel: 'email', event: opts.event, recipient: user.email, subject: opts.subject, body: opts.emailHtml, status: 'failed', error: msg, userId: user.id, userEmail: user.email })
        console.error(`[notify:email] ${opts.event} → ${user.email}:`, msg)
      }
    }

    if (user.whatsapp_phone) {
      attempted++
      try {
        await getWhatsAppProvider().send(user.whatsapp_phone, opts.whatsappText)
        logEntry({ channel: 'whatsapp', event: opts.event, recipient: user.whatsapp_phone, subject: null, body: opts.whatsappText, status: 'sent', userId: user.id, userEmail: user.email })
        succeeded++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logEntry({ channel: 'whatsapp', event: opts.event, recipient: user.whatsapp_phone, subject: null, body: opts.whatsappText, status: 'failed', error: msg, userId: user.id, userEmail: user.email })
        console.error(`[notify:whatsapp] ${opts.event} → ${user.whatsapp_phone}:`, msg)
      }
    }
  }))
  if (isIncident && succeeded === 0) db.prepare('DELETE FROM notification_incidents WHERE incident_key=?').run(incidentKey)
  if (opts.requireDelivery && (attempted === 0 || succeeded === 0)) {
    throw new Error(attempted === 0 ? 'No configured administrator notification recipient' : 'All administrator notification deliveries failed')
  }
}


export async function resolveNotification(event: string, subject: string, text: string) {
  const db = getDb()
  const key = `${event}:${subject}`
  const incident = db.prepare('SELECT incident_key FROM notification_incidents WHERE incident_key=? AND resolved_at IS NULL').get(key)
  if (!incident) return
  await notifyAdmins({event:'issue_recovered',subject:'✓ Težava odpravljena',emailHtml:'<p>Težava je odpravljena.</p>',whatsappText:`✓ ${text}`,requireDelivery:true})
  db.prepare('UPDATE notification_incidents SET resolved_at=? WHERE incident_key=?').run(now(),key)
}
