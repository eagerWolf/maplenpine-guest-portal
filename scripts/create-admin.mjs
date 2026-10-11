import Database from 'better-sqlite3'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const email = String(process.argv[2] || '').trim().toLowerCase()
if (!email || !email.includes('@')) {
  console.error('Uporaba: npm run admin:activate -- admin@example.com')
  process.exit(1)
}

const dbPath = join(process.cwd(), 'data', 'portal.db')
if (!existsSync(dbPath)) {
  console.error('Baza data/portal.db še ne obstaja. Najprej enkrat zaženite portal, nato ga ustavite.')
  process.exit(1)
}

const db = new Database(dbPath)
try {
  const usersTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
  const tokensTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='auth_tokens'").get()
  if (!usersTable || !tokensTable) throw new Error('Shema portala še ni inicializirana')

  const existing = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email)
  if (existing?.password_hash) {
    console.error('Ta uporabnik že ima nastavljeno geslo. Aktivacijska povezava ni bila ustvarjena.')
    process.exitCode = 1
  } else {
    const timestamp = new Date().toISOString()
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (email, role, active, created_at)
        VALUES (?, 'admin', 1, ?)
        ON CONFLICT(email) DO UPDATE SET role = 'admin', active = 1
      `).run(email, timestamp)
      db.prepare('DELETE FROM auth_tokens WHERE email = ? AND used = 0').run(email)
      db.prepare('INSERT INTO auth_tokens (email, token, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)')
        .run(email, token, expiresAt, timestamp)
    })
    transaction()
    const baseUrl = String(process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
    console.log(`Aktivacijska povezava (velja 24 ur):\n${baseUrl}/activate?token=${token}`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
} finally {
  db.close()
}
