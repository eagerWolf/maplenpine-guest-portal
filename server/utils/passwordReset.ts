import { createHash, randomBytes } from 'node:crypto'
import { getDb, now } from '../db/index'

export const resetTokenHash = (token:string) => createHash('sha256').update(token).digest('hex')

export function createPasswordReset(userId:number) {
  const db = getDb()
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now()+30*60_000).toISOString()
  db.transaction(()=>{
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id=? OR expires_at <= ?').run(userId,now())
    db.prepare('INSERT INTO password_reset_tokens(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').run(resetTokenHash(token),userId,expiresAt,now())
  })()
  return token
}
