import { getDb } from '../db/index'
// Only explicitly designated public contacts are visible to guests. Notification opt-out is independent.
export function guestContacts() {
 const people=getDb().prepare('SELECT whatsapp_phone,notify_checkin FROM users WHERE active!=0 AND guest_contact=1 AND whatsapp_phone IS NOT NULL ORDER BY notify_checkin DESC,id').all() as {whatsapp_phone:string;notify_checkin:number}[]
 const reception=people.find(p=>p.notify_checkin)?.whatsapp_phone || null
 const additional=people.find(p=>p.whatsapp_phone!==reception)?.whatsapp_phone || null
 return {reception,additional}
}
