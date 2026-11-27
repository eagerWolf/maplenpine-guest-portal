import { formatStaffNotification } from './notificationTemplates'
import { randomBytes, createHash } from 'node:crypto'
import { formatInTimeZone } from 'date-fns-tz'
import { getDb, now, type Reservation } from '../db/index'
import { getWhatsAppProvider } from './whatsapp'
import { messagingEnabled } from './servicePolicy'

const ZONE = 'Europe/Ljubljana'
type Audience = 'reception' | 'cleaners' | 'owner'
type StaffEvent = 'arrival_today' | 'reservation_changed' | 'reservation_cancelled' | 'cleaning_reminder' | 'cleaning_completed'

export function migrateStaffNotifications() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS cleaning_tasks (
      id INTEGER PRIMARY KEY, reservation_id INTEGER NOT NULL REFERENCES reservations(id),
      door TEXT NOT NULL, cleaning_date TEXT NOT NULL, token TEXT NOT NULL UNIQUE,
      confirmed_at TEXT, created_at TEXT NOT NULL,
      UNIQUE(reservation_id, door, cleaning_date)
    );
    CREATE TABLE IF NOT EXISTS staff_notifications (
      id INTEGER PRIMARY KEY, unique_key TEXT NOT NULL UNIQUE, event TEXT NOT NULL,
      reservation_id INTEGER NOT NULL, recipient TEXT NOT NULL, body TEXT NOT NULL,
      expected_arrival TEXT, expected_departure TEXT, expected_status TEXT,
      status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT NOT NULL, last_error TEXT, created_at TEXT NOT NULL, sent_at TEXT
    );
    CREATE TABLE IF NOT EXISTS notification_incidents (
      incident_key TEXT PRIMARY KEY, alerted_at TEXT NOT NULL, resolved_at TEXT
    );
    CREATE INDEX IF NOT EXISTS staff_notifications_pending ON staff_notifications(status, next_attempt_at);
  `)
}

function settings() {
  return Object.fromEntries((getDb().prepare('SELECT key, value FROM app_settings').all() as {key:string;value:string}[]).map(r => [r.key, r.value]))
}
function phone(value: string) { return '+' + value.replace(/\D/g, '') }
export function staffRecipients(audience: Audience): string[] {
  const numbers: string[] = []
  const condition = audience === 'owner' ? "staff_manager = 1" : audience === 'cleaners' ? 'notify_housekeeper = 1' : 'notify_checkin = 1'
  const users = getDb().prepare(`SELECT whatsapp_phone FROM users WHERE active != 0 AND notifications_enabled != 0 AND (${condition})`).all() as {whatsapp_phone:string|null}[]
  for (const user of users) if (user.whatsapp_phone) numbers.push(user.whatsapp_phone)
  return [...new Set(numbers.filter(n => n.replace(/\D/g, '').length >= 8).map(phone))]
}
function baseUrl() {
  const url = new URL(String(useRuntimeConfig().public.baseUrl))
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid portal base URL')
  return url.origin
}
function dateLabel(date: string) { return date.split('-').reverse().join('.') }
function summary(r: Reservation) {
  return `${r.door.replace(',', ' in ')} · ${r.first_name} ${r.last_name} · ${dateLabel(r.check_in)}–${dateLabel(r.check_out)} · oseb: ${r.guest_count ?? 'ni podatka'}`
}
export function queueStaffMessage(event: StaffEvent, key: string, reservation: Reservation, audiences: Audience[], body: string, onlyRecipients?: string[]) {
  const db = getDb()
  const recipients = new Set(onlyRecipients ?? audiences.flatMap(staffRecipients))
  let queued = 0
  for (const recipient of recipients) {
    const uniqueKey = createHash('sha256').update(`${event}:${key}:${recipient}`).digest('hex')
    queued += db.prepare(`INSERT OR IGNORE INTO staff_notifications
      (unique_key,event,reservation_id,recipient,body,expected_arrival,expected_departure,expected_status,next_attempt_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(uniqueKey,event,reservation.id,recipient,formatStaffNotification(event,body),reservation.check_in,reservation.check_out,reservation.status,now(),now()).changes
  }
  return queued
}
export function queueReceptionChange(before: Reservation, after: Reservation) {
  if(before.check_out !== after.check_out || before.door !== after.door || before.status !== after.status) {
    const db=getDb()
    db.prepare('DELETE FROM cleaning_assignments WHERE task_id IN (SELECT id FROM cleaning_tasks WHERE reservation_id=?)').run(after.id)
    for(const task of db.prepare('SELECT id FROM cleaning_tasks WHERE reservation_id=?').all(after.id) as {id:number}[]) db.prepare('UPDATE cleaning_tasks SET token=? WHERE id=?').run(randomBytes(32).toString('hex'),task.id)
  }
  const cancelled = before.status !== 'cancelled' && after.status === 'cancelled'
  const changes: string[] = []
  if (before.check_in !== after.check_in) changes.push(`Prihod: ${dateLabel(before.check_in)} → ${dateLabel(after.check_in)}`)
  if (before.check_out !== after.check_out) changes.push(`Odhod: ${dateLabel(before.check_out)} → ${dateLabel(after.check_out)}`)
  if (before.door !== after.door) changes.push(`Apartma: ${before.door} → ${after.door}`)
  if (before.guest_count !== after.guest_count) changes.push(`Oseb: ${before.guest_count ?? '?'} → ${after.guest_count ?? '?'}`)
  if (!cancelled && !changes.length) return
  const event = cancelled ? 'reservation_cancelled' : 'reservation_changed'
  const key = `${after.id}:${after.updated_at}:${JSON.stringify([before.door,before.check_in,before.check_out,before.guest_count,after.door,after.check_in,after.check_out,after.guest_count,after.status])}`
  const text = `${cancelled ? 'Rezervacija je odpovedana' : 'Sprememba rezervacije'}\n${summary(after)}${changes.length ? '\n'+changes.join('\n') : ''}\n${baseUrl()}/admin`
  queueStaffMessage(event,key,after,['reception'],text)
}
export function ensureCleaningTask(r: Reservation, door: string) {
  const db = getDb()
  db.prepare(`INSERT OR IGNORE INTO cleaning_tasks (reservation_id,door,cleaning_date,token,created_at) VALUES (?,?,?,?,?)`)
    .run(r.id,door,r.check_out,randomBytes(32).toString('hex'),now())
  return db.prepare('SELECT * FROM cleaning_tasks WHERE reservation_id=? AND door=? AND cleaning_date=?').get(r.id,door,r.check_out) as CleaningTask
}
interface CleaningTask { id:number; reservation_id:number; door:string; cleaning_date:string; token:string; confirmed_at:string|null; confirmed_by_name?:string|null; confirmed_by_user_id?:number|null }
export function getCleaningTask(token: string, reference = new Date()) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw createError({statusCode:404,statusMessage:'Povezava ni veljavna'})
  const db = getDb()
  const assignment=db.prepare(`SELECT a.task_id,a.user_id,u.name,u.email,u.active,u.notify_housekeeper,u.notifications_enabled FROM cleaning_assignments a LEFT JOIN users u ON u.id=a.user_id WHERE a.token=?`).get(token) as {task_id:number;user_id:number;name:string;email:string;active:number;notify_housekeeper:number;notifications_enabled:number}|undefined
  if(assignment && (!assignment.active || !assignment.notify_housekeeper || !assignment.notifications_enabled)) throw createError({statusCode:410,statusMessage:'Povezava ni več aktivna.'})
  if(!assignment) throw createError({statusCode:410,statusMessage:'Uporabite osebno povezavo za potrditev.'})
  const task = db.prepare('SELECT * FROM cleaning_tasks WHERE id=?').get(assignment.task_id) as CleaningTask | undefined
  if (!task) throw createError({statusCode:404,statusMessage:'Povezava ni veljavna'})
  const r = db.prepare('SELECT * FROM reservations WHERE id=?').get(task.reservation_id) as Reservation | undefined
  const today = formatInTimeZone(reference,ZONE,'yyyy-MM-dd')
  if (!r || r.status !== 'active' || r.check_out !== task.cleaning_date || !r.door.split(',').includes(task.door) || today > task.cleaning_date)
    throw createError({statusCode:410,statusMessage:'Povezava je potekla ali rezervacija ni več veljavna'})
  return {task,reservation:r,assignment,canConfirm:today === task.cleaning_date}
}
export function confirmCleaning(token: string, reference = new Date()) {
  const db = getDb()
  return db.transaction(() => {
    const {task,reservation,canConfirm,assignment} = getCleaningTask(token,reference)
    if (task.confirmed_at) return {confirmedAt:task.confirmed_at,alreadyConfirmed:true}
    if (!canConfirm) throw createError({statusCode:409,statusMessage:'Čiščenje lahko potrdite na dan odhoda gostov'})
    const timestamp = reference.toISOString()
    db.prepare('UPDATE cleaning_tasks SET confirmed_at=?,confirmed_by_user_id=?,confirmed_by_name=? WHERE id=? AND confirmed_at IS NULL').run(timestamp,assignment?.user_id??null,assignment?.name || assignment?.email || 'Stara skupna povezava',task.id)
    queueStaffMessage('cleaning_completed',String(task.id),reservation,['owner','reception'],
      `${task.door} je pospravljen in pripravljen za prihod gostov.\nPotrdila oseba: ${assignment?.name || assignment?.email || 'stara skupna povezava'}.\nPotrjeno: ${formatInTimeZone(reference,ZONE,'dd.MM.yyyy HH:mm')}\nPredviden začetek veljavnosti PIN-a za naslednji prihod je ob 13:00; preverite stanje dostopa v portalu.\n${baseUrl()}/admin`)
    return {confirmedAt:timestamp,alreadyConfirmed:false}
  })()
}
export function queueStaffReminders(reference = new Date()) {
  const db = getDb()
  const today = formatInTimeZone(reference,ZONE,'yyyy-MM-dd')
  const tomorrow = new Date(Date.parse(today+'T12:00:00Z')+86400000).toISOString().slice(0,10)
  const hour = Number(formatInTimeZone(reference,ZONE,'HH'))
  if (hour >= 9) {
    const arrivals = db.prepare("SELECT * FROM reservations WHERE status='active' AND check_in=?").all(today) as Reservation[]
    for (const r of arrivals) queueStaffMessage('arrival_today',`${r.id}:${today}`,r,['reception'],`Danes prihajajo gostje\n${summary(r)}\n${baseUrl()}/admin`)
  }
  if (hour >= 10) {
    const departures = db.prepare("SELECT * FROM reservations WHERE status='active' AND check_out=?").all(tomorrow) as Reservation[]
    for (const r of departures) for (const door of r.door.split(',').filter(d => ['Maple','Pine'].includes(d))) {
      const task = ensureCleaningTask(r,door)
      const next = db.prepare("SELECT check_in FROM reservations WHERE status='active' AND id!=? AND check_in>=? AND (door=? OR door='Maple,Pine') ORDER BY check_in LIMIT 1").get(r.id,r.check_out,door) as {check_in:string}|undefined
      const cleaners=db.prepare('SELECT id,name,whatsapp_phone FROM users WHERE active!=0 AND notifications_enabled!=0 AND notify_housekeeper=1').all() as {id:number;name:string;whatsapp_phone:string|null}[]
      for(const cleaner of cleaners) {
        if(!cleaner.whatsapp_phone || cleaner.whatsapp_phone.replace(/\D/g,'').length<8) continue
        db.prepare('INSERT OR IGNORE INTO cleaning_assignments(token,task_id,user_id,created_at) VALUES(?,?,?,?)').run(randomBytes(32).toString('hex'),task.id,cleaner.id,now())
        const assignment=db.prepare('SELECT token FROM cleaning_assignments WHERE task_id=? AND user_id=?').get(task.id,cleaner.id) as {token:string}
        queueStaffMessage('cleaning_reminder',`${task.id}:${r.check_out}:${cleaner.id}`,r,['cleaners'],`Jutri čiščenje: ${door} (${dateLabel(r.check_out)}).\nOdhod gostov ob ${settings().bentral_checkout_time || '11:00'}.\n${next ? `Naslednji prihod: ${dateLabel(next.check_in)}${next.check_in === r.check_out ? ' (menjava isti dan)' : ''}.` : 'Naslednji prihod še ni zabeležen.'}\nKo je apartma pospravljen, odprite povezavo in potrdite:\n${baseUrl()}/cleaning/${assignment.token}`, [phone(cleaner.whatsapp_phone)])
      }
    }
  }
}
let delivering = false
export async function processStaffNotifications(reference = new Date()) {
  if (!messagingEnabled() || delivering) return
  delivering = true
  const db = getDb()
  try {
    // A crash after the provider accepted a send must not cause a blind duplicate.
    db.prepare("UPDATE staff_notifications SET status='failed',last_error='Delivery unknown after restart; inspect provider before retry' WHERE status='sending'").run()
    const rows = db.prepare("SELECT * FROM staff_notifications WHERE status='pending' AND next_attempt_at<=? ORDER BY id LIMIT 30").all(reference.toISOString()) as any[]
    for (const row of rows) {
      const r = db.prepare('SELECT * FROM reservations WHERE id=?').get(row.reservation_id) as Reservation|undefined
      const localDay = formatInTimeZone(reference,ZONE,'yyyy-MM-dd')
      const audience: Audience = row.event === 'cleaning_reminder' ? 'cleaners' : 'reception'
      const allowed = row.event === 'cleaning_completed' ? [...staffRecipients('owner'),...staffRecipients('reception')] : staffRecipients(audience)
      const personalToken = row.event === 'cleaning_reminder' ? String(row.body).match(/\/cleaning\/([a-f0-9]{64})/)?.[1] : null
      const validLink = !personalToken || !!db.prepare('SELECT 1 FROM cleaning_assignments WHERE token=?').get(personalToken)
      const stale = !validLink || !allowed.includes(row.recipient) || (row.event === 'arrival_today' && row.expected_arrival !== localDay)
        || (row.event === 'cleaning_reminder' && row.expected_departure <= localDay)
        || (row.event === 'cleaning_completed' && row.expected_departure !== localDay)
      if (stale || !r || r.status !== row.expected_status || r.check_in !== row.expected_arrival || r.check_out !== row.expected_departure) {
        db.prepare("UPDATE staff_notifications SET status='obsolete' WHERE id=?").run(row.id); continue
      }
      if (!db.prepare("UPDATE staff_notifications SET status='sending' WHERE id=? AND status='pending'").run(row.id).changes) continue
      try {
        const prefix = process.env.PORTAL_ENVIRONMENT === 'test' || String(useRuntimeConfig().public.baseUrl).includes('guesttest.') ? '[TEST] ' : ''
        await getWhatsAppProvider().send(row.recipient,prefix+row.body)
        db.prepare("UPDATE staff_notifications SET status='sent',sent_at=?,attempts=attempts+1 WHERE id=?").run(now(),row.id)
        logStaffDelivery(row,'sent')
      } catch (error) {
        // Delivery can be uncertain after a network failure; require review rather than send twice.
        const message = error instanceof Error ? error.message : String(error)
        db.prepare("UPDATE staff_notifications SET status='failed',attempts=attempts+1,last_error=? WHERE id=?").run(message,row.id)
        logStaffDelivery(row,'failed',message)
        const {notifyAdmins} = await import('./notify')
        await notifyAdmins({event:'pin_send_failed',subject:`Napaka WhatsApp obvestila ${row.id}`,emailHtml:'<p>Obvestilo osebju potrebuje pregled.</p>',whatsappText:`WhatsApp obvestilo osebju (${row.event}) ni uspelo. Preverite dnevnik obvestil v portalu.`}).catch(() => {})
      }
    }
  } finally { delivering = false }
}

function logStaffDelivery(row: {event:string;recipient:string;body:string;reservation_id:number},status:string,error?:string) {
  getDb().prepare(`INSERT INTO notification_log(channel,event_type,recipient,subject,body,status,error,reference_id,created_at)
    VALUES('whatsapp',?,?,NULL,?,?,?,?,?)`).run(row.event,row.recipient,row.body,status,error ?? null,row.reservation_id,now())
}
