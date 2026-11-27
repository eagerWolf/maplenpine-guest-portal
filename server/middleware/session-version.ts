import { getDb } from '../db/index'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return
  const session = await getUserSession(event)
  if (!session.user) return
  const user = getDb().prepare('SELECT active, role, notify_checkin, staff_manager, portal_access, password_version FROM users WHERE id=?').get(session.user.id) as {active:number,portal_access:number,password_version:number,role:string,notify_checkin:number,staff_manager:number}|undefined
  if (!user?.active || user.portal_access === 0 || user.password_version !== (session.user.passwordVersion || 0)) {
    await clearUserSession(event)
    throw createError({statusCode:401,statusMessage:'Seja je potekla. Ponovno se prijavite.'})
  }
  const cleaningOnly = user.role !== 'admin' && !user.notify_checkin && !user.staff_manager
  const path = getRequestURL(event).pathname
  if(cleaningOnly && !/^\/api\/cleaning\/[a-f0-9]{64}(\/confirm)?$/.test(path) && !['/api/staff/cleaning-calendar','/api/auth/logout','/api/me','/api/_auth/session'].includes(path)) throw createError({statusCode:403,statusMessage:'Dostop je omejen na koledar čiščenj.'})
})
