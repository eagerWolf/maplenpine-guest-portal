import { randomUUID } from 'node:crypto'
import { getDb, now } from '../../db/index'
import { staffActivation } from '../../utils/staffDirectory'

export default defineEventHandler(async event => {
  const session=await requireUserSession(event)
  if(session.user.role!=='admin') throw createError({statusCode:403,statusMessage:'Ni dovoljenja'})
  const body=await readBody(event)
  const name=String(body.name||'').trim(), access=body.portal_access===true
  const email=String(body.email||'').trim().toLowerCase()
  if(!name) throw createError({statusCode:400,statusMessage:'Vnesite ime osebe.'})
  if(access && (!email.includes('@')||email.endsWith('@staff.invalid'))) throw createError({statusCode:400,statusMessage:'Za prijavo je potreben veljaven email.'})
  const role=access && body.role==='admin'?'admin':'staff'
  const db=getDb(), address=email||`contact-${randomUUID()}@staff.invalid`
  if(db.prepare('SELECT id FROM users WHERE email=?').get(address)) throw createError({statusCode:409,statusMessage:'Email že obstaja.'})
  const phone=String(body.whatsapp_phone||'').replace(/[\s()-]/g,'')
  if(phone && !/^\+[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g,''))) throw createError({statusCode:400,statusMessage:'Vnesite WhatsApp številko v obliki +386…'})
  const result=db.prepare(`INSERT INTO users(name,email,role,portal_access,staff_manager,notify_housekeeper,notify_checkin,whatsapp_phone,notification_level,notifications_enabled,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(name,address,role,access?1:0,body.staff_manager===true?1:0,body.notify_housekeeper===true?1:0,body.notify_checkin===true?1:0,phone||null,'all',body.notifications_enabled===false?0:1,body.active===false?0:1,now())
  const activationUrl=access?staffActivation(db,address,String(useRuntimeConfig().public.baseUrl)):null
  db.prepare("INSERT INTO audit_log(user_id,user_email,action,detail,created_at) VALUES(?,?,'add_staff',?,?)").run(session.user.id,session.user.email,JSON.stringify({id:result.lastInsertRowid,portal_access:access}),now())
  return {id:result.lastInsertRowid,activationUrl,activationEmailSent:false}
})
