import { getDb } from '../db/index'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

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
      updated_at TEXT
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

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Slovenia',
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
      active INTEGER NOT NULL DEFAULT 1,
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
    ['bentral_api_key', ''],
    ['breakfast_partner_id', ''],
    ['breakfast_enabled', '0'],
    ['breakfast_partner_cost', '12.00'],
    ['breakfast_margin', '2.00'],
    ['breakfast_partner_whatsapp', ''],
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
    ['reception_whatsapp', ''],
  ]
  const ins = db.prepare(
    'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
  )
  for (const [key, value] of defaults) {
    ins.run(key, value, ts)
  }

  // Migrations
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
