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
  const emailConfig = getEmailConfig()
  const db = getDb()

  type UserRow = { id: number; email: string; notification_level: string; whatsapp_phone: string | null }
  const users = db.prepare(`
    SELECT id, email, notification_level, whatsapp_phone
    FROM users
    WHERE notification_level != 'none' AND active != 0
  `).all() as UserRow[]

  const minLevel = EVENT_MIN_LEVEL[opts.event]
  const eligible = users.filter(u => {
    const level = u.notification_level as NotificationLevel
    return LEVEL_RANK[level] >= LEVEL_RANK[minLevel]
  })
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
  if (opts.requireDelivery && (attempted === 0 || succeeded === 0)) {
    throw new Error(attempted === 0 ? 'No configured administrator notification recipient' : 'All administrator notification deliveries failed')
  }
}

export async function notifyHousekeeper(reservationId: number, door: string): Promise<void> {
  const db = getDb()
  const settings = db.prepare('SELECT key, value FROM app_settings').all() as Array<{ key: string; value: string }>
  const s = Object.fromEntries(settings.map(r => [r.key, r.value]))

  // Build recipient list: global setting + users with notify_housekeeper=1
  const recipients = new Set<string>()
  if (s.housekeeper_whatsapp) recipients.add(s.housekeeper_whatsapp)

  type HkUser = { id: number; email: string; whatsapp_phone: string }
  const hkUsers = db.prepare(`
    SELECT id, email, whatsapp_phone FROM users
    WHERE notify_housekeeper = 1 AND whatsapp_phone IS NOT NULL AND whatsapp_phone != '' AND active != 0
  `).all() as HkUser[]
  for (const u of hkUsers) recipients.add(u.whatsapp_phone)

  if (recipients.size === 0) return

  const doorDisplay = door === 'Maple,Pine' ? 'Maple in Pine' : door
  const message = `Jutri je menjava v ${doorDisplay}. Preverite Bentral za podrobnosti.`

  for (const phone of recipients) {
    const alreadySent = db.prepare(`
      SELECT id FROM notification_log
      WHERE event_type = 'housekeeper_reminder' AND reference_id = ? AND recipient = ? AND status = 'sent'
    `).get(reservationId, phone)
    if (alreadySent) continue

    const userRow = hkUsers.find(u => u.whatsapp_phone === phone)
    try {
      await getWhatsAppProvider().send(phone, message)
      logEntry({ channel: 'whatsapp', event: 'housekeeper_reminder', recipient: phone, subject: null, body: message, status: 'sent', referenceId: reservationId, userId: userRow?.id, userEmail: userRow?.email })
      console.log(`[notify:housekeeper] Sent for reservation ${reservationId} (${door}) → ${phone}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logEntry({ channel: 'whatsapp', event: 'housekeeper_reminder', recipient: phone, subject: null, body: message, status: 'failed', error: msg, referenceId: reservationId, userId: userRow?.id, userEmail: userRow?.email })
      console.error(`[notify:housekeeper] Error for reservation ${reservationId} → ${phone}:`, msg)
    }
  }
}

export async function notifyReception(reservationId: number, door: string): Promise<void> {
  const db = getDb()
  const settings = db.prepare('SELECT key, value FROM app_settings').all() as Array<{ key: string; value: string }>
  const s = Object.fromEntries(settings.map(r => [r.key, r.value]))

  // Build recipient list: global setting + users with notify_checkin=1
  const recipients = new Set<string>()
  if (s.reception_whatsapp) recipients.add(s.reception_whatsapp)

  type ReceptionUser = { id: number; email: string; whatsapp_phone: string }
  const receptionUsers = db.prepare(`
    SELECT id, email, whatsapp_phone FROM users
    WHERE notify_checkin = 1 AND whatsapp_phone IS NOT NULL AND whatsapp_phone != '' AND active != 0
  `).all() as ReceptionUser[]
  for (const u of receptionUsers) recipients.add(u.whatsapp_phone)

  if (recipients.size === 0) return

  const doorDisplay = door === 'Maple,Pine' ? 'Maple in Pine' : door
  const message = `Jutri prihaja gost v ${doorDisplay}. Preverite Bentral za podrobnosti.`

  for (const phone of recipients) {
    const alreadySent = db.prepare(`
      SELECT id FROM notification_log
      WHERE event_type = 'checkin_reminder' AND reference_id = ? AND recipient = ? AND status = 'sent'
    `).get(reservationId, phone)
    if (alreadySent) continue

    const userRow = receptionUsers.find(u => u.whatsapp_phone === phone)
    try {
      await getWhatsAppProvider().send(phone, message)
      logEntry({ channel: 'whatsapp', event: 'checkin_reminder', recipient: phone, subject: null, body: message, status: 'sent', referenceId: reservationId, userId: userRow?.id, userEmail: userRow?.email })
      console.log(`[notify:reception] Sent for reservation ${reservationId} (${door}) → ${phone}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logEntry({ channel: 'whatsapp', event: 'checkin_reminder', recipient: phone, subject: null, body: message, status: 'failed', error: msg, referenceId: reservationId, userId: userRow?.id, userEmail: userRow?.email })
      console.error(`[notify:reception] Error for reservation ${reservationId} → ${phone}:`, msg)
    }
  }
}
