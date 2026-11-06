import { timingSafeEqual } from 'node:crypto'
import { getDb, today } from '../db/index'
import { getSettingValue } from './secretSettings'
import { isActiveToday } from './dateRange'

export function authenticateTV(header?: string): 'maple' | 'pine' {
  const token = header?.match(/^Bearer ([A-Za-z0-9_-]{32,256})$/)?.[1] || ''
  for (const apartment of ['maple', 'pine'] as const) {
    const expected = getSettingValue(`tv_${apartment}_token`)
    if (expected.length >= 32 && token.length === expected.length &&
      timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return apartment
  }
  throw createError({ statusCode: 401, statusMessage: 'Unauthorized TV' })
}
function localized(value: string | null) {
  const source = value ? JSON.parse(value) : {}
  return Object.fromEntries(['en', 'sl', 'de', 'hr', 'sr'].filter(lang => typeof source[lang] === 'string').map(lang => [lang, source[lang]]))
}
export function buildTVContent(apartment: 'maple' | 'pine', section: string) {
  const base = { apartment, section, fetchedAt: new Date().toISOString() }
  if (section === 'wifi') {
    const ssid = getSettingValue(`tv_${apartment}_wifi_ssid`)
    const password = getSettingValue(`tv_${apartment}_wifi_password`)
    return { ...base, wifi: ssid ? { ssid, password } : null }
  }
  if (!['trips', 'apartment', 'restaurants'].includes(section)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown TV section' })
  }
  const db = getDb()
  const date = today()
  // Table names are hard-coded here, never supplied by a caller.
  const rows = (table: 'suggestions' | 'howto_items' | 'house_rules' | 'faq_items' | 'restaurants') =>
    (db.prepare(`SELECT * FROM ${table} WHERE active = 1 ORDER BY sort_order,id`).all() as any[])
      .filter(row => isActiveToday(row.valid_from, row.valid_to, !!row.recurring, date))
  const item = (row: any, kind: string) => ({
    id: row.id, kind, title: localized(row.title), description: localized(row.description),
    links: (JSON.parse(row.buttons || row.links || '[]') as any[])
      .filter(link => typeof link.href === 'string' && /^(https?:\/\/|tel:\+?[\d ()-]+$|mailto:[^@\s]+@[^@\s]+$)/i.test(link.href))
      .map(link => ({ href: link.href, label: typeof link.label === 'string' ? { en: link.label } : link.label })),
    imagePath: row.image_path ? `/api/uploads/${kind === 'trip' ? 'suggestions' : 'howto'}/${encodeURIComponent(row.image_path)}` : null,
  })
  if (section === 'trips') return { ...base, items: rows('suggestions').map(row => item(row, 'trip')) }
  if (section === 'restaurants') return { ...base, items: rows('restaurants').map(row => ({
    id: row.id, kind: 'restaurant', title: { en: row.name, sl: row.name },
    description: localized(row.description),
    imagePath: row.image_path ? `/api/uploads/restaurants/${encodeURIComponent(row.image_path)}` : null,
    links: row.website && /^https?:\/\//i.test(row.website)
      ? [{ href: row.website, label: { en: 'Website', sl: 'Spletna stran' } }] : [],
  })) }
  return {
    ...base,
    items: [
      ...rows('howto_items').map(row => item(row, 'guide')),
      ...rows('house_rules').map(row => ({ id: row.id, kind: 'rule', title: {}, description: localized(row.text) })),
      ...rows('faq_items').map(row => item(row, 'faq')),
    ],
    contactPhone: getSettingValue('contact_phone'),
  }
}
