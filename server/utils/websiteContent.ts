import { createHash, timingSafeEqual } from 'node:crypto'
import { getDb, now, today } from '../db/index'
import { isActiveToday } from './dateRange'
import { normalizeLocalizedLabel } from './localized'

export const WEBSITE_EXPORT_SCHEMA_VERSION = 1
export const WEBSITE_LOCALES = ['en', 'sl', 'de', 'hr', 'sr'] as const

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

function setting(key: string): string {
  return (getDb().prepare('SELECT value FROM app_settings WHERE key=?').get(key) as { value: string } | undefined)?.value?.trim() || ''
}

function safeTokenEqual(actual: string, expected: string): boolean {
  const a = Buffer.from(actual)
  const b = Buffer.from(expected)
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b)
}

export function validateWebsiteExportToken(header: string | undefined): void {
  const expected = setting('website_export_token')
  const actual = header?.replace(/^Bearer\s+/i, '').trim() || ''
  if (!expected || !safeTokenEqual(actual, expected)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

function slugify(value: string, fallback: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback
}

function mediaUrl(category: string, path: string | null): string | null {
  if (!path) return null
  const base = setting('website_portal_public_url').replace(/\/$/, '')
  return `${base}/api/uploads/${category}/${encodeURIComponent(path)}`
}

function active(row: any, date: string): boolean {
  return !!row.active && isActiveToday(row.valid_from, row.valid_to, !!row.recurring, date)
}

export function buildWebsiteExport(date = today()) {
  const db = getDb()
  const locations = db.prepare('SELECT * FROM locations WHERE active=1 ORDER BY name,id').all() as any[]
  const locationMap = new Map(locations.map(location => [location.id, location]))
  const restaurants = (db.prepare('SELECT * FROM restaurants ORDER BY sort_order,id').all() as any[])
    .filter(row => active(row, date)).map(row => ({
      id: row.id,
      slug: row.website_slug?.trim() || slugify(row.name, `restaurant-${row.id}`),
      name: row.name,
      type: row.type,
      website: row.website,
      description: parseJson(row.description, {}),
      imageUrl: mediaUrl('restaurants', row.image_path),
      location: row.location_id ? locationMap.get(row.location_id) || null : null,
      sortOrder: row.sort_order,
    }))
  const suggestions = (db.prepare('SELECT * FROM suggestions ORDER BY sort_order,id').all() as any[])
    .filter(row => active(row, date)).map(row => {
      const title = parseJson<Record<string, string>>(row.title, {})
      return {
        id: row.id,
        slug: row.website_slug?.trim() || slugify(title.en || title.sl || '', `suggestion-${row.id}`),
        title,
        description: parseJson(row.description, {}),
        buttons: parseJson<any[]>(row.buttons, []).map(button => ({ ...button, label: normalizeLocalizedLabel(button.label) })),
        imageUrl: mediaUrl('suggestions', row.image_path),
        youtubeUrl: row.youtube_url || null,
        sortOrder: row.sort_order,
      }
    })
  const simple = (table: string, fields: string[], imageCategory?: string) =>
    (db.prepare(`SELECT * FROM ${table} ORDER BY sort_order,id`).all() as any[]).filter(row => active(row, date)).map(row => ({
      id: row.id, sortOrder: row.sort_order,
      ...Object.fromEntries(fields.map(field => [field, parseJson(row[field], field === 'links' ? [] : {})])),
      ...(imageCategory ? { imageUrl: mediaUrl(imageCategory, row.image_path) } : {}),
    }))
  const news = (db.prepare('SELECT * FROM news ORDER BY created_at DESC,id DESC').all() as any[])
    .filter(row => active(row, date)).map(row => ({ id: row.id, title: parseJson(row.title, {}), content: parseJson(row.content, {}), createdAt: row.created_at }))

  const content = {
    schemaVersion: WEBSITE_EXPORT_SCHEMA_VERSION,
    generatedAt: now(),
    effectiveDate: date,
    locales: WEBSITE_LOCALES,
    restaurants,
    suggestions,
    news,
    faq: simple('faq_items', ['title', 'description', 'links']),
    howTo: simple('howto_items', ['title', 'description', 'links'], 'howto'),
    houseRules: simple('house_rules', ['text']),
  }
  return { ...content, contentHash: createHash('sha256').update(JSON.stringify(content)).digest('hex') }
}

export async function triggerWebsitePublish(triggeredBy = 'scheduled') {
  const db = getDb()
  const hook = setting('cloudflare_deploy_hook')
  if (!hook) throw new Error('Cloudflare Deploy Hook ni nastavljen.')
  let parsed: URL
  try { parsed = new URL(hook) } catch { throw new Error('Cloudflare Deploy Hook ni veljaven URL.') }
  if (parsed.protocol !== 'https:') throw new Error('Cloudflare Deploy Hook mora uporabljati HTTPS.')

  const ts = now()
  try {
    const response = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error(`Cloudflare je vrnil HTTP ${response.status}.`)
    const upsert = db.prepare("INSERT INTO app_settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at")
    const transaction = db.transaction(() => {
      upsert.run('website_last_publish_at', ts, ts)
      upsert.run('website_last_publish_status', 'triggered', ts)
      upsert.run('website_last_publish_error', '', ts)
      db.prepare("INSERT INTO audit_log(user_email,action,detail,created_at) VALUES(?, 'website_publish_trigger', ?, ?)")
        .run(triggeredBy, JSON.stringify({ triggeredBy }), ts)
    })
    transaction()
    return { success: true, triggeredAt: ts }
  } catch (error: any) {
    const message = error?.message || 'Napaka pri sprožitvi objave.'
    const upsert = db.prepare("INSERT INTO app_settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at")
    upsert.run('website_last_publish_at', ts, ts)
    upsert.run('website_last_publish_status', 'failed', ts)
    upsert.run('website_last_publish_error', message, ts)
    throw new Error(message)
  }
}
