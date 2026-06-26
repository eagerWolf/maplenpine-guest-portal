import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { join } from 'path'

// Types
export interface Reservation {
  id: number
  bentral_reservation_id: string
  door: string
  first_name: string
  last_name: string
  check_in: string
  check_out: string
  status: string
  pin: string | null
  access_valid_from: string | null
  access_valid_until: string | null
  guest_count: number | null
  guest_email: string | null
  guest_phone: string | null
  guest_lang: string | null
  bentral_arrival: string | null
  bentral_departure: string | null
  bentral_status: string | null
  bentral_unit_id: string | null
  bentral_updated_at: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: number
  reservation_id: number
  action: string
  status: string
  triggered_by: string | null
  payload: string | null
  result: string | null
  reason: string | null
  created_at: string
  updated_at: string | null
}

export interface DbUser {
  id: number
  email: string
  role: string
  password_hash: string | null
  notification_level: string
  whatsapp_phone: string | null
  notify_housekeeper: number
  notes: string | null
  active: number
  created_at: string
}

export interface GuestToken {
  id: number
  reservation_id: number
  token: string
  expires_at: string
  created_at: string
}

export interface AuthToken {
  id: number
  email: string
  token: string
  expires_at: string
  used: number
  created_at: string
}

export interface AppSetting {
  key: string
  value: string
  updated_at: string
}

export interface AuditLog {
  id: number
  user_id: number | null
  user_email: string | null
  action: string
  detail: string | null
  created_at: string
}

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  const dataDir = join(process.cwd(), 'data')
  mkdirSync(dataDir, { recursive: true })
  _db = new Database(join(dataDir, 'portal.db'))
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  return _db
}

export function now(): string {
  return new Date().toISOString()
}
