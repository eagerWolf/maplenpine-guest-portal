import { validateBentralUnitIds } from '../../../utils/bentralUnits'
import { recommendationKeys } from '../../../../shared/serviceRecommendations'
import { getDb, now } from '../../../db/index'
import { decodeSetting, encodeSetting } from '../../../utils/secretSettings'

const ALLOWED_KEYS = [
  ...recommendationKeys,
  'tv_maple_token', 'tv_pine_token',
  'tv_maple_wifi_ssid', 'tv_maple_wifi_password',
  'tv_pine_wifi_ssid', 'tv_pine_wifi_password',
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
  'bentral_unit_id_maple',
  'bentral_unit_id_pine',
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
  'twilio_staff_content_sid',
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
  const effective = { ...Object.fromEntries(currentRows.map(row => [row.key, decodeSetting(row.key, row.value)])), ...body }
  if (effective.bentral_unit_id_maple || effective.bentral_unit_id_pine) {
    try { validateBentralUnitIds(effective.bentral_unit_id_maple || '', effective.bentral_unit_id_pine || '') }
    catch { throw createError({ statusCode: 400, statusMessage: 'Vnesi različna Bentral ID-ja enot za Maple in Pine.' }) }
  }
  if (body.twilio_staff_content_sid && !/^HX[a-fA-F0-9]{32}$/.test(body.twilio_staff_content_sid)) throw createError({statusCode:400,statusMessage:'Twilio Content SID mora imeti obliko HX in 32 šestnajstiških znakov.'})
  for (const apartment of ['maple', 'pine']) {
    const token = effective[`tv_${apartment}_token`] || ''
    if (token && !/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
      throw createError({ statusCode: 400, statusMessage: 'TV ključ mora imeti 32–256 znakov (črke, številke, _ ali -).' })
    }
    if ((effective[`tv_${apartment}_wifi_ssid`] || '').length > 128 ||
      (effective[`tv_${apartment}_wifi_password`] || '').length > 256) {
      throw createError({ statusCode: 400, statusMessage: 'Wi-Fi podatki so predolgi.' })
    }
  }
  if (effective.tv_maple_token && effective.tv_maple_token === effective.tv_pine_token) {
    throw createError({ statusCode: 400, statusMessage: 'Maple in Pine morata imeti različna TV ključa.' })
  }
  const leaseMinutes = Number.parseInt(effective.orchestrator_lease_minutes || '30', 10)
  if (!Number.isInteger(leaseMinutes) || leaseMinutes < 15 || leaseMinutes > 1440) {
    throw createError({ statusCode: 400, statusMessage: 'Čas za obnovitev Orchestrator opravila mora biti med 15 in 1440 minutami.' })
  }
  const maxAttempts = Number.parseInt(effective.orchestrator_max_attempts || '5', 10)
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Največje število poskusov mora biti med 1 in 20.' })
  }
  if (body.breakfast_enabled === '1' || body.ebike_enabled === '1') {
    throw createError({ statusCode: 400, statusMessage: 'Zajtrk in najem koles sta samo zunanji priporočili. Naročanje v portalu je umaknjeno.' })
  }
  for (const key of recommendationKeys) {
    if (body[key] === undefined) continue
    if (typeof body[key] !== 'string' || body[key].length > 4000) throw createError({ statusCode: 400, statusMessage: 'Besedilo priporočila je predolgo.' })
    if (key.endsWith('_url')) {
      try {
        const url = new URL(body[key])
        if (url.protocol !== 'https:' || url.username || url.password) throw new Error()
      } catch { throw createError({ statusCode: 400, statusMessage: 'Povezava priporočila mora biti veljaven HTTPS naslov.' }) }
    }
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
      upsert.run(key, encodeSetting(key, String(body[key])), ts)
      updated.push(key)
    }
  }

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'update_settings', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ updated, values: Object.fromEntries(updated.map(k => [k, /(key|token|secret|password)/i.test(k) ? '[REDACTED]' : body[k]])) }),
    ts,
  )

  return { success: true, updated }
})
