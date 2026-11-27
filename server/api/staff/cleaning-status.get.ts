import { getDb } from '../../db/index'
export default defineEventHandler(async event=>{
 const session=await requireUserSession(event),db=getDb()
 const person=db.prepare('SELECT role,notify_checkin,staff_manager FROM users WHERE id=? AND active!=0 AND portal_access!=0').get(session.user.id) as {role:string;notify_checkin:number;staff_manager:number}|undefined
 if(!person || !(person.role==='admin'||person.notify_checkin||person.staff_manager)) throw createError({statusCode:403,statusMessage:'Ni dovoljenja.'})
 const month=String(getQuery(event).month||new Date().toISOString().slice(0,7))
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw createError({statusCode:400,statusMessage:'Neveljaven mesec.'})
 return db.prepare(`SELECT r.door,r.check_out AS date,c.door AS cleanedDoor,c.confirmed_at,c.confirmed_by_name FROM reservations r LEFT JOIN cleaning_tasks c ON c.reservation_id=r.id AND c.cleaning_date=r.check_out WHERE r.status='active' AND substr(r.check_out,1,7)=? ORDER BY r.check_out,r.door`).all(month)
})
