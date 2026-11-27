import { getDb } from '../../db/index'
export default defineEventHandler(async event=>{
  await requireUserSession(event)
  const q=getQuery(event), month=String(q.month||new Date().toISOString().slice(0,7))
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw createError({statusCode:400,statusMessage:'Neveljaven mesec.'})
  // Deliberately select only cleaning dates and apartment names. No reservation IDs or guest fields.
  return getDb().prepare(`SELECT DISTINCT r.door, r.check_out AS date,
    CASE WHEN EXISTS(SELECT 1 FROM cleaning_tasks c WHERE c.reservation_id=r.id AND c.cleaning_date=r.check_out AND c.confirmed_at IS NOT NULL) THEN 1 ELSE 0 END AS completed
    FROM reservations r WHERE r.status='active' AND substr(r.check_out,1,7)=? ORDER BY r.check_out,r.door`).all(month)
})
