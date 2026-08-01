import { getDb, now } from '../../../db/index'

const ALLOWED_KEYS = [
  'bentral_checkin_time',
  'bentral_checkout_time',
  'checkin_offset_minutes',
  'checkout_offset_minutes',
  'hot_interval_minutes',
  'warm_interval_hours',
  'cold_interval_hours',
  'contact_phone',
  'property_nav_url',
  'housekeeper_whatsapp',
  'instagram_url',
  'facebook_url',
  'auto_sync_bentral',
  'auto_publish_ekey',
  'orchestrator_api_key',
  'orchestrator_lease_minutes',
  'orchestrator_max_attempts',
  'bentral_api_key',
  'breakfast_partner_id',
  'breakfast_enabled',
  'breakfast_partner_cost',
  'breakfast_margin',
  'breakfast_partner_whatsapp',
  'breakfast_partner_email',
  'breakfast_order_cutoff_hour',
  'breakfast_jan1_note',
  'breakfast_min_count',
  'breakfast_max_count_fallback',
  'sumup_api_key',
  'sumup_merchant_code',
  'sumup_webhook_secret',
  'twilio_account_sid',
  'twilio_auth_token',
  'twilio_whatsapp_from',
  'sendgrid_api_key',
  'email_from',
  'ebike_enabled',
  'reception_whatsapp',
  'website_export_token',
  'website_public_url',
  'website_portal_public_url',
  'cloudflare_deploy_hook',
  'website_nightly_publish',
]

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const body = await readBody<Record<string, string>>(event)
  const db = getDb()
  const ts = now()

  const currentRows = db.prepare('SELECT key, value FROM app_settings').all() as Array<{ key: string; value: string }>
  const effective = { ...Object.fromEntries(currentRows.map(row => [row.key, row.value])), ...body }
  const leaseMinutes = Number.parseInt(effective.orchestrator_lease_minutes || '30', 10)
  if (!Number.isInteger(leaseMinutes) || leaseMinutes < 15 || leaseMinutes > 1440) {
    throw createError({ statusCode: 400, statusMessage: 'Čas za obnovitev Orchestrator opravila mora biti med 15 in 1440 minutami.' })
  }
  const maxAttempts = Number.parseInt(effective.orchestrator_max_attempts || '5', 10)
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Največje število poskusov mora biti med 1 in 20.' })
  }
  if (effective.breakfast_enabled === '1') {
    if (!effective.twilio_account_sid?.trim() || !effective.twilio_auth_token?.trim() || !effective.twilio_whatsapp_from?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Pred omogočanjem zajtrka nastavite vse podatke Twilio WhatsApp.' })
    }
    const breakfastProviders = (db.prepare("SELECT COUNT(*) count FROM partners WHERE category = 'breakfast' AND active = 1 AND breakfast_enabled = 1 AND whatsapp IS NOT NULL AND whatsapp != '' AND contact_email IS NOT NULL AND contact_email != ''").get() as { count: number }).count
    if (!breakfastProviders) throw createError({ statusCode: 400, statusMessage: 'Omogočite vsaj enega ponudnika zajtrka z WhatsApp številko in e-pošto.' })
  }
  if (effective.ebike_enabled === '1') {
    if (!effective.twilio_account_sid?.trim() || !effective.twilio_auth_token?.trim() || !effective.twilio_whatsapp_from?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Pred omogočanjem e-koles nastavite vse podatke Twilio WhatsApp.' })
    }
    if (!effective.sendgrid_api_key?.trim() || !effective.email_from?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Pred omogočanjem e-koles nastavite SendGrid in naslov pošiljatelja.' })
    }
    const ebikeProviders = (db.prepare("SELECT COUNT(*) count FROM partners WHERE category = 'ebike' AND active = 1 AND rental_enabled = 1 AND whatsapp IS NOT NULL AND whatsapp != '' AND contact_email IS NOT NULL AND contact_email != ''").get() as { count: number }).count
    if (!ebikeProviders) throw createError({ statusCode: 400, statusMessage: 'Omogočite vsaj enega ponudnika e-koles z WhatsApp številko in e-pošto.' })
  }
  if (effective.website_nightly_publish === '1') {
    if (!effective.website_export_token?.trim() || effective.website_export_token.trim().length < 32) {
      throw createError({ statusCode: 400, statusMessage: 'Token za izvoz spletne vsebine mora imeti vsaj 32 znakov.' })
    }
    for (const [label, value] of [['Javni URL portala', effective.website_portal_public_url], ['Cloudflare Deploy Hook', effective.cloudflare_deploy_hook]] as const) {
      try {
        if (new URL(value || '').protocol !== 'https:') throw new Error()
      } catch {
        throw createError({ statusCode: 400, statusMessage: `${label} mora biti veljaven HTTPS naslov.` })
      }
    }
  }

  const upsert = db.prepare(
    'INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
  )

  const updated: string[] = []
  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      upsert.run(key, String(body[key]), ts)
      updated.push(key)
    }
  }

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'update_settings', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ updated, values: Object.fromEntries(updated.map(k => [k, /(key|token|secret)/i.test(k) ? '[REDACTED]' : body[k]])) }),
    ts,
  )

  return { success: true, updated }
})
