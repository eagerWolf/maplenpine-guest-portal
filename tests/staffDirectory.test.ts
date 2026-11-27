import Database from 'better-sqlite3'
import {it,expect,vi,afterEach} from 'vitest'
import {migrateStaffDirectory} from '../server/utils/staffDirectory'
let db:Database.Database
vi.mock('../server/db/index',()=>({getDb:()=>db}))
const calendar=(await import('../server/api/staff/cleaning-calendar.get')).default
const guard=(await import('../server/middleware/session-version')).default
function setup(){vi.stubGlobal('createError',(o:any)=>new Error(o.statusMessage));db=new Database(':memory:');db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY,email TEXT UNIQUE,role TEXT,notification_level TEXT,active INTEGER DEFAULT 1,notify_housekeeper INTEGER DEFAULT 0,notify_checkin INTEGER DEFAULT 0,whatsapp_phone TEXT,created_at TEXT,password_version INTEGER DEFAULT 0); CREATE TABLE app_settings(key TEXT,value TEXT);CREATE TABLE cleaning_tasks(id INTEGER PRIMARY KEY,reservation_id INTEGER,door TEXT,cleaning_date TEXT,confirmed_at TEXT); CREATE TABLE reservations(id INTEGER PRIMARY KEY,door TEXT,check_out TEXT,status TEXT,first_name TEXT,pin TEXT); INSERT INTO users(id,email,role,notification_level,whatsapp_phone) VALUES(1,'owner@test','admin','errors','+38640111111'); INSERT INTO app_settings VALUES('housekeeper_whatsapp','+386 40 222 222'),('reception_whatsapp','+38640222222');`);migrateStaffDirectory(db)}
afterEach(()=>{db?.close();vi.unstubAllGlobals()})
it('migrates once, merges duplicate phones, grants no login and defaults notifications on',()=>{setup();const people=db.prepare('SELECT * FROM users ORDER BY id').all() as any[];expect(people).toHaveLength(2);expect(people[1]).toMatchObject({portal_access:0,notifications_enabled:1,notify_housekeeper:1,notify_checkin:1});db.exec('UPDATE users SET notify_housekeeper=0 WHERE id=2');migrateStaffDirectory(db);expect(db.prepare('SELECT notify_housekeeper FROM users WHERE id=2').get()).toEqual({notify_housekeeper:0})})
it('cleaner calendar never returns guest details or PINs',async()=>{setup();db.exec("INSERT INTO reservations VALUES(1,'Pine','2026-12-04','active','Sensitive guest','1234')");vi.stubGlobal('requireUserSession',async()=>({user:{id:2,role:'staff'}}));vi.stubGlobal('getQuery',()=>({month:'2026-12'}));expect(await calendar({} as any)).toEqual([{door:'Pine',date:'2026-12-04',completed:0}])})
it('blocks direct API access by cleaners and revokes sessions without portal access',async()=>{setup();db.exec("UPDATE users SET portal_access=1,notify_checkin=0 WHERE id=2");vi.stubGlobal('getUserSession',async()=>({user:{id:2,passwordVersion:0}}));vi.stubGlobal('getRequestURL',()=>new URL('https://portal.test/api/staff/calendar'));vi.stubGlobal('clearUserSession',vi.fn());await expect(guard({path:'/api/staff/calendar'} as any)).rejects.toThrow('koledar');db.exec('UPDATE users SET portal_access=0 WHERE id=2');await expect(guard({path:'/api/staff/cleaning-calendar'} as any)).rejects.toThrow('Seja');expect(clearUserSession).toHaveBeenCalled()})
it('allows cleaner calendar but denies all other reservation APIs',async()=>{
 setup();db.exec('UPDATE users SET portal_access=1,notify_checkin=0 WHERE id=2')
 vi.stubGlobal('getUserSession',async()=>({user:{id:2,passwordVersion:0}}))
 vi.stubGlobal('getRequestURL',()=>new URL('https://portal.test/api/staff/cleaning-calendar'))
 await expect(guard({path:'/api/staff/cleaning-calendar'} as any)).resolves.toBeUndefined()
 for(const path of ['/api/staff/guests','/api/admin/users','/api/staff/calendar']) {
 vi.stubGlobal('getRequestURL',()=>new URL('https://portal.test'+path))
 await expect(guard({path} as any)).rejects.toThrow('koledar')
 }
})
