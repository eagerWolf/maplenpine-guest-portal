import Database from 'better-sqlite3'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
let db: Database.Database
const send=vi.hoisted(()=>vi.fn().mockResolvedValue(undefined))
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
vi.mock('../server/utils/whatsapp',()=>({getWhatsAppProvider:()=>({send})}))
vi.mock('../server/utils/email',()=>({getEmailConfig:()=>({configured:false}),sendEmail:vi.fn()}))
const {notifyAdmins,resolveNotification}=await import('../server/utils/notify')
beforeEach(()=>{
  vi.stubEnv('PORTAL_WHATSAPP_ENABLED','true');send.mockReset().mockResolvedValue(undefined)
  vi.stubGlobal('useRuntimeConfig',()=>({public:{baseUrl:'https://portal.test'}}))
  db=new Database(':memory:')
  db.exec(`CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT);
    CREATE TABLE users(id INTEGER PRIMARY KEY,email TEXT,role TEXT,active INTEGER,notification_level TEXT,whatsapp_phone TEXT);
    CREATE TABLE notification_incidents(incident_key TEXT PRIMARY KEY,alerted_at TEXT,resolved_at TEXT);
    CREATE TABLE notification_log(id INTEGER PRIMARY KEY,user_id INTEGER,user_email TEXT,channel TEXT,event_type TEXT,recipient TEXT,subject TEXT,body TEXT,status TEXT,error TEXT,reference_id INTEGER,created_at TEXT);
    INSERT INTO users VALUES(1,'owner@test','admin',1,'errors','+38640111111'),(2,'staff@test','staff',1,'all','+38640222222');`)
})
afterEach(()=>{db.close();vi.unstubAllEnvs()})
const failure={event:'sync_error' as const,subject:'Bentral error',emailHtml:'',whatsappText:'Napaka'}
it('only sends technical errors to the owner and suppresses repeats until recovery',async()=>{
  await notifyAdmins(failure);await notifyAdmins(failure)
  expect(send).toHaveBeenCalledTimes(1);expect(send.mock.calls[0]?.[0]).toBe('+38640111111')
  await resolveNotification('sync_error','Bentral error','Deluje');await resolveNotification('sync_error','Bentral error','Deluje')
  expect(send).toHaveBeenCalledTimes(2)
  await notifyAdmins(failure);expect(send).toHaveBeenCalledTimes(3)
})
it('does not send routine successful PIN notifications even to all-level administrators',async()=>{
  db.exec("UPDATE users SET notification_level='all' WHERE id=1")
  await notifyAdmins({...failure,event:'pin_added'});await notifyAdmins({...failure,event:'pin_updated'})
  expect(send).not.toHaveBeenCalled()
})
it('does not mark an error as notified when delivery failed',async()=>{
  send.mockRejectedValue(new Error('offline'))
  await notifyAdmins(failure)
  expect(db.prepare('SELECT COUNT(*) n FROM notification_incidents').get()).toEqual({n:0})
})
