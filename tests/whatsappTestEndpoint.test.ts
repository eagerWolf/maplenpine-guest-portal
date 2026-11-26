import Database from 'better-sqlite3'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
let db:Database.Database
const send = vi.hoisted(()=>vi.fn())
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
vi.mock('../server/utils/whatsapp',()=>({getWhatsAppProvider:()=>({send})}))
vi.mock('../server/utils/rateLimit',()=>({enforceRateLimit:vi.fn()}))
const handler = (await import('../server/api/admin/whatsapp/test.post')).default
const recipientHandler = (await import('../server/api/admin/whatsapp/recipient.get')).default
beforeEach(()=>{
 db = new Database(':memory:')
 db.exec(`CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT); INSERT INTO app_settings VALUES('notification_test_phone','+38640111111'); CREATE TABLE users(id INTEGER PRIMARY KEY, whatsapp_phone TEXT, active INTEGER, role TEXT); INSERT INTO users VALUES(1,'+38640333333',1,'admin'),(2,'+38640444444',1,'admin'); CREATE TABLE notification_log(channel,event_type,recipient,body,status,created_at);`)
 send.mockReset().mockResolvedValue(undefined)
 vi.stubGlobal('requireUserSession',async()=>({user:{id:1,role:'admin'}}))
 vi.stubGlobal('readBody',async()=>({type:'cleaning_reminder',to:'+38640222222'}))
 vi.stubGlobal('useRuntimeConfig',()=>({public:{baseUrl:'https://guesttest.example.com'}}))
})
afterEach(()=>db.close())
it('only sends to current admin profile number, never arbitrary request recipient, with inert cleaning link',async()=>{
 await handler({} as any)
 expect(send.mock.calls[0]?.[0]).toBe('+38640333333')
 expect(send.mock.calls[0]?.[1]).toContain('[TEST] ')
 expect(send.mock.calls[0]?.[1]).toContain('/cleaning/test-preview')
 expect(db.prepare('SELECT status FROM notification_log').get()).toEqual({status:'sent'})
})
it('rejects non-admins and invalid event types without sending',async()=>{
 vi.stubGlobal('requireUserSession',async()=>({user:{role:'staff'}}))
 await expect(handler({} as any)).rejects.toThrow('Ni dovoljenja')
 vi.stubGlobal('requireUserSession',async()=>({user:{id:1,role:'admin'}}))
 vi.stubGlobal('readBody',async()=>({type:'not-an-event'}))
 await expect(handler({} as any)).rejects.toThrow('Neznana')
 expect(send).not.toHaveBeenCalled()
})
it('records failed delivery without returning provider credentials or retrying',async()=>{
 send.mockRejectedValue(new Error('private provider detail'))
 await expect(handler({} as any)).rejects.toThrow('Test ni uspel')
 expect(send).toHaveBeenCalledTimes(1)
 expect(db.prepare('SELECT status FROM notification_log').get()).toEqual({status:'failed'})
})

it('uses each logged-in admin independently and ignores the old shared number',async()=>{
 vi.stubGlobal('requireUserSession',async()=>({user:{id:2,role:'admin'}}))
 expect(await recipientHandler({} as any)).toEqual({recipient:'+38640444444',valid:true})
 await handler({} as any)
 expect(send.mock.calls[0]?.[0]).toBe('+38640444444')
})
it('does not fall back to a shared number for missing, invalid, inactive or removed profiles',async()=>{
 for (const phone of [null, '', '040123456']) {
  db.prepare('UPDATE users SET whatsapp_phone=? WHERE id=1').run(phone)
  expect((await recipientHandler({} as any)).valid).toBe(false)
  await expect(handler({} as any)).rejects.toThrow('WhatsApp številko')
 }
 db.prepare("UPDATE users SET whatsapp_phone='+38640333333',active=0 WHERE id=1").run()
 await expect(handler({} as any)).rejects.toThrow('WhatsApp številko')
 db.prepare('DELETE FROM users WHERE id=1').run()
 await expect(handler({} as any)).rejects.toThrow('WhatsApp številko')
 expect(send).not.toHaveBeenCalled()
})
