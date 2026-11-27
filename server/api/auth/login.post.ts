import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'
import type { DbUser } from '../../db/index'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'login', 10)
  const { email, password } = await readBody<{ email: string; password: string }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Vnesi email in geslo' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?')
    .get(email.toLowerCase().trim()) as DbUser | undefined

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Napačen email ali geslo' })
  }

  if (!user.active || user.portal_access === 0) {
    throw createError({ statusCode: 403, statusMessage: 'Račun je neaktiven' })
  }

  if (!user.password_hash) {
    throw createError({ statusCode: 401, statusMessage: 'Račun še ni aktiviran. Uporabite aktivacijsko povezavo.' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Napačen email ali geslo' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, role: user.role as 'admin' | 'staff', cleaningOnly: user.role !== 'admin' && !user.notify_checkin && !user.staff_manager, passwordVersion: user.password_version || 0 },
  })

  return { success: true, role: user.role }
})
