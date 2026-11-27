vi.mock('../server/utils/guestContacts',()=>({guestContacts:()=>({additional:'host-phone',reception:null})}))
import Database from 'better-sqlite3'
import { beforeEach, afterEach, it, expect, vi } from 'vitest'
let db: Database.Database
const settings: Record<string, string> = {}
vi.mock('../server/db/index', () => ({ getDb: () => db, today: () => '2026-10-20' }))
vi.mock('../server/utils/secretSettings', () => ({ getSettingValue: (key: string) => settings[key] || '' }))
const { authenticateTV, buildTVContent } = await import('../server/utils/tvContent')
beforeEach(() => {
  db = new Database(':memory:')
  db.exec(`CREATE TABLE restaurants (id INTEGER, name TEXT, description TEXT, website TEXT,
    image_path TEXT, active INTEGER, sort_order INTEGER, valid_from TEXT, valid_to TEXT, recurring INTEGER);
    INSERT INTO restaurants VALUES (1, 'Test restaurant', '{"en":"Food"}', 'https://example.com', NULL, 1, 0, NULL, NULL, 0);
    INSERT INTO restaurants VALUES (2, 'Hidden', '{}', NULL, NULL, 0, 0, NULL, NULL, 0);`)
  for (const table of ['suggestions', 'howto_items', 'house_rules', 'faq_items']) {
    db.exec(`CREATE TABLE ${table} (id INTEGER, title TEXT, description TEXT, text TEXT,
      active INTEGER, sort_order INTEGER, valid_from TEXT, valid_to TEXT, recurring INTEGER,
      buttons TEXT, links TEXT, image_path TEXT, private_note TEXT)`)
    const insert = db.prepare(`INSERT INTO ${table} VALUES (?, '{"en":"Title","sl":"Naslov"}',
      '{"en":"Description"}', '{"en":"Rule"}', ?, 0, NULL, ?, 0, NULL, NULL, NULL, 'PRIVATE')`)
    insert.run(1, 1, null)
    insert.run(2, 0, null)
    insert.run(3, 1, '2026-10-19')
  }
  Object.assign(settings, {
    tv_maple_token: 'a'.repeat(64), tv_pine_token: 'b'.repeat(64),
    tv_maple_wifi_ssid: 'Maple', tv_maple_wifi_password: 'maple-private',
    tv_pine_wifi_ssid: 'Pine', tv_pine_wifi_password: 'pine-private',
    contact_phone: 'host-phone',
  })
})
afterEach(() => db.close())
it('rejects absent, invalid and revoked tokens; derives apartment from key only', () => {
  for (const header of [undefined, 'Bearer bad', `Bearer ${'c'.repeat(64)}`]) {
    expect(() => authenticateTV(header)).toThrow()
  }
  expect(authenticateTV(`Bearer ${settings.tv_maple_token}`)).toBe('maple')
  expect(authenticateTV(`Bearer ${settings.tv_pine_token}`)).toBe('pine')
  settings.tv_maple_token = ''
  expect(() => authenticateTV(`Bearer ${'a'.repeat(64)}`)).toThrow()
})
it('returns only currently active content and no secrets in editorial sections', () => {
  const trips = buildTVContent('maple', 'trips')
  expect(trips.items).toHaveLength(1)
  const apartment = buildTVContent('maple', 'apartment')
  expect(apartment.items).toHaveLength(3)
  for (const data of [trips, apartment]) {
    expect(JSON.stringify(data)).not.toContain('PRIVATE')
    expect(JSON.stringify(data)).not.toContain('private')
    expect(data).not.toHaveProperty('wifi')
  }
})
it('isolates Wi-Fi per apartment and rejects unknown sections', () => {
  expect(buildTVContent('maple', 'wifi').wifi).toEqual({ ssid: 'Maple', password: 'maple-private' })
  expect(JSON.stringify(buildTVContent('maple', 'wifi'))).not.toContain('pine-private')
  expect(() => buildTVContent('maple', 'reservations')).toThrow()
  settings.tv_maple_wifi_ssid = ''
  expect(buildTVContent('maple', 'wifi').wifi).toBeNull()
})
it('removes unsafe content links', () => {
  db.prepare('UPDATE suggestions SET buttons=? WHERE id=1').run(JSON.stringify([
    { label: 'Unsafe', href: 'javascript:alert(1)' },
    { label: 'Guide', href: 'https://example.com/guide' },
  ]))
  const data = buildTVContent('maple', 'trips')
  expect(data.items?.[0]?.links).toEqual([{ href: 'https://example.com/guide', label: { en: 'Guide' } }])
})
it('serves active restaurants and retains phone/email QR targets', () => {
  const restaurants = buildTVContent('pine', 'restaurants')
  expect(restaurants.items).toHaveLength(1)
  expect(restaurants.items?.[0]?.title.en).toBe('Test restaurant')
  db.prepare('UPDATE suggestions SET buttons=? WHERE id=1').run(JSON.stringify([
    { href: 'tel:+38640123456', label: 'Call' },
    { href: 'mailto:test@example.com', label: 'Email' },
    { href: 'file:///etc/passwd', label: 'Invalid' },
  ]))
  expect(buildTVContent('maple', 'trips').items?.[0]?.links).toHaveLength(2)
})
