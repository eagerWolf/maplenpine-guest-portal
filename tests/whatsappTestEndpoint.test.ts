import Database from 'better-sqlite3'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
let db:Database.Database
const send = vi.hoisted(()=>vi.fn())
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
vi.mock('../server/utils/whatsapp',()=>({getWhatsAppProvider:()=>({send})}))
vi.mock('../server/utils/rateLimit',()=>({enforceRateLimit:vi.fn()}))
const handler = (await import('../server/api/admin/whatsapp/test.post')).default
beforeEach(()=>{
 db = new Database(':memory:')
 db.exec(`CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT); INSERT INTO app_settings VALUES('notification_test_phone','+38640111111'); CREATE TABLE notification_log(channel,event_type,recipient,body,status,created_at);`)
 send.mockReset().mockResolvedValue(undefined)
 vi.stubGlobal('requireUserSession',async()=>({user:{role:'admin'}}))
 vi.stubGlobal('readBody',async()=>({type:'cleaning_reminder',to:'+38640222222'}))
 vi.stubGlobal('useRuntimeConfig',()=>({public:{baseUrl:'https://guesttest.example.com'}}))
})
afterEach(()=>db.close())
it('only sends to saved test number, never arbitrary request recipient, with inert cleaning link',async()=>{
 await handler({} as any)
 expect(send.mock.calls[0]?.[0]).toBe('+38640111111')
 expect(send.mock.calls[0]?.[1]).toContain('[TEST] ')
 expect(send.mock.calls[0]?.[1]).toContain('/cleaning/test-preview')
 expect(db.prepare('SELECT status FROM notification_log').get()).toEqual({status:'sent'})
})
it('rejects non-admins and invalid event types without sending',async()=>{
 vi.stubGlobal('requireUserSession',async()=>({user:{role:'staff'}}))
 await expect(handler({} as any)).rejects.toThrow('Ni dovoljenja')
 vi.stubGlobal('requireUserSession',async()=>({user:{role:'admin'}}))
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
