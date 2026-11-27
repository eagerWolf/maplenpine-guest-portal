import { staffActivation } from '../../../utils/staffDirectory'
import { getDb, now } from '../../../db/index'
import type { DbUser } from '../../../db/index'

const VALID_LEVELS = ['none', 'errors', 'all']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const { notification_level, whatsapp_phone, notify_housekeeper, notify_checkin, notes, active, guest_contact, notifications_enabled, name, portal_access, staff_manager, email, role } = await readBody<{
    guest_contact?: boolean
    notifications_enabled?: boolean
    name?: string
    portal_access?: boolean
    staff_manager?: boolean
    email?: string
    role?: string
    notification_level?: string
    whatsapp_phone?: string
    notify_housekeeper?: boolean
    notify_checkin?: boolean
    notes?: string
    active?: boolean
  }>(event)

  if (notification_level !== undefined && !VALID_LEVELS.includes(notification_level)) {
    throw createError({ statusCode: 400, statusMessage: 'Neveljaven nivo obvestil' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Uporabnik ni najden' })
  }

  const nextAccess = portal_access === undefined ? user.portal_access !== 0 : portal_access === true
  const nextEmail = email === undefined ? user.email : String(email).trim().toLowerCase()
  const nextRole = role === undefined ? user.role : role
  if (!['admin','staff'].includes(nextRole)) throw createError({statusCode:400,statusMessage:'Neveljavne pravice.'})
  if(nextAccess && (!nextEmail.includes('@') || nextEmail.endsWith('@staff.invalid'))) throw createError({statusCode:400,statusMessage:'Za prijavo je potreben veljaven email.'})
  if((!nextAccess || nextRole !== 'admin') && user.role === 'admin' && user.portal_access !== 0) {
    if(user.id === session.user.id) throw createError({statusCode:400,statusMessage:'Ne morete odstraniti lastnega dostopa.'})
    const count = (db.prepare("SELECT COUNT(*) cnt FROM users WHERE role='admin' AND active!=0 AND portal_access!=0").get() as {cnt:number}).cnt
    if(count <= 1) throw createError({statusCode:400,statusMessage:'Vsaj en skrbnik portala mora ostati aktiven.'})
  }
  if(nextEmail !== user.email && db.prepare('SELECT id FROM users WHERE email=? AND id!=?').get(nextEmail,id)) throw createError({statusCode:409,statusMessage:'Email že obstaja.'})
  if(whatsapp_phone && !/^\+[1-9]\d{7,14}$/.test(whatsapp_phone.replace(/[\s()-]/g,''))) throw createError({statusCode:400,statusMessage:'Neveljavna WhatsApp številka.'})
  const ts = now()
  const fields: string[] = []
  const values: unknown[] = []

  if(guest_contact !== undefined) { fields.push('guest_contact = ?'); values.push(guest_contact === true ? 1 : 0) }
  if(notifications_enabled !== undefined) { fields.push('notifications_enabled = ?'); values.push(notifications_enabled === true ? 1 : 0) }
  if(name !== undefined) { if(!name.trim()) throw createError({statusCode:400,statusMessage:'Vnesite ime.'}); fields.push('name = ?'); values.push(name.trim()) }
  if(staff_manager !== undefined) { fields.push('staff_manager = ?'); values.push(staff_manager === true ? 1 : 0) }
  if(portal_access !== undefined) { fields.push('portal_access = ?'); values.push(nextAccess ? 1 : 0) }
  if(role !== undefined) { fields.push('role = ?'); values.push(nextRole) }
  if(email !== undefined) { fields.push('email = ?'); values.push(nextEmail || user.email) }
  if((notify_housekeeper !== undefined && Number(notify_housekeeper)!==user.notify_housekeeper) || (notify_checkin !== undefined && Number(notify_checkin)!==user.notify_checkin) || (staff_manager !== undefined && Number(staff_manager)!==user.staff_manager) || (portal_access !== undefined && Number(portal_access)!==user.portal_access) || (email !== undefined && nextEmail !== user.email) || (role !== undefined && role !== user.role)) { fields.push('password_version = password_version + 1') }
  if (notification_level !== undefined) {
    fields.push('notification_level = ?')
    values.push(notification_level)
  }
  if (whatsapp_phone !== undefined) {
    fields.push('whatsapp_phone = ?')
    values.push(whatsapp_phone.replace(/[\s()-]/g,'') || null)
  }
  if (notify_housekeeper !== undefined) {
    fields.push('notify_housekeeper = ?')
    values.push(notify_housekeeper ? 1 : 0)
  }
  if (notify_checkin !== undefined) {
    fields.push('notify_checkin = ?')
    values.push(notify_checkin ? 1 : 0)
  }
  if (notes !== undefined) {
    fields.push('notes = ?')
    values.push(notes.trim() || null)
  }
  if (active !== undefined && !active) {
    if (user.id === session.user.id) {
      throw createError({ statusCode: 400, statusMessage: 'Ne morete deaktivirati svojega računa' })
    }
    if (user.role === 'admin') {
      const activeAdmins = (db.prepare(
        "SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin' AND active != 0 AND portal_access != 0",
      ).get() as { cnt: number }).cnt
      if (activeAdmins <= 1) {
        throw createError({ statusCode: 400, statusMessage: 'Vsaj en admin mora ostati aktiven' })
      }
    }
    fields.push('active = ?')
    values.push(0)
  } else if (active !== undefined) {
    fields.push('active = ?')
    values.push(1)
  }

  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nič za posodobiti' })
  }

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
    .run(...values, id)

  db.prepare(`
    INSERT INTO audit_log (user_id, user_email, action, detail, created_at)
    VALUES (?, ?, 'update_user_notifications', ?, ?)
  `).run(
    session.user.id,
    session.user.email,
    JSON.stringify({ target_email: user.email, notification_level, whatsapp_phone }),
    ts,
  )

  if(active === false || notifications_enabled === false || notify_housekeeper === false || (whatsapp_phone !== undefined && whatsapp_phone !== user.whatsapp_phone)) db.prepare('DELETE FROM cleaning_assignments WHERE user_id=?').run(user.id)
  let activationUrl: string | null = null
  if(!nextAccess || nextEmail !== user.email) {
    db.prepare('DELETE FROM auth_tokens WHERE email=?').run(user.email)
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').run(user.id)
  }
  if(nextAccess && !user.password_hash && (user.portal_access === 0 || nextEmail !== user.email)) activationUrl=staffActivation(db,nextEmail,String(useRuntimeConfig().public.baseUrl))
  return { success: true, activationUrl }
})
