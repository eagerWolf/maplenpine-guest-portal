import { useRuntimeConfig } from '#imports'

interface WhatsAppProvider {
  send(to: string, message: string): Promise<void>
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

class StubProvider implements WhatsAppProvider {
  async send(to: string, message: string): Promise<void> {
    console.log(`[whatsapp:stub] TO=${to}\nMSG=${message}`)
  }
}

class TwilioProvider implements WhatsAppProvider {
  constructor(
    private accountSid: string,
    private authToken: string,
    private from: string,
  ) {}

  async send(to: string, message: string): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
    const body = new URLSearchParams({
      From: `whatsapp:${this.from}`,
      To: `whatsapp:${normalizePhone(to)}`,
      Body: message,
    })
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
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
    })
    if (!res.ok) {
      throw new Error(`Webhook error ${res.status}: ${await res.text()}`)
    }
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const config = useRuntimeConfig()
  const provider = (config.whatsappProvider as string) || 'stub'

  if (provider === 'twilio' && config.twilioAccountSid && config.twilioAuthToken) {
    return new TwilioProvider(
      config.twilioAccountSid as string,
      config.twilioAuthToken as string,
      config.twilioWhatsappFrom as string,
    )
  }
  if (provider === 'webhook' && config.whatsappWebhookUrl) {
    return new WebhookProvider(config.whatsappWebhookUrl as string)
  }
  return new StubProvider()
}
