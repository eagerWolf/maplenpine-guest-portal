import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
let db:Database.Database
const sendEmail = vi.hoisted(()=>vi.fn())
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
vi.mock('../server/utils/email',()=>({getEmailConfig:()=>({configured:true,apiKey:'secret',from:'portal@example.com'}),sendEmail}))
vi.mock('../server/utils/rateLimit',()=>({enforceRateLimit:vi.fn()}))
const {createPasswordReset,resetTokenHash} = await import('../server/utils/passwordReset')
const reset = (await import('../server/api/auth/reset-password.post')).default
const forgot = (await import('../server/api/auth/forgot-password.post')).default
const sessionCheck = (await import('../server/middleware/session-version')).default
beforeEach(()=>{
 db=new Database(':memory:')
 db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY,email TEXT,active INTEGER,password_hash TEXT,password_version INTEGER DEFAULT 0);
 INSERT INTO users VALUES(1,'admin@example.com',1,'old-hash',0);
 CREATE TABLE password_reset_tokens(token_hash TEXT PRIMARY KEY,user_id INTEGER,expires_at TEXT,used INTEGER DEFAULT 0,created_at TEXT);
 CREATE TABLE auth_tokens(email TEXT);
 CREATE TABLE audit_log(user_id INTEGER,action TEXT,created_at TEXT);`)
 db.exec("ALTER TABLE users ADD COLUMN portal_access INTEGER DEFAULT 1; ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'; ALTER TABLE users ADD COLUMN notify_checkin INTEGER DEFAULT 0; ALTER TABLE users ADD COLUMN staff_manager INTEGER DEFAULT 1;")
 vi.stubGlobal('clearUserSession',vi.fn())
 vi.stubGlobal('useRuntimeConfig',()=>({public:{baseUrl:'https://guesttest.example.com'}}))
 sendEmail.mockReset().mockResolvedValue(undefined)
})
afterEach(()=>db.close())
it('stores only hashed tokens, rotates links, and leaves the old password until redemption',()=>{
 const a=createPasswordReset(1), b=createPasswordReset(1)
 expect(db.prepare('SELECT token_hash FROM password_reset_tokens').all()).toEqual([{token_hash:resetTokenHash(b)}])
 expect(a).not.toBe(b)
 expect(db.prepare('SELECT password_hash FROM users').get()).toEqual({password_hash:'old-hash'})
})
it('changes password once, revokes sessions and activation links, and rejects token reuse',async()=>{
 const token=createPasswordReset(1)
 db.prepare('INSERT INTO auth_tokens VALUES(?)').run('admin@example.com')
 vi.stubGlobal('readBody',async()=>({token,password:'NewStrongPassword123!'}))
 await reset({} as any)
 const user=db.prepare('SELECT * FROM users').get() as any
 expect(await bcrypt.compare('NewStrongPassword123!',user.password_hash)).toBe(true)
 expect(user.password_version).toBe(1)
 expect(db.prepare('SELECT * FROM auth_tokens').all()).toEqual([])
 await expect(reset({} as any)).rejects.toThrow('Povezava')
 vi.stubGlobal('getUserSession',async()=>({user:{id:1,passwordVersion:0}}))
 await expect(sessionCheck({path:'/api/admin/settings'} as any)).rejects.toThrow('Seja')
 expect(clearUserSession).toHaveBeenCalled()
})
it('rejects expired or disabled-account links and passwords exceeding bcrypt limits',async()=>{
 const token=createPasswordReset(1)
 vi.stubGlobal('readBody',async()=>({token,password:'a'.repeat(73)}))
 await expect(reset({} as any)).rejects.toThrow('72 bajtov')
 vi.stubGlobal('readBody',async()=>({token,password:'ValidPassword123'}))
 db.prepare("UPDATE password_reset_tokens SET expires_at='2000-01-01'").run()
 await expect(reset({} as any)).rejects.toThrow('Povezava')
 const newToken=createPasswordReset(1)
 db.prepare('UPDATE users SET active=0').run()
 vi.stubGlobal('readBody',async()=>({token:newToken,password:'ValidPassword123'}))
 await expect(reset({} as any)).rejects.toThrow('Povezava')
 expect(db.prepare('SELECT password_hash FROM users').get()).toEqual({password_hash:'old-hash'})
})
it('does not reveal account existence and never returns the reset token',async()=>{
 vi.stubGlobal('readBody',async()=>({email:' ADMIN@example.com '}))
 const known=await forgot({} as any)
 expect(sendEmail).toHaveBeenCalledTimes(1)
 expect(sendEmail.mock.calls[0]?.[0].to).toBe('admin@example.com')
 expect(sendEmail.mock.calls[0]?.[0].html).toContain('https://guesttest.example.com/reset-password#')
 vi.stubGlobal('readBody',async()=>({email:'unknown@example.com'}))
 expect(await forgot({} as any)).toEqual(known)
 expect(sendEmail).toHaveBeenCalledTimes(1)
 expect(Object.keys(known)).toEqual(['success','message'])
})
it('removes unusable tokens after email delivery fails without exposing provider errors',async()=>{
 sendEmail.mockRejectedValue(new Error('secret provider error'))
 vi.stubGlobal('readBody',async()=>({email:'admin@example.com'}))
 expect(await forgot({} as any)).toMatchObject({success:true})
 expect(db.prepare('SELECT * FROM password_reset_tokens').all()).toEqual([])
})
