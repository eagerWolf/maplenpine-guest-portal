import { getDb } from '../db/index'
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { SEED_RESTAURANTS, SEED_SUGGESTIONS, SEED_FAQ, SEED_HOWTO, SEED_HOUSE_RULES } from '../db/seed-content'

function copySeedImage(category: string, sourcePath: string): string {
  const filename = sourcePath.split('/').pop()!
  const dest = join(process.cwd(), 'data', 'uploads', category, filename)
  if (!existsSync(dest)) {
    const src = join(process.cwd(), 'public', sourcePath.replace(/^\//, ''))
    if (existsSync(src)) copyFileSync(src, dest)
  }
  return filename
}

export default defineNitroPlugin(() => {
  const db = getDb()

  // Ensure contracts directory exists
  mkdirSync(join(process.cwd(), 'data', 'contracts'), { recursive: true })

  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bentral_reservation_id TEXT UNIQUE NOT NULL,
      door TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      pin TEXT,
      access_valid_from TEXT,
      access_valid_until TEXT,
      guest_email TEXT,
      guest_phone TEXT,
      bentral_arrival TEXT,
      bentral_departure TEXT,
      bentral_status TEXT,
      bentral_unit_id TEXT,
      bentral_updated_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      triggered_by TEXT,
      payload TEXT,
      result TEXT,
      reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      lease_expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      password_hash TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS guest_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_email TEXT,
      action TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS integration_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_key TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempt_count INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT NOT NULL,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_integration_outbox_pending
      ON integration_outbox(status, next_attempt_at);

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Slovenia',
      address TEXT,
      google_maps_url TEXT,
      latitude REAL,
      longitude REAL,
      free_parking INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL REFERENCES locations(id),
      category TEXT NOT NULL DEFAULT 'other',
      name TEXT NOT NULL,
      contact_name TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      whatsapp TEXT,
      contract_filename TEXT,
      contract_original_name TEXT,
      notes TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      breakfast_enabled INTEGER NOT NULL DEFAULT 0,
      breakfast_cost REAL NOT NULL DEFAULT 12,
      breakfast_margin REAL NOT NULL DEFAULT 2,
      breakfast_cutoff_hour INTEGER NOT NULL DEFAULT 18,
      breakfast_jan1_note TEXT,
      breakfast_min_count INTEGER NOT NULL DEFAULT 2,
      breakfast_max_count INTEGER NOT NULL DEFAULT 8,
      breakfast_exceptions TEXT NOT NULL DEFAULT '[]',
      rental_enabled INTEGER NOT NULL DEFAULT 0,
      rental_daily_cost REAL NOT NULL DEFAULT 0,
      rental_daily_margin REAL NOT NULL DEFAULT 0,
      rental_exceptions TEXT NOT NULL DEFAULT '[]',
      pickup_location_id INTEGER REFERENCES locations(id),
      return_location_id INTEGER REFERENCES locations(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS host_settings (
      host_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (host_id, key)
    );

    CREATE TABLE IF NOT EXISTS notification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_email TEXT,
      channel TEXT NOT NULL,
      event_type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      error TEXT,
      reference_id INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_sl TEXT NOT NULL,
      title_en TEXT NOT NULL,
      content_sl TEXT NOT NULL,
      content_en TEXT NOT NULL,
      title TEXT,
      content TEXT,
      recurring INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      valid_from TEXT,
      valid_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'casual',
      website TEXT,
      description TEXT NOT NULL,
      image_path TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      recurring INTEGER NOT NULL DEFAULT 0,
      valid_from TEXT,
      valid_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      buttons TEXT,
      image_path TEXT,
      recurring INTEGER NOT NULL DEFAULT 0,
      valid_from TEXT,
      valid_to TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      links TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      recurring INTEGER NOT NULL DEFAULT 0,
      valid_from TEXT,
      valid_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS howto_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_path TEXT,
      links TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      recurring INTEGER NOT NULL DEFAULT 0,
      valid_from TEXT,
      valid_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS house_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      recurring INTEGER NOT NULL DEFAULT 0,
      valid_from TEXT,
      valid_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partner_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      guest_token TEXT NOT NULL,
      partner_id INTEGER REFERENCES partners(id),
      guest_name TEXT NOT NULL,
      guest_phone TEXT,
      apartment TEXT NOT NULL,
      selected_dates TEXT NOT NULL,
      delivery_slot TEXT NOT NULL,
      breakfast_count INTEGER NOT NULL,
      vegetarian_count INTEGER NOT NULL DEFAULT 0,
      gluten_free_count INTEGER NOT NULL DEFAULT 0,
      guest_notes TEXT,
      partner_provision_per_unit REAL NOT NULL DEFAULT 0,
      margin_per_unit REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      payment_provider TEXT NOT NULL DEFAULT 'sumup',
      payment_id TEXT,
      payment_transaction_id TEXT,
      payment_status TEXT,
      refund_status TEXT,
      partner_message TEXT,
      partner_confirmation_token TEXT UNIQUE,
      partner_confirmed_at TEXT,
      partner_rejected_at TEXT,
      sent_to_partner_at TEXT,
      cancelled_at TEXT,
      refunded_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bike_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      guest_token TEXT NOT NULL,
      partner_id INTEGER NOT NULL REFERENCES partners(id),
      guest_name TEXT NOT NULL,
      guest_phone TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      bike_count INTEGER NOT NULL,
      guest_notes TEXT,
      daily_cost REAL NOT NULL,
      daily_margin REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      confirmation_token TEXT NOT NULL UNIQUE,
      payment_id TEXT,
      payment_transaction_id TEXT,
      confirmed_at TEXT,
      rejected_at TEXT,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  // Seed default settings if missing
  const ts = new Date().toISOString()
  const defaults: [string, string][] = [
    ['bentral_checkin_time', '15:00'],
    ['bentral_checkout_time', '11:00'],
    ['checkin_offset_minutes', '-120'],
    ['checkout_offset_minutes', '30'],
    ['hot_interval_minutes', '30'],
    ['warm_interval_hours', '5'],
    ['cold_interval_hours', '24'],
    ['contact_phone', ''],
    ['property_nav_url', ''],
    ['housekeeper_whatsapp', ''],
    ['instagram_url', 'https://www.instagram.com/maple.and.pine.bled/'],
    ['facebook_url', 'https://www.facebook.com/mapleandpinebled'],
    ['auto_sync_bentral', '1'],
    ['auto_publish_ekey', '1'],
    ['orchestrator_api_key', ''],
    ['orchestrator_lease_minutes', '30'],
    ['orchestrator_max_attempts', '5'],
    ['bentral_api_key', ''],
    ['breakfast_partner_id', ''],
    ['breakfast_enabled', '0'],
    ['breakfast_partner_cost', '12.00'],
    ['breakfast_margin', '2.00'],
    ['breakfast_partner_whatsapp', ''],
    ['breakfast_partner_email', ''],
    ['breakfast_order_cutoff_hour', '18'],
    ['breakfast_jan1_note', 'Naročilo za 1. januar ni možno, ker partner ta dan ne obratuje.'],
    ['breakfast_min_count', '2'],
    ['breakfast_max_count_fallback', '8'],
    ['sumup_api_key', ''],
    ['sumup_merchant_code', ''],
    ['sumup_webhook_secret', ''],
    ['twilio_account_sid', ''],
    ['twilio_auth_token', ''],
    ['twilio_whatsapp_from', ''],
    ['sendgrid_api_key', ''],
    ['email_from', ''],
    ['reception_whatsapp', ''],
    ['ebike_enabled', '0'],
    ['website_export_token', ''],
    ['website_public_url', 'https://maplenpine.com'],
    ['website_portal_public_url', ''],
    ['cloudflare_deploy_hook', ''],
    ['website_nightly_publish', '0'],
    ['website_last_publish_at', ''],
    ['website_last_publish_status', ''],
    ['website_last_publish_error', ''],
  ]
  const ins = db.prepare(
    'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
  )
  for (const [key, value] of defaults) {
    ins.run(key, value, ts)
  }

  // Seed guest content (restaurants, suggestions, faq, how-to, house rules) — first run only
  for (const dir of ['restaurants', 'suggestions', 'howto']) {
    mkdirSync(join(process.cwd(), 'data', 'uploads', dir), { recursive: true })
  }

  if ((db.prepare('SELECT COUNT(*) c FROM restaurants').get() as { c: number }).c === 0) {
    const insertRestaurant = db.prepare(`
      INSERT INTO restaurants (name, type, website, description, image_path, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `)
    SEED_RESTAURANTS.forEach((r, i) => {
      const imagePath = copySeedImage('restaurants', r.image)
      insertRestaurant.run(r.name, r.type, r.website, JSON.stringify(r.description), imagePath, i, ts, ts)
    })
  }

  if ((db.prepare('SELECT COUNT(*) c FROM suggestions').get() as { c: number }).c === 0) {
    const insertSuggestion = db.prepare(`
      INSERT INTO suggestions (title, description, buttons, image_path, recurring, valid_from, valid_to, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `)
    SEED_SUGGESTIONS.forEach((s, i) => {
      const imagePath = copySeedImage('suggestions', s.image)
      insertSuggestion.run(
        JSON.stringify(s.title), JSON.stringify(s.description), s.buttons ? JSON.stringify(s.buttons) : null,
        imagePath, s.recurring ? 1 : 0, s.validFrom, s.validTo, i, ts, ts,
      )
    })
  }

  if ((db.prepare('SELECT COUNT(*) c FROM faq_items').get() as { c: number }).c === 0) {
    const insertFaq = db.prepare(`
      INSERT INTO faq_items (title, description, links, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?, ?)
    `)
    SEED_FAQ.forEach((f, i) => {
      insertFaq.run(JSON.stringify(f.title), JSON.stringify(f.description), f.links ? JSON.stringify(f.links) : null, i, ts, ts)
    })
  }

  if ((db.prepare('SELECT COUNT(*) c FROM howto_items').get() as { c: number }).c === 0) {
    const insertHowto = db.prepare(`
      INSERT INTO howto_items (title, description, image_path, links, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `)
    SEED_HOWTO.forEach((h, i) => {
      const imagePath = h.image ? copySeedImage('howto', h.image) : null
      insertHowto.run(JSON.stringify(h.title), JSON.stringify(h.description), imagePath, h.links ? JSON.stringify(h.links) : null, i, ts, ts)
    })
  }

  if ((db.prepare('SELECT COUNT(*) c FROM house_rules').get() as { c: number }).c === 0) {
    const insertRule = db.prepare(`
      INSERT INTO house_rules (text, active, sort_order, created_at, updated_at)
      VALUES (?, 1, ?, ?, ?)
    `)
    SEED_HOUSE_RULES.forEach((text, i) => {
      insertRule.run(JSON.stringify(text), i, ts, ts)
    })
  }

  // Migrations
  const jobCols = db.prepare("PRAGMA table_info(jobs)").all() as Array<{ name: string }>
  if (!jobCols.some(c => c.name === 'attempt_count')) {
    db.exec("ALTER TABLE jobs ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0")
  }
  if (!jobCols.some(c => c.name === 'lease_expires_at')) {
    db.exec("ALTER TABLE jobs ADD COLUMN lease_expires_at TEXT")
  }
  const userCols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>
  if (!userCols.some(c => c.name === 'password_hash')) {
    db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT")
  }
  if (!userCols.some(c => c.name === 'notification_level')) {
    db.exec("ALTER TABLE users ADD COLUMN notification_level TEXT NOT NULL DEFAULT 'none'")
  }
  if (!userCols.some(c => c.name === 'whatsapp_phone')) {
    db.exec("ALTER TABLE users ADD COLUMN whatsapp_phone TEXT")
  }
  if (!userCols.some(c => c.name === 'notify_housekeeper')) {
    db.exec("ALTER TABLE users ADD COLUMN notify_housekeeper INTEGER NOT NULL DEFAULT 0")
  }
  if (!userCols.some(c => c.name === 'notify_checkin')) {
    db.exec("ALTER TABLE users ADD COLUMN notify_checkin INTEGER NOT NULL DEFAULT 0")
  }
  if (!userCols.some(c => c.name === 'notes')) {
    db.exec("ALTER TABLE users ADD COLUMN notes TEXT")
  }
  if (!userCols.some(c => c.name === 'active')) {
    db.exec("ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1")
  }
  // Fix old wrong social URL defaults that may have been seeded from env vars
  const fixUrls: Array<[string, string, string]> = [
    ['instagram_url', 'https://www.instagram.com/maplenpine.bled', 'https://www.instagram.com/maple.and.pine.bled/'],
    ['facebook_url', 'https://www.facebook.com/maplenpinebled', 'https://www.facebook.com/mapleandpinebled'],
  ]
  const fixSetting = db.prepare(
    'UPDATE app_settings SET value = ?, updated_at = ? WHERE key = ? AND value = ?',
  )
  for (const [key, oldVal, newVal] of fixUrls) {
    fixSetting.run(newVal, ts, key, oldVal)
  }

  // Rename breakfast_orders → partner_orders (if old table exists)
  const hasOldTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='breakfast_orders'").get()
  const hasNewTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='partner_orders'").get()
  if (hasOldTable && !hasNewTable) {
    db.exec("ALTER TABLE breakfast_orders RENAME TO partner_orders")
  } else if (hasOldTable && hasNewTable) {
    // Both exist: breakfast_orders is the superseded table — drop it (data already in partner_orders)
    db.exec("DROP TABLE breakfast_orders")
  }

  // Ensure partner_orders has all current columns
  const poCols = db.prepare("PRAGMA table_info(partner_orders)").all() as Array<{ name: string }>
  const poNames = new Set(poCols.map(c => c.name))

  if (!poNames.has('partner_id')) {
    db.exec("ALTER TABLE partner_orders ADD COLUMN partner_id INTEGER REFERENCES partners(id)")
  }
  if (!poNames.has('partner_provision_per_unit')) {
    if (poNames.has('partner_cost_per_person')) {
      db.exec("ALTER TABLE partner_orders RENAME COLUMN partner_cost_per_person TO partner_provision_per_unit")
    } else {
      db.exec("ALTER TABLE partner_orders ADD COLUMN partner_provision_per_unit REAL NOT NULL DEFAULT 0")
    }
  }
  if (!poNames.has('margin_per_unit')) {
    if (poNames.has('margin_per_person')) {
      db.exec("ALTER TABLE partner_orders RENAME COLUMN margin_per_person TO margin_per_unit")
    } else {
      db.exec("ALTER TABLE partner_orders ADD COLUMN margin_per_unit REAL NOT NULL DEFAULT 0")
    }
  }

  const partnerCols = db.prepare("PRAGMA table_info(partners)").all() as Array<{ name: string }>
  const partnerNames = new Set(partnerCols.map(c => c.name))
  const partnerColumnMigrations: Array<[string, string]> = [
    ['breakfast_enabled', 'INTEGER NOT NULL DEFAULT 0'],
    ['breakfast_cost', 'REAL NOT NULL DEFAULT 12'],
    ['breakfast_margin', 'REAL NOT NULL DEFAULT 2'],
    ['breakfast_cutoff_hour', 'INTEGER NOT NULL DEFAULT 18'],
    ['breakfast_jan1_note', 'TEXT'],
    ['breakfast_min_count', 'INTEGER NOT NULL DEFAULT 2'],
    ['breakfast_max_count', 'INTEGER NOT NULL DEFAULT 8'],
    ['breakfast_exceptions', `TEXT NOT NULL DEFAULT '[]'`],
    ['rental_enabled', 'INTEGER NOT NULL DEFAULT 0'],
    ['rental_daily_cost', 'REAL NOT NULL DEFAULT 0'],
    ['rental_daily_margin', 'REAL NOT NULL DEFAULT 0'],
    ['rental_exceptions', `TEXT NOT NULL DEFAULT '[]'`],
    ['pickup_location_id', 'INTEGER REFERENCES locations(id)'],
    ['return_location_id', 'INTEGER REFERENCES locations(id)'],
  ]
  for (const [column, definition] of partnerColumnMigrations) {
    if (!partnerNames.has(column)) db.exec(`ALTER TABLE partners ADD COLUMN ${column} ${definition}`)
  }
  const locationCols = db.prepare("PRAGMA table_info(locations)").all() as Array<{ name: string }>
  if (!locationCols.some(c => c.name === 'address')) db.exec('ALTER TABLE locations ADD COLUMN address TEXT')
  if (!locationCols.some(c => c.name === 'google_maps_url')) db.exec('ALTER TABLE locations ADD COLUMN google_maps_url TEXT')
  if (!locationCols.some(c => c.name === 'latitude')) db.exec('ALTER TABLE locations ADD COLUMN latitude REAL')
  if (!locationCols.some(c => c.name === 'longitude')) db.exec('ALTER TABLE locations ADD COLUMN longitude REAL')
  if (!locationCols.some(c => c.name === 'free_parking')) db.exec('ALTER TABLE locations ADD COLUMN free_parking INTEGER NOT NULL DEFAULT 0')

  const restaurantCols = db.prepare("PRAGMA table_info(restaurants)").all() as Array<{ name: string }>
  if (!restaurantCols.some(c => c.name === 'location_id')) db.exec('ALTER TABLE restaurants ADD COLUMN location_id INTEGER REFERENCES locations(id)')
  if (!restaurantCols.some(c => c.name === 'website_slug')) db.exec('ALTER TABLE restaurants ADD COLUMN website_slug TEXT')

  const suggestionWebsiteCols = db.prepare("PRAGMA table_info(suggestions)").all() as Array<{ name: string }>
  if (!suggestionWebsiteCols.some(c => c.name === 'website_slug')) db.exec('ALTER TABLE suggestions ADD COLUMN website_slug TEXT')
  if (!suggestionWebsiteCols.some(c => c.name === 'youtube_url')) db.exec('ALTER TABLE suggestions ADD COLUMN youtube_url TEXT')
  const suggestionSlugs = ['life-adventure','pletna-island','horse-carriages','ojstrica','bled-breakfast','skiing','sledding','vintgar-gorge','pokljuka-gorge','radovna-valley','soca-river','zelenci','lake-bohinj','radovljica','postojna-cave','horse-ridding','ljubljana','velika-planina','zipline-dolinka','sea-side','mountains']
  const setSuggestionSlug = db.prepare('UPDATE suggestions SET website_slug=? WHERE sort_order=? AND (website_slug IS NULL OR website_slug=?)')
  suggestionSlugs.forEach((slug, index) => setSuggestionSlug.run(slug, index, ''))
  db.prepare("UPDATE suggestions SET youtube_url='https://www.youtube.com/embed/ZpIO7qyk760?si=HaZpAqX8mg89Ptbl' WHERE website_slug='life-adventure' AND youtube_url IS NULL").run()
  const restaurantSlugs = ['old-cellar','planinc','blejska-hisa','al-fresco','julijana','sova','spica','central','grajska-plaza','mega-burger']
  const setRestaurantSlug = db.prepare('UPDATE restaurants SET website_slug=? WHERE sort_order=? AND (website_slug IS NULL OR website_slug=?)')
  restaurantSlugs.forEach((slug, index) => setRestaurantSlug.run(slug, index, ''))

  // Preserve the original single-provider setup as the first breakfast provider.
  const breakfastProviderCount = (db.prepare("SELECT COUNT(*) c FROM partners WHERE category = 'breakfast'").get() as { c: number }).c
  if (breakfastProviderCount === 0) {
    let location = db.prepare("SELECT id FROM locations WHERE active = 1 ORDER BY id LIMIT 1").get() as { id: number } | undefined
    if (!location) {
      const locationResult = db.prepare("INSERT INTO locations (name, country, active, created_at) VALUES ('Bled', 'Slovenia', 1, ?)").run(ts)
      location = { id: Number(locationResult.lastInsertRowid) }
    }
    const legacyRows = db.prepare(`SELECT key, value FROM app_settings WHERE key LIKE 'breakfast_%'`).all() as Array<{ key: string; value: string }>
    const legacy = Object.fromEntries(legacyRows.map(row => [row.key, row.value]))
    const providerResult = db.prepare(`
      INSERT INTO partners (
        location_id, category, name, contact_email, whatsapp, active,
        breakfast_enabled, breakfast_cost, breakfast_margin, breakfast_cutoff_hour,
        breakfast_jan1_note, breakfast_min_count, breakfast_max_count, breakfast_exceptions, created_at, updated_at
      ) VALUES (?, 'breakfast', 'Bled Breakfast', ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      location.id,
      legacy.breakfast_partner_email || null,
      legacy.breakfast_partner_whatsapp || null,
      Number(legacy.breakfast_partner_cost || 12),
      Number(legacy.breakfast_margin || 2),
      Number(legacy.breakfast_order_cutoff_hour || 18),
      legacy.breakfast_jan1_note || null,
      Number(legacy.breakfast_min_count || 2),
      Number(legacy.breakfast_max_count_fallback || 8),
      JSON.stringify([{ date: '01-01', recurring: true }]),
      ts, ts,
    )
    const providerId = Number(providerResult.lastInsertRowid)
    db.prepare('UPDATE partner_orders SET partner_id = ? WHERE partner_id IS NULL').run(providerId)
    db.prepare("UPDATE app_settings SET value = ?, updated_at = ? WHERE key = 'breakfast_partner_id'").run(String(providerId), ts)
  } else if (!partnerNames.has('breakfast_enabled')) {
    const legacyRows = db.prepare(`SELECT key, value FROM app_settings WHERE key LIKE 'breakfast_%'`).all() as Array<{ key: string; value: string }>
    const legacy = Object.fromEntries(legacyRows.map(row => [row.key, row.value]))
    const provider = db.prepare("SELECT id FROM partners WHERE category = 'breakfast' ORDER BY id LIMIT 1").get() as { id: number }
    db.prepare(`
      UPDATE partners SET
        whatsapp = COALESCE(NULLIF(whatsapp, ''), ?), contact_email = COALESCE(NULLIF(contact_email, ''), ?),
        breakfast_enabled = 1, breakfast_cost = ?, breakfast_margin = ?, breakfast_cutoff_hour = ?,
        breakfast_jan1_note = ?, breakfast_min_count = ?, breakfast_max_count = ?,
        breakfast_exceptions = ?, updated_at = ?
      WHERE id = ?
    `).run(
      legacy.breakfast_partner_whatsapp || null, legacy.breakfast_partner_email || null,
      Number(legacy.breakfast_partner_cost || 12), Number(legacy.breakfast_margin || 2),
      Number(legacy.breakfast_order_cutoff_hour || 18), legacy.breakfast_jan1_note || null,
      Number(legacy.breakfast_min_count || 2), Number(legacy.breakfast_max_count_fallback || 8),
      JSON.stringify([{ date: '01-01', recurring: true }]), ts, provider.id,
    )
    db.prepare('UPDATE partner_orders SET partner_id = ? WHERE partner_id IS NULL').run(provider.id)
  }
  if (!partnerNames.has('breakfast_exceptions')) {
    db.prepare("UPDATE partners SET breakfast_exceptions = ? WHERE category = 'breakfast' AND (breakfast_exceptions IS NULL OR breakfast_exceptions = '[]')")
      .run(JSON.stringify([{ date: '01-01', recurring: true }]))
  }

  const guestTokenCols = db.prepare("PRAGMA table_info(guest_tokens)").all() as Array<{ name: string }>
  if (guestTokenCols.some(c => c.name === 'is_preview')) {
    db.exec("ALTER TABLE guest_tokens DROP COLUMN is_preview")
  }

  const newsCols = db.prepare("PRAGMA table_info(news)").all() as Array<{ name: string }>
  if (!newsCols.some(c => c.name === 'valid_from')) {
    db.exec("ALTER TABLE news ADD COLUMN valid_from TEXT")
  }
  if (!newsCols.some(c => c.name === 'valid_to')) {
    db.exec("ALTER TABLE news ADD COLUMN valid_to TEXT")
  }
  if (!newsCols.some(c => c.name === 'title')) db.exec("ALTER TABLE news ADD COLUMN title TEXT")
  if (!newsCols.some(c => c.name === 'content')) db.exec("ALTER TABLE news ADD COLUMN content TEXT")
  if (!newsCols.some(c => c.name === 'recurring')) db.exec("ALTER TABLE news ADD COLUMN recurring INTEGER NOT NULL DEFAULT 0")
  const emptyTranslations = JSON.stringify({ de: '', hr: '', sr: '' })
  db.prepare(`UPDATE news SET title = json_patch(?, json_object('sl', title_sl, 'en', title_en)) WHERE title IS NULL`).run(emptyTranslations)
  db.prepare(`UPDATE news SET content = json_patch(?, json_object('sl', content_sl, 'en', content_en)) WHERE content IS NULL`).run(emptyTranslations)

  for (const table of ['restaurants', 'faq_items', 'howto_items', 'house_rules']) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
    const names = new Set(columns.map(c => c.name))
    if (!names.has('recurring')) db.exec(`ALTER TABLE ${table} ADD COLUMN recurring INTEGER NOT NULL DEFAULT 0`)
    if (!names.has('valid_from')) db.exec(`ALTER TABLE ${table} ADD COLUMN valid_from TEXT`)
    if (!names.has('valid_to')) db.exec(`ALTER TABLE ${table} ADD COLUMN valid_to TEXT`)
  }

  const resCols = db.prepare("PRAGMA table_info(reservations)").all() as Array<{ name: string }>
  if (!resCols.some(c => c.name === 'guest_count')) {
    db.exec("ALTER TABLE reservations ADD COLUMN guest_count INTEGER")
  }
  if (!resCols.some(c => c.name === 'guest_lang')) {
    db.exec("ALTER TABLE reservations ADD COLUMN guest_lang TEXT")
  }
  if (!resCols.some(c => c.name === 'guest_lang_override')) {
    db.exec("ALTER TABLE reservations ADD COLUMN guest_lang_override TEXT")
  }
  if (!resCols.some(c => c.name === 'bentral_unit_name')) {
    db.exec("ALTER TABLE reservations ADD COLUMN bentral_unit_name TEXT")
  }
  if (!resCols.some(c => c.name === 'bentral_created_at')) {
    db.exec("ALTER TABLE reservations ADD COLUMN bentral_created_at TEXT")
  }
  if (!resCols.some(c => c.name === 'bentral_paired_reservation_id')) {
    db.exec("ALTER TABLE reservations ADD COLUMN bentral_paired_reservation_id TEXT")
  }
  if (!resCols.some(c => c.name === 'bentral_paired_unit_id')) {
    db.exec("ALTER TABLE reservations ADD COLUMN bentral_paired_unit_id TEXT")
  }
  if (!resCols.some(c => c.name === 'bentral_paired_unit_name')) {
    db.exec("ALTER TABLE reservations ADD COLUMN bentral_paired_unit_name TEXT")
  }

  // Seed default location and host (first run only)
  db.prepare(`INSERT OR IGNORE INTO locations (id, name, country, active, created_at) VALUES (1, 'Bled', 'Slovenia', 1, datetime('now'))`).run()
  db.prepare(`INSERT OR IGNORE INTO hosts (id, name, email, active, created_at) VALUES (1, 'Maple & Pine Bled', 'matija.volk@gmail.com', 1, datetime('now'))`).run()

  // Seed initial admin user (first run only)
  db.prepare(`
    INSERT OR IGNORE INTO users (email, role, created_at)
    VALUES ('matija.volk@gmail.com', 'admin', datetime('now'))
  `).run()

  console.log('[db] Schema ready')
})
