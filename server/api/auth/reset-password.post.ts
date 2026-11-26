import bcrypt from 'bcryptjs'
import { getDb, now } from '../../db/index'
import { resetTokenHash } from '../../utils/passwordReset'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event,'reset-password',10,15*60_000)
  const {token,password} = await readBody<{token?:string,password?:string}>(event)
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || typeof password !== 'string' || password.length < 10 || Buffer.byteLength(password,'utf8') > 72) throw createError({statusCode:400,statusMessage:'Neveljavna povezava ali geslo. Geslo mora imeti vsaj 10 znakov in največ 72 bajtov.'})
  const db = getDb()
  const tokenHash = resetTokenHash(token)
  const reset = db.prepare('SELECT r.user_id FROM password_reset_tokens r JOIN users u ON u.id=r.user_id WHERE r.token_hash=? AND r.used=0 AND r.expires_at>? AND u.active != 0').get(tokenHash,now()) as {user_id:number}|undefined
  if (!reset) throw createError({statusCode:400,statusMessage:'Povezava ni veljavna ali je potekla.'})
  const hash = await bcrypt.hash(password,12)
  db.transaction(()=>{
    const claimed = db.prepare('UPDATE password_reset_tokens SET used=1 WHERE token_hash=? AND used=0 AND expires_at>? AND EXISTS(SELECT 1 FROM users WHERE id=user_id AND active != 0)').run(tokenHash,now())
    if (claimed.changes !== 1) throw createError({statusCode:400,statusMessage:'Povezava ni veljavna ali je potekla.'})
    db.prepare('UPDATE users SET password_hash=?,password_version=password_version+1 WHERE id=?').run(hash,reset.user_id)
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').run(reset.user_id)
    db.prepare('DELETE FROM auth_tokens WHERE email=(SELECT email FROM users WHERE id=?)').run(reset.user_id)
    db.prepare("INSERT INTO audit_log(user_id,action,created_at) VALUES(?,'password_reset',?)").run(reset.user_id,now())
  })()
  await clearUserSession(event)
  return {success:true}
})
