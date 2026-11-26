import { notificationEvents } from '../../shared/notificationTemplates'
import { messagingEnabled } from './servicePolicy'
import { useRuntimeConfig } from '#imports'
import { getDb } from '../db/index'
import { decodeSetting } from './secretSettings'

interface WhatsAppProvider {
  send(to: string, message: string): Promise<void>
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

class StubProvider implements WhatsAppProvider {
  async send(to: string, message: string): Promise<void> {
    throw new Error('WhatsApp delivery is disabled or not configured')
  }
}

class TwilioProvider implements WhatsAppProvider {
  constructor(
    private accountSid: string,
    private authToken: string,
    private from: string,
    private contentSid: string,
  ) {}

  async send(to: string, message: string): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
    const body = new URLSearchParams({
      From: `whatsapp:${this.from}`,
      To: `whatsapp:${normalizePhone(to)}`,
    })
    if (this.contentSid) {
      const lines = message.split('\n').filter(Boolean)
      const link = lines.find(line => /^https?:\/\//.test(line)) || String(useRuntimeConfig().public.baseUrl)
      body.set('ContentSid',this.contentSid)
      body.set('ContentVariables',JSON.stringify({
        '1':lines[0] || 'Obvestilo',
        '2':lines.slice(1).filter(line => line !== link).join(' · ') || 'Preverite portal za podrobnosti.',
        '3':link,
      }))
    } else {
      throw new Error('Za samodejna WhatsApp obvestila nastavite odobreni Twilio Content SID.')
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Twilio error ${res.status}: ${text}`)
    }
  }
}

class WebhookProvider implements WhatsAppProvider {
  constructor(private webhookUrl: string) {}

  async send(to: string, message: string): Promise<void> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: normalizePhone(to), message }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      throw new Error(`Webhook error ${res.status}: ${await res.text()}`)
    }
  }
}

export function getWhatsAppProvider(eventType?: string): WhatsAppProvider {
  if (!messagingEnabled()) return new StubProvider()
  const twilio = getTwilioConfig()

  if (twilio.configured) {
    const eventSid = eventType && Object.hasOwn(notificationEvents,eventType)
      ? (getDb().prepare('SELECT value FROM app_settings WHERE key=?').get(`twilio_content_sid_${eventType}`) as {value:string}|undefined)?.value || '' : ''
    return new TwilioProvider(twilio.accountSid, twilio.authToken, twilio.whatsappFrom, /^HX[a-fA-F0-9]{32}$/.test(eventSid) ? eventSid : twilio.staffContentSid)
  }

  const config = useRuntimeConfig()

  const provider = (config.whatsappProvider as string) || 'stub'
  if (provider === 'webhook' && config.whatsappWebhookUrl) {
    return new WebhookProvider(config.whatsappWebhookUrl as string)
  }
  return new StubProvider()
}

export function getTwilioConfig(): {
  accountSid: string
  authToken: string
  whatsappFrom: string
  configured: boolean
  staffContentSid: string
} {
  if (!messagingEnabled()) return { accountSid: '', authToken: '', whatsappFrom: '', configured: false, staffContentSid: '' }
  const config = useRuntimeConfig()

  const db = getDb()
  const rows = db.prepare(
    `SELECT key, value FROM app_settings WHERE key IN ('twilio_account_sid', 'twilio_auth_token', 'twilio_whatsapp_from', 'twilio_staff_content_sid')`,
  ).all() as Array<{ key: string; value: string }>
  const dbSettings = Object.fromEntries(rows.map(r => [r.key, decodeSetting(r.key, r.value)]))

  const accountSid = dbSettings.twilio_account_sid || (config.twilioAccountSid as string)
  const authToken = dbSettings.twilio_auth_token || (config.twilioAuthToken as string)
  const whatsappFrom = dbSettings.twilio_whatsapp_from || (config.twilioWhatsappFrom as string)

  return {
    accountSid,
    authToken,
    whatsappFrom,
    staffContentSid: dbSettings.twilio_staff_content_sid || '',
    configured: Boolean(accountSid && authToken && whatsappFrom),
  }
}
