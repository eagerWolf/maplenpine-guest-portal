import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'
import type { DbUser } from '../../db/index'

export default defineEventHandler(async (event) => {
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

  if (!user.active) {
    throw createError({ statusCode: 403, statusMessage: 'Račun je neaktiven' })
  }

  // First login — no password set yet
  if (!user.password_hash) {
    return { firstLogin: true }
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Napačen email ali geslo' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, role: user.role as 'admin' | 'staff' },
  })

  return { success: true, role: user.role }
})
