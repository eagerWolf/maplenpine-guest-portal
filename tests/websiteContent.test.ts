import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let db: Database.Database
vi.mock('../server/db/index', () => ({
  getDb: () => db,
  now: () => '2026-08-01T12:00:00.000Z',
  today: () => '2026-08-01',
}))

const { buildWebsiteExport, validateWebsiteExportToken, triggerWebsitePublish } = await import('../server/utils/websiteContent')

function seed() {
  db = new Database(':memory:')
  db.exec(`
    CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT,updated_at TEXT);
    CREATE TABLE locations(id INTEGER PRIMARY KEY,name TEXT,country TEXT,address TEXT,google_maps_url TEXT,latitude REAL,longitude REAL,free_parking INTEGER,active INTEGER,created_at TEXT);
    CREATE TABLE restaurants(id INTEGER PRIMARY KEY,name TEXT,type TEXT,website TEXT,location_id INTEGER,description TEXT,image_path TEXT,active INTEGER,sort_order INTEGER,recurring INTEGER,valid_from TEXT,valid_to TEXT,website_slug TEXT,created_at TEXT,updated_at TEXT);
    CREATE TABLE suggestions(id INTEGER PRIMARY KEY,title TEXT,description TEXT,buttons TEXT,image_path TEXT,recurring INTEGER,valid_from TEXT,valid_to TEXT,active INTEGER,sort_order INTEGER,website_slug TEXT,youtube_url TEXT,created_at TEXT,updated_at TEXT);
    CREATE TABLE news(id INTEGER PRIMARY KEY,title TEXT,content TEXT,active INTEGER,recurring INTEGER,valid_from TEXT,valid_to TEXT,created_at TEXT,updated_at TEXT);
    CREATE TABLE faq_items(id INTEGER PRIMARY KEY,title TEXT,description TEXT,links TEXT,active INTEGER,sort_order INTEGER,recurring INTEGER,valid_from TEXT,valid_to TEXT);
    CREATE TABLE howto_items(id INTEGER PRIMARY KEY,title TEXT,description TEXT,links TEXT,image_path TEXT,active INTEGER,sort_order INTEGER,recurring INTEGER,valid_from TEXT,valid_to TEXT);
    CREATE TABLE house_rules(id INTEGER PRIMARY KEY,text TEXT,active INTEGER,sort_order INTEGER,recurring INTEGER,valid_from TEXT,valid_to TEXT);
    CREATE TABLE audit_log(id INTEGER PRIMARY KEY,user_id INTEGER,user_email TEXT,action TEXT,detail TEXT,created_at TEXT);
    INSERT INTO app_settings VALUES('website_export_token','secret','x'),('website_portal_public_url','https://portal.test','x'),('cloudflare_deploy_hook','https://api.cloudflare.test/hook','x');
    INSERT INTO locations VALUES(1,'Bled','Slovenia','Lake','https://maps.test',46.3,14.1,1,1,'x');
    INSERT INTO restaurants VALUES(1,'Test Restaurant','casual','https://restaurant.test',1,'{"en":"Description","sl":"Opis"}','restaurant.webp',1,0,0,NULL,NULL,'test-restaurant','x','x');
    INSERT INTO suggestions VALUES(1,'{"en":"Winter","sl":"Zima"}','{"en":"Snow","sl":"Sneg"}',NULL,'winter.webp',1,'12-01','02-28',1,0,'winter',NULL,'x','x');
    INSERT INTO suggestions VALUES(2,'{"en":"Summer","sl":"Poletje"}','{}',NULL,NULL,1,'06-01','08-31',1,1,'summer',NULL,'x','x');
  `)
}

describe('izvoz spletne vsebine', () => {
  beforeEach(() => { seed(); vi.restoreAllMocks() })

  it('zahteva pravilen bearer token', () => {
    expect(() => validateWebsiteExportToken('Bearer wrong')).toThrow('Unauthorized')
    expect(() => validateWebsiteExportToken('Bearer secret')).not.toThrow()
  })

  it('izvozi samo trenutno veljavno vsebino in absolutne slike', () => {
    const result = buildWebsiteExport('2026-08-01')
    expect(result.restaurants[0]).toMatchObject({ slug: 'test-restaurant', imageUrl: 'https://portal.test/api/uploads/restaurants/restaurant.webp' })
    expect(result.suggestions.map(item => item.slug)).toEqual(['summer'])
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/)
    expect(result.locales).toEqual(['en', 'sl', 'de', 'hr', 'sr'])
  })

  it('sproži Cloudflare hook in zabeleži stanje', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
    await expect(triggerWebsitePublish('admin@test.si')).resolves.toMatchObject({ success: true })
    expect(fetch).toHaveBeenCalledWith('https://api.cloudflare.test/hook', expect.objectContaining({ method: 'POST' }))
    expect(db.prepare("SELECT value FROM app_settings WHERE key='website_last_publish_status'").get()).toEqual({ value: 'triggered' })
    expect(db.prepare("SELECT action FROM audit_log").get()).toEqual({ action: 'website_publish_trigger' })
  })
})
