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
  guest_lang_override: string | null
  bentral_arrival: string | null
  bentral_departure: string | null
  bentral_status: string | null
  bentral_unit_id: string | null
  bentral_unit_name: string | null
  bentral_updated_at: string | null
  bentral_created_at: string | null
  bentral_paired_reservation_id: string | null
  bentral_paired_unit_id: string | null
  bentral_paired_unit_name: string | null
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
  notify_checkin: number
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

export interface News {
  id: number
  title_sl: string
  title_en: string
  content_sl: string
  content_en: string
  title: string
  content: string
  recurring: number
  active: number
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

export type Locale = 'en' | 'sl' | 'de' | 'hr' | 'sr'
export type LocalizedText = Record<Locale, string>

export interface RestaurantRow {
  id: number
  name: string
  type: string
  website: string | null
  description: string // JSON LocalizedText
  image_path: string | null
  active: number
  sort_order: number
  recurring: number
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

export interface SuggestionRow {
  id: number
  title: string // JSON LocalizedText
  description: string // JSON LocalizedText
  buttons: string | null // JSON Array<{label, href, target?}>
  image_path: string | null
  recurring: number
  valid_from: string | null
  valid_to: string | null
  active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FaqItemRow {
  id: number
  title: string // JSON LocalizedText
  description: string // JSON LocalizedText
  links: string | null // JSON Array<{label, href}>
  active: number
  sort_order: number
  recurring: number
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

export interface HowtoItemRow {
  id: number
  title: string // JSON LocalizedText
  description: string // JSON LocalizedText
  image_path: string | null
  links: string | null // JSON Array<{label, href}>
  active: number
  sort_order: number
  recurring: number
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

export interface HouseRuleRow {
  id: number
  text: string // JSON LocalizedText
  active: number
  sort_order: number
  recurring: number
  valid_from: string | null
  valid_to: string | null
  created_at: string
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

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// Guest portal access ends the day after checkout (date-only cutoff, ignores checkout hour)
export function guestTokenExpiry(checkOut: string): string {
  return new Date(new Date(checkOut + 'T00:00:00').getTime() + 24 * 60 * 60 * 1000).toISOString()
}
