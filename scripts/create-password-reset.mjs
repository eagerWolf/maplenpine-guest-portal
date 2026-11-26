// Operator-assisted recovery when email delivery is unavailable. Does not change the password.
import Database from 'better-sqlite3'
import { createHash, randomBytes } from 'node:crypto'
const email = String(process.argv[2] || '').trim().toLowerCase()
if (!email.includes('@')) throw new Error('Uporaba: node --env-file=.env scripts/create-password-reset.mjs email')
const base = new URL(process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000')
const db = new Database('data/portal.db',{fileMustExist:true})
try {
  const user = db.prepare('SELECT id FROM users WHERE email=? AND active != 0 AND password_hash IS NOT NULL').get(email)
  if (!user) throw new Error('Aktivni račun z geslom ni najden')
  const token = randomBytes(32).toString('hex')
  const ts = new Date().toISOString()
  db.transaction(()=>{
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id=? OR expires_at<=?').run(user.id,ts)
    db.prepare('INSERT INTO password_reset_tokens(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').run(createHash('sha256').update(token).digest('hex'),user.id,new Date(Date.now()+30*60_000).toISOString(),ts)
    db.prepare("INSERT INTO audit_log(user_id,action,created_at) VALUES(?,'operator_password_reset_link',?)").run(user.id,ts)
  })()
  const url = new URL('/reset-password',base)
  url.hash=token
  console.log(url.href)
} finally { db.close() }
