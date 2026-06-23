import { Resend } from 'resend'

function getResend(apiKey: string) {
  return new Resend(apiKey)
}

export async function sendMagicLink(opts: {
  to: string
  token: string
  apiKey: string
  from: string
  baseUrl: string
}) {
  const url = `${opts.baseUrl}/auth/verify?token=${opts.token}`
  const resend = getResend(opts.apiKey)
  await resend.emails.send({
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
}) {
  const resend = getResend(opts.apiKey)
  const doorDisplay = opts.door === 'Maple,Pine' ? 'Maple & Pine' : `${opts.door} Apartment`
  await resend.emails.send({
    from: opts.from,
    to: opts.to,
    subject: `Your Access PIN — ${doorDisplay}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2d6a4f">Maple & Pine Apartments</h2>
        <p>Dear ${opts.guestName},</p>
        <p>Your door access PIN has been set:</p>
        <div style="background:#f0faf5;border:2px solid #2d6a4f;border-radius:8px;padding:20px;text-align:center;margin:16px 0">
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#2d6a4f">${opts.pin}</div>
        </div>
        <p><strong>Access:</strong> ${doorDisplay}</p>
        <p><strong>Valid from:</strong> ${opts.validFrom}</p>
        <p><strong>Valid until:</strong> ${opts.validUntil}</p>
        <p style="margin-top:24px">
          <a href="${opts.portalLink}" style="color:#2d6a4f">View your access details online</a>
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
  const resend = getResend(opts.apiKey)
  await resend.emails.send({
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
  const resend = getResend(opts.apiKey)
  await resend.emails.send({
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
  const resend = getResend(opts.apiKey)
  await resend.emails.send({
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
  const resend = getResend(opts.apiKey)
  await resend.emails.send({
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
