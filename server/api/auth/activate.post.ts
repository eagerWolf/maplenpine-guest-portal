import bcrypt from 'bcryptjs'
import { getDb, now } from '../../db/index'
import type { DbUser } from '../../db/index'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'activate', 10)
  const { token, password } = await readBody<{ token?: string; password?: string }>(event)
  if (!token || !password || password.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Povezava ali geslo ni veljavno. Geslo mora imeti vsaj 10 znakov.' })
  }

  const db = getDb()
  const activation = db.prepare(`
    SELECT * FROM auth_tokens
    WHERE token = ? AND used = 0 AND expires_at > ?
  `).get(token, now()) as { id: number; email: string } | undefined
  if (!activation) throw createError({ statusCode: 400, statusMessage: 'Aktivacijska povezava ni veljavna ali je potekla.' })

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active != 0').get(activation.email) as DbUser | undefined
  if (!user || user.portal_access === 0 || user.password_hash) throw createError({ statusCode: 400, statusMessage: 'Računa ni mogoče aktivirati.' })

  const hash = await bcrypt.hash(password, 12)
  const tx = db.transaction(() => {
    const claimed = db.prepare('UPDATE auth_tokens SET used = 1 WHERE id = ? AND used = 0 AND expires_at > ?').run(activation.id, now())
    if (claimed.changes !== 1) throw createError({ statusCode: 400, statusMessage: 'Aktivacijska povezava je bila že uporabljena.' })
    const activated = db.prepare('UPDATE users SET password_hash = ? WHERE id = ? AND password_hash IS NULL').run(hash, user.id)
    if (activated.changes !== 1) throw createError({ statusCode: 400, statusMessage: 'Računa ni mogoče aktivirati.' })
  })
  tx()

  await setUserSession(event, { user: { id: user.id, email: user.email, role: user.role as 'admin' | 'staff', cleaningOnly: user.role !== 'admin' && !user.notify_checkin && !user.staff_manager } })
  return { success: true, role: user.role }
})
