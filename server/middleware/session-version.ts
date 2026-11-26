import { getDb } from '../db/index'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return
  const session = await getUserSession(event)
  if (!session.user) return
  const user = getDb().prepare('SELECT active, password_version FROM users WHERE id=?').get(session.user.id) as {active:number,password_version:number}|undefined
  if (!user?.active || user.password_version !== (session.user.passwordVersion || 0)) {
    await clearUserSession(event)
    throw createError({statusCode:401,statusMessage:'Seja je potekla. Ponovno se prijavite.'})
  }
})
