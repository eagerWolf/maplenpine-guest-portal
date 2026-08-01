import { useRuntimeConfig } from '#imports'
import { getDb } from '../db/index'

export function getEmailConfig(): { apiKey: string; from: string; configured: boolean } {
  const runtime = useRuntimeConfig()
  const rows = getDb().prepare("SELECT key, value FROM app_settings WHERE key IN ('sendgrid_api_key', 'email_from')").all() as Array<{ key: string; value: string }>
  const settings = Object.fromEntries(rows.map(row => [row.key, row.value]))
  const apiKey = settings.sendgrid_api_key || String(runtime.sendgridApiKey || '')
  const from = settings.email_from || String(runtime.adminEmailFrom || '')
  return { apiKey, from, configured: Boolean(apiKey && from) }
}

export async function sendEmail(opts: { apiKey: string; from: string; to: string; subject: string; html: string }): Promise<void> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: opts.to }] }],
      from: { email: opts.from },
      subject: opts.subject,
      content: [{ type: 'text/html', value: opts.html }],
    }),
  })
  if (!response.ok) throw new Error(`SendGrid error ${response.status}: ${await response.text()}`)
}

function getEmailSender(apiKey: string) {
  return {
    emails: {
      send: (opts: { from: string; to: string; subject: string; html: string }) => sendEmail({ apiKey, ...opts }),
    },
  }
}

export async function sendMagicLink(opts: {
  to: string
  token: string
  apiKey: string
  from: string
  baseUrl: string
}) {
  const url = `${opts.baseUrl}/auth/verify?token=${opts.token}`
  const email = getEmailSender(opts.apiKey)
  await email.emails.send({
    from: opts.from,
    to: opts.to,
    subject: 'Prijavna povezava — Maple & Pine Portal',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2d6a4f">Maple & Pine Portal</h2>
        <p>Kliknite na spodnjo povezavo za prijavo:</p>
        <a href="${url}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Prijava v portal</a>
        <p style="color:#888;font-size:13px;margin-top:24px">Povezava je veljavna 15 minut. Če se niste prijavili vi, ignorirajte to sporočilo.</p>
      </div>
    `,
  })
}

export async function sendGuestPin(opts: {
  to: string
  guestName: string
  pin: string
  door: string
  validFrom: string
  validUntil: string
  portalLink: string
  apiKey: string
  from: string
  lang?: string | null
}) {
  const email = getEmailSender(opts.apiKey)
  const locale = (['en', 'sl', 'de', 'hr', 'sr'].includes(opts.lang ?? '') ? opts.lang : 'en') as 'en' | 'sl' | 'de' | 'hr' | 'sr'
  const copy = {
    en: { subject: 'Your Access PIN', dear: 'Dear', intro: 'Your door access PIN has been set:', access: 'Access', from: 'Valid from', until: 'Valid until', link: 'View your access details online', apartment: 'Apartment' },
    sl: { subject: 'Vaša dostopna PIN koda', dear: 'Spoštovani', intro: 'Vaša PIN koda za dostop je pripravljena:', access: 'Dostop', from: 'Velja od', until: 'Velja do', link: 'Odprite podrobnosti dostopa', apartment: 'Apartma' },
    de: { subject: 'Ihre Zugangs-PIN', dear: 'Guten Tag', intro: 'Ihre PIN für den Türzugang wurde eingerichtet:', access: 'Zugang', from: 'Gültig ab', until: 'Gültig bis', link: 'Zugangsdaten online anzeigen', apartment: 'Apartment' },
    hr: { subject: 'Vaš pristupni PIN', dear: 'Poštovani', intro: 'Vaš PIN za pristup vratima je postavljen:', access: 'Pristup', from: 'Vrijedi od', until: 'Vrijedi do', link: 'Pogledajte podatke za pristup', apartment: 'Apartman' },
    sr: { subject: 'Vaš pristupni PIN', dear: 'Poštovani', intro: 'Vaš PIN za pristup vratima je postavljen:', access: 'Pristup', from: 'Važi od', until: 'Važi do', link: 'Pogledajte podatke za pristup', apartment: 'Apartman' },
  }[locale]
  const doorDisplay = opts.door === 'Maple,Pine' ? 'Maple & Pine' : `${copy.apartment} ${opts.door}`
  await email.emails.send({
    from: opts.from,
    to: opts.to,
    subject: `${copy.subject} — ${doorDisplay}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2d6a4f">Maple & Pine Apartments</h2>
        <p>${copy.dear} ${opts.guestName},</p>
        <p>${copy.intro}</p>
        <div style="background:#f0faf5;border:2px solid #2d6a4f;border-radius:8px;padding:20px;text-align:center;margin:16px 0">
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#2d6a4f">${opts.pin}</div>
        </div>
        <p><strong>${copy.access}:</strong> ${doorDisplay}</p>
        <p><strong>${copy.from}:</strong> ${opts.validFrom}</p>
        <p><strong>${copy.until}:</strong> ${opts.validUntil}</p>
        <p style="margin-top:24px">
          <a href="${opts.portalLink}" style="color:#2d6a4f">${copy.link}</a>
        </p>
        <p style="color:#888;font-size:13px">Maple & Pine Apartments, Bled, Slovenia</p>
      </div>
    `,
  })
}

export async function sendAdminPinAdded(opts: {
  guestName: string
  door: string
  pin: string
  validFrom: string
  validUntil: string
  apiKey: string
  from: string
  to: string
}) {
  const email = getEmailSender(opts.apiKey)
  await email.emails.send({
    from: opts.from,
    to: opts.to,
    subject: `✓ PIN dodan — ${opts.guestName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2d6a4f">PIN koda uspešno dodana</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${opts.guestName}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Vrata</td><td style="padding:6px 0">${opts.door}</td></tr>
          <tr><td style="padding:6px 0;color:#888">PIN</td><td style="padding:6px 0;font-family:monospace;font-size:18px;font-weight:700">${opts.pin}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Veljavno od</td><td style="padding:6px 0">${opts.validFrom}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Veljavno do</td><td style="padding:6px 0">${opts.validUntil}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function sendAdminPinUpdated(opts: {
  guestName: string
  validFrom: string
  validUntil: string
  triggeredBy: string
  apiKey: string
  from: string
  to: string
}) {
  const email = getEmailSender(opts.apiKey)
  await email.emails.send({
    from: opts.from,
    to: opts.to,
    subject: `✎ Dostop posodobljen — ${opts.guestName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#bc4749">Dostop posodobljen</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${opts.guestName}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Nova veljavnost od</td><td style="padding:6px 0">${opts.validFrom}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Nova veljavnost do</td><td style="padding:6px 0">${opts.validUntil}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Sprožil</td><td style="padding:6px 0">${opts.triggeredBy}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function sendAdminJobFailed(opts: {
  guestName: string
  action: string
  reason: string
  jobId: number
  apiKey: string
  from: string
  to: string
}) {
  const email = getEmailSender(opts.apiKey)
  await email.emails.send({
    from: opts.from,
    to: opts.to,
    subject: `✗ Napaka pri jobu — ${opts.guestName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#bc4749">Napaka pri izvedbi joba</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888">Gost</td><td style="padding:6px 0;font-weight:600">${opts.guestName}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Akcija</td><td style="padding:6px 0">${opts.action}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Razlog</td><td style="padding:6px 0;color:#bc4749">${opts.reason}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Job ID</td><td style="padding:6px 0;font-family:monospace">${opts.jobId}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function sendAdminSyncError(opts: {
  tier: string
  dateFrom: string
  dateTo: string
  error: string
  apiKey: string
  from: string
  to: string
}) {
  const email = getEmailSender(opts.apiKey)
  await email.emails.send({
    from: opts.from,
    to: opts.to,
    subject: `⚠ Bentral sync napaka — ${opts.tier}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#bc4749">Napaka pri Bentral sinhronizaciji</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888">Tier</td><td style="padding:6px 0;font-weight:600">${opts.tier}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Razpon</td><td style="padding:6px 0">${opts.dateFrom} → ${opts.dateTo}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Napaka</td><td style="padding:6px 0;color:#bc4749;font-family:monospace">${opts.error}</td></tr>
        </table>
      </div>
    `,
  })
}
