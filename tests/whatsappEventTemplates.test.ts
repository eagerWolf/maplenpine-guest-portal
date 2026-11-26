import Database from 'better-sqlite3'
import {beforeEach,afterEach,expect,it,vi} from 'vitest'
let db:Database.Database
vi.mock('#imports',()=>({useRuntimeConfig:()=>({public:{baseUrl:'https://guesttest.maplenpine.com'}})}))
vi.mock('../server/db/index',()=>({getDb:()=>db}))
vi.mock('../server/utils/secretSettings',()=>({decodeSetting:(_key:string,value:string)=>value}))
import { notificationEvents } from '../shared/notificationTemplates'
const {getWhatsAppProvider}=await import('../server/utils/whatsapp')
beforeEach(()=>{
 vi.stubEnv('PORTAL_WHATSAPP_ENABLED','true')
 db=new Database(':memory:')
 db.exec('CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT)')
 const insert=db.prepare('INSERT INTO app_settings VALUES(?,?)')
 for(const [key,value] of Object.entries({twilio_account_sid:'AC'+'1'.repeat(32),twilio_auth_token:'test-only-token',twilio_whatsapp_from:'+16620000000',twilio_staff_content_sid:'HX'+'2'.repeat(32),twilio_content_sid_cleaning_reminder:'HX'+'3'.repeat(32)}))insert.run(key,value)
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true}))
})
afterEach(()=>{db.close();vi.unstubAllEnvs();vi.unstubAllGlobals()})
it.each(Object.keys(notificationEvents))('uses the shared template for %s despite legacy overrides',async(event)=>{
 db.prepare('INSERT OR REPLACE INTO app_settings VALUES(?,?)').run(`twilio_content_sid_${event}`,'HX'+'3'.repeat(32))
 await getWhatsAppProvider().send('+38640111111','TEST\nPine\nhttps://guesttest.maplenpine.com/cleaning/test-preview')
 const body=(vi.mocked(fetch).mock.calls[0]![1]!.body as URLSearchParams)
 expect(body.get('ContentSid')).toBe('HX'+'2'.repeat(32))
 expect(JSON.parse(body.get('ContentVariables')!)).toEqual({'1':'TEST','2':'Pine','3':'https://guesttest.maplenpine.com/cleaning/test-preview'})
})
it('never uses a legacy event template when the shared SID is missing',async()=>{
 db.prepare("DELETE FROM app_settings WHERE key='twilio_staff_content_sid'").run()
 await expect(getWhatsAppProvider().send('+38640111111','Test')).rejects.toThrow('Content SID')
 expect(fetch).not.toHaveBeenCalled()
})
it('never sends when delivery is disabled',async()=>{
 vi.stubEnv('PORTAL_WHATSAPP_ENABLED','false')
 await expect(getWhatsAppProvider().send('+38640111111','Test')).rejects.toThrow('disabled')
 expect(fetch).not.toHaveBeenCalled()
})
