import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'
import type { DbUser } from '../../db/index'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{ email: string; password: string }>(event)

  if (!password || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Geslo mora biti dolgo vsaj 8 znakov' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password_hash IS NULL')
    .get(email.toLowerCase().trim()) as DbUser | undefined

  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'Napaka pri nastavljanju gesla' })
  }

  const hash = await bcrypt.hash(password, 12)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id)

  await setUserSession(event, {
    user: { id: user.id, email: user.email, role: user.role as 'admin' | 'staff' },
  })

  return { success: true, role: user.role }
})
