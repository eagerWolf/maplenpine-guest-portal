import Database from 'better-sqlite3'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Reservation } from '../server/db/index'

let db: Database.Database
const send = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock('../server/db/index', () => ({getDb:()=>db,now:()=>new Date().toISOString()}))
vi.mock('../server/utils/notify', () => ({notifyAdmins:vi.fn().mockResolvedValue(undefined)}))
vi.mock('../server/utils/whatsapp', () => ({getWhatsAppProvider:()=>({send})}))
const staff = await import('../server/utils/staffNotifications')
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-21T12:00:00Z')); send.mockReset().mockResolvedValue(undefined)
  vi.stubGlobal('useRuntimeConfig',()=>({public:{baseUrl:'https://guesttest.example.com'}}))
  vi.stubEnv('PORTAL_WHATSAPP_ENABLED','true')
  db = new Database(':memory:')
  db.exec(`CREATE TABLE reservations(id INTEGER PRIMARY KEY,door TEXT,check_in TEXT,check_out TEXT,status TEXT,first_name TEXT,last_name TEXT,guest_count INTEGER,updated_at TEXT);
    CREATE TABLE notification_log(id INTEGER PRIMARY KEY,channel TEXT,event_type TEXT,recipient TEXT,subject TEXT,body TEXT,status TEXT,error TEXT,reference_id INTEGER,created_at TEXT);
    CREATE TABLE users(id INTEGER PRIMARY KEY,role TEXT,active INTEGER,notification_level TEXT,notify_housekeeper INTEGER,notify_checkin INTEGER,whatsapp_phone TEXT);
    CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT);
    INSERT INTO users VALUES(1,'admin',1,'errors',0,0,'+38640111111'),(2,'staff',1,'all',0,1,'+38640222222'),(3,'staff',1,'none',1,0,'+38640333333');
    INSERT INTO app_settings VALUES('reception_whatsapp','+386 40 222 222');
    INSERT INTO reservations VALUES(1,'Pine','2026-11-19','2026-11-22','active','Ana','Test',2,'a'),(2,'Pine','2026-11-22','2026-11-25','active','Test','Guest',3,'a');`)
  staff.migrateStaffNotifications()
  db.exec("ALTER TABLE users ADD COLUMN staff_manager INTEGER DEFAULT 0; ALTER TABLE users ADD COLUMN notifications_enabled INTEGER DEFAULT 1; UPDATE users SET staff_manager=1 WHERE role='admin';")
  db.exec("ALTER TABLE users ADD COLUMN name TEXT DEFAULT 'Čistilka'; ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''; CREATE TABLE cleaning_assignments(token TEXT PRIMARY KEY,task_id INTEGER,user_id INTEGER,created_at TEXT,UNIQUE(task_id,user_id)); ALTER TABLE cleaning_tasks ADD COLUMN confirmed_by_user_id INTEGER; ALTER TABLE cleaning_tasks ADD COLUMN confirmed_by_name TEXT;")
})
afterEach(()=>{db.close();vi.useRealTimers();vi.unstubAllEnvs()})
function reservation(id=1) {return db.prepare('SELECT * FROM reservations WHERE id=?').get(id) as Reservation}
function task() {staff.queueStaffReminders();return db.prepare('SELECT a.token,t.confirmed_at FROM cleaning_assignments a JOIN cleaning_tasks t ON t.id=a.task_id').get() as {token:string;confirmed_at:string|null}}

it('queues one cleaner reminder per apartment with next arrival and confirmation link',()=>{
  const link = task();staff.queueStaffReminders()
  const rows = db.prepare('SELECT * FROM staff_notifications').all() as any[]
  expect(rows).toHaveLength(1)
  expect(rows[0].recipient).toBe('+38640333333')
  expect(rows[0].body).toContain(`/cleaning/${link.token}`)
  expect(rows[0].body).toContain('menjava isti dan')
  expect(rows[0].body).not.toContain('PIN:')
})
it('opening the link is read-only and cannot confirm before the cleaning day',()=>{
  const link=task()
  expect(staff.getCleaningTask(link.token).canConfirm).toBe(false)
  expect(staff.getCleaningTask(link.token).task.confirmed_at).toBeNull()
  expect(()=>staff.confirmCleaning(link.token)).toThrow('na dan odhoda')
})
it('confirms once and queues only owner and reception, without any guest send',()=>{
  const link=task();vi.setSystemTime(new Date('2026-11-22T09:00:00Z'))
  expect(staff.confirmCleaning(link.token).alreadyConfirmed).toBe(false)
  expect(staff.confirmCleaning(link.token).alreadyConfirmed).toBe(true)
  const messages=db.prepare("SELECT * FROM staff_notifications WHERE event='cleaning_completed'").all() as any[]
  expect(messages).toHaveLength(2)
  expect(messages.map(m=>m.recipient).sort()).toEqual(['+38640111111','+38640222222'])
  expect(messages.every(m=>!m.body.includes('PIN:'))).toBe(true)
})
it('deduplicates an owner who is also in reception',()=>{
  db.prepare('UPDATE users SET notify_checkin=1 WHERE id=1').run()
  const link=task();vi.setSystemTime(new Date('2026-11-22T09:00:00Z'));staff.confirmCleaning(link.token)
  expect(db.prepare("SELECT COUNT(*) n FROM staff_notifications WHERE event='cleaning_completed'").get()).toEqual({n:2})
})
it.each(['cancelled','moved','expired'])('rejects a %s cleaning link',state=>{
  const link=task()
  if(state==='cancelled')db.prepare("UPDATE reservations SET status='cancelled' WHERE id=1").run()
  if(state==='moved')db.prepare("UPDATE reservations SET check_out='2026-11-23' WHERE id=1").run()
  if(state==='expired')vi.setSystemTime(new Date('2026-11-23T00:00:00Z'))
  expect(()=>staff.getCleaningTask(link.token)).toThrow()
})
it('makes a separate link for each apartment of a paired reservation',()=>{
  db.prepare("UPDATE reservations SET door='Maple,Pine' WHERE id=1").run();staff.queueStaffReminders()
  expect(db.prepare('SELECT COUNT(*) n FROM cleaning_tasks').get()).toEqual({n:2})
})
it('sends arrival reminder on the day at 09:00, never the day before',()=>{
  staff.queueStaffReminders();expect(db.prepare("SELECT COUNT(*) n FROM staff_notifications WHERE event='arrival_today'").get()).toEqual({n:0})
  vi.setSystemTime(new Date('2026-11-22T07:59:00Z'));staff.queueStaffReminders()
  expect(db.prepare("SELECT COUNT(*) n FROM staff_notifications WHERE event='arrival_today'").get()).toEqual({n:0})
  vi.setSystemTime(new Date('2026-11-22T08:00:00Z'));staff.queueStaffReminders();staff.queueStaffReminders()
  expect(db.prepare("SELECT COUNT(*) n FROM staff_notifications WHERE event='arrival_today'").get()).toEqual({n:1})
})
it('only queues important changes and cancellations for reception',()=>{
  const before=reservation(2)
  staff.queueReceptionChange(before,{...before,updated_at:'b'})
  expect(db.prepare('SELECT COUNT(*) n FROM staff_notifications').get()).toEqual({n:0})
  staff.queueReceptionChange(before,{...before,guest_count:4,updated_at:'c'})
  staff.queueReceptionChange(before,{...before,status:'cancelled',updated_at:'d'})
  expect((db.prepare('SELECT event,recipient FROM staff_notifications').all() as any[])).toEqual([
    {event:'reservation_changed',recipient:'+38640222222'}, {event:'reservation_cancelled',recipient:'+38640222222'},
  ])
})
it('does not send obsolete reminders, duplicates, or anything while WhatsApp is disabled',async()=>{
  task();vi.stubEnv('PORTAL_WHATSAPP_ENABLED','false');await staff.processStaffNotifications();expect(send).not.toHaveBeenCalled()
  vi.stubEnv('PORTAL_WHATSAPP_ENABLED','true');db.prepare("UPDATE reservations SET status='cancelled' WHERE id=1").run()
  await staff.processStaffNotifications();expect(send).not.toHaveBeenCalled()
})
it('marks delivery uncertain after a send failure instead of blindly duplicating',async()=>{
  task();send.mockRejectedValue(new Error('timeout'))
  await staff.processStaffNotifications();await staff.processStaffNotifications()
  expect(send).toHaveBeenCalledTimes(1)
  expect(db.prepare('SELECT status FROM staff_notifications').get()).toEqual({status:'failed'})
})
it('delivers staff messages once and labels the test environment',async()=>{
  task();await staff.processStaffNotifications();await staff.processStaffNotifications()
  expect(send).toHaveBeenCalledTimes(1)
  expect(send.mock.calls[0]?.[1]).toContain('[TEST]')
})
it('issues personal tokens, records the first cleaner and never overwrites confirmation',()=>{
  db.exec("INSERT INTO users(id,role,active,notification_level,notify_housekeeper,notify_checkin,whatsapp_phone,name) VALUES(4,'staff',1,'none',1,0,'+38640444444','Druga čistilka')")
  staff.queueStaffReminders()
  const assignments=db.prepare('SELECT user_id,token FROM cleaning_assignments ORDER BY user_id').all() as {user_id:number;token:string}[]
  expect(assignments).toHaveLength(2);expect(assignments[0]!.token).not.toBe(assignments[1]!.token)
  vi.setSystemTime(new Date('2026-11-22T09:00:00Z'))
  staff.confirmCleaning(assignments[1]!.token)
  expect(staff.confirmCleaning(assignments[0]!.token).alreadyConfirmed).toBe(true)
  expect(db.prepare('SELECT confirmed_by_user_id,confirmed_by_name FROM cleaning_tasks').get()).toEqual({confirmed_by_user_id:4,confirmed_by_name:'Druga čistilka'})
  expect((db.prepare("SELECT body FROM staff_notifications WHERE event='cleaning_completed' LIMIT 1").get() as {body:string}).body).toContain('Druga čistilka')
})
it('revokes personal links and queued sends when notifications or cleaner access are disabled',async()=>{
 const link=task(); db.exec('UPDATE users SET notifications_enabled=0 WHERE id=3')
 expect(()=>staff.getCleaningTask(link.token)).toThrow()
 await staff.processStaffNotifications();expect(send).not.toHaveBeenCalled()
 db.exec('UPDATE users SET notifications_enabled=1,active=0 WHERE id=3')
 expect(()=>staff.getCleaningTask(link.token)).toThrow()
})
it('permanently invalidates personal tokens after a cancellation even if reservation is restored',()=>{
 const link=task(),before=reservation();const after={...before,status:'cancelled',updated_at:'cancel'}
 staff.queueReceptionChange(before,after)
 db.exec("UPDATE reservations SET status='cancelled' WHERE id=1")
 expect(()=>staff.getCleaningTask(link.token)).toThrow()
 db.exec("UPDATE reservations SET status='active' WHERE id=1")
 expect(()=>staff.getCleaningTask(link.token)).toThrow()
})
it('rejects old shared links that cannot identify a cleaner',()=>{
 task();const shared=db.prepare('SELECT token FROM cleaning_tasks').get() as {token:string}
 expect(()=>staff.getCleaningTask(shared.token)).toThrow('osebno povezavo')
})
