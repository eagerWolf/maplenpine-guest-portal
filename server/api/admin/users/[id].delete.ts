import { getDb, now } from '../../../db/index'
import type { DbUser } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }
  const id = getRouterParam(event, 'id')
  const db = getDb()
  db.transaction(() => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Oseba ni najdena' })
    if (user.id === session.user.id) throw createError({ statusCode: 400, statusMessage: 'Ne morete izbrisati svojega računa' })
    if (user.role === 'admin' && user.active && user.portal_access) {
      const remaining = db.prepare("SELECT id FROM users WHERE id!=? AND role='admin' AND active!=0 AND portal_access!=0 LIMIT 1").get(user.id)
      if (!remaining) throw createError({ statusCode: 400, statusMessage: 'Zadnjega aktivnega skrbnika ni mogoče izbrisati' })
    }
    // Keep the historical name/time and user ID on cleaning_tasks. Only revoke live links and login tokens.
    db.prepare('DELETE FROM cleaning_assignments WHERE user_id=?').run(user.id)
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').run(user.id)
    db.prepare('DELETE FROM auth_tokens WHERE email=?').run(user.email)
    db.prepare('DELETE FROM users WHERE id=?').run(user.id)
    db.prepare(`INSERT INTO audit_log(user_id,user_email,action,detail,created_at) VALUES(?,?,'remove_staff',?,?)`)
      .run(session.user.id, session.user.email, JSON.stringify({ removed_id:user.id, removed_name:user.name, removed_email:user.email, role:user.role, cleaning_history_preserved:true }), now())
  })()
  return { success: true }
})
