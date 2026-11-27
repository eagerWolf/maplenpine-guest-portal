import { randomUUID, randomBytes } from 'node:crypto'
import type Database from 'better-sqlite3'

export function migrateStaffDirectory(db: Database.Database) {
  const columns = new Set((db.prepare('PRAGMA table_info(users)').all() as {name:string}[]).map(r=>r.name))
  for (const [name, definition] of [['name', "TEXT NOT NULL DEFAULT ''"], ['portal_access', 'INTEGER NOT NULL DEFAULT 1'], ['staff_manager', 'INTEGER NOT NULL DEFAULT 0'], ['notifications_enabled', 'INTEGER NOT NULL DEFAULT 1']]) {
    if (!columns.has(name!)) db.exec(`ALTER TABLE users ADD COLUMN ${name} ${definition}`)
  }
  db.exec(`CREATE TABLE IF NOT EXISTS cleaning_assignments (
    token TEXT PRIMARY KEY, task_id INTEGER NOT NULL REFERENCES cleaning_tasks(id),
    user_id INTEGER NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, UNIQUE(task_id,user_id)
  )`)
  const taskColumns=new Set((db.prepare('PRAGMA table_info(cleaning_tasks)').all() as {name:string}[]).map(r=>r.name))
  if(!taskColumns.has('confirmed_by_user_id')) db.exec('ALTER TABLE cleaning_tasks ADD COLUMN confirmed_by_user_id INTEGER')
  if(!taskColumns.has('confirmed_by_name')) db.exec('ALTER TABLE cleaning_tasks ADD COLUMN confirmed_by_name TEXT')
  if (!columns.has('staff_manager')) db.exec("UPDATE users SET staff_manager=1 WHERE role='admin'")
  // One-time conversion: clearing a role later must not reimport legacy settings.
  db.exec('CREATE TABLE IF NOT EXISTS staff_directory_migrations (id TEXT PRIMARY KEY)')
  if (db.prepare("SELECT 1 FROM staff_directory_migrations WHERE id='legacy-contacts-v1'").get()) return
  db.transaction(()=>{
    for (const [setting,flag,label] of [['housekeeper_whatsapp','notify_housekeeper','Čistilka'],['reception_whatsapp','notify_checkin','Sprejem']]) {
      const value=(db.prepare('SELECT value FROM app_settings WHERE key=?').get(setting) as {value:string}|undefined)?.value || ''
      for (const raw of value.split(/[,;\n]+/)) {
        const digits=raw.replace(/\D/g,''); if(digits.length<8) continue
        const existing=(db.prepare('SELECT id,whatsapp_phone FROM users').all() as {id:number;whatsapp_phone:string|null}[]).find(u=>u.whatsapp_phone?.replace(/\D/g,'')===digits)
        if(existing) db.prepare(`UPDATE users SET ${flag}=1 WHERE id=?`).run(existing.id)
        else db.prepare(`INSERT INTO users(email,name,role,portal_access,${flag},whatsapp_phone,notification_level,active,created_at) VALUES(?,?,'staff',0,1,?,'none',1,?)`).run(`contact-${randomUUID()}@staff.invalid`,label,'+'+digits,new Date().toISOString())
      }
    }
    db.prepare("INSERT INTO staff_directory_migrations VALUES('legacy-contacts-v1')").run()
  })()
}

export function staffActivation(db: Database.Database, email:string, baseUrl:string) {
  const token=randomBytes(32).toString('hex'), ts=new Date().toISOString()
  db.prepare('DELETE FROM auth_tokens WHERE email=? AND used=0').run(email)
  db.prepare('INSERT INTO auth_tokens(email,token,expires_at,used,created_at) VALUES(?,?,?,0,?)').run(email,token,new Date(Date.now()+86400000).toISOString(),ts)
  return `${baseUrl.replace(/\/$/,'')}/activate?token=${token}`
}
