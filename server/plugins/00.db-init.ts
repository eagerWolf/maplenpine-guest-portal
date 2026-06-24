import { getDb } from '../db/index'

export default defineNitroPlugin(() => {
  const db = getDb()

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
  const resCols = db.prepare("PRAGMA table_info(reservations)").all() as Array<{ name: string }>
  if (!resCols.some(c => c.name === 'guest_count')) {
    db.exec("ALTER TABLE reservations ADD COLUMN guest_count INTEGER")
  }
  if (!resCols.some(c => c.name === 'guest_lang')) {
    db.exec("ALTER TABLE reservations ADD COLUMN guest_lang TEXT")
  }

  // Seed initial admin user (first run only)
  db.prepare(`
    INSERT OR IGNORE INTO users (email, role, created_at)
    VALUES ('matija.volk@gmail.com', 'admin', datetime('now'))
  `).run()

  console.log('[db] Schema ready')
})
