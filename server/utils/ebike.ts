import { randomBytes } from 'node:crypto'
import { getDb, now } from '../db/index'
import { getWhatsAppProvider } from './whatsapp'
import { getEmailConfig, sendEmail } from './email'
import { useRuntimeConfig } from '#imports'

export function getEbikeProviders(activeOnly = true) {
  return getDb().prepare(`SELECT id,name,contact_name,contact_email,whatsapp,notes,active,rental_enabled,rental_daily_cost,rental_daily_margin,rental_exceptions,pickup_location_id,return_location_id FROM partners WHERE category='ebike' ${activeOnly ? 'AND active=1 AND rental_enabled=1' : ''} ORDER BY name`).all() as Array<Record<string, any>>
}

export async function notifyEbikePartner(requestId: number) {
  const db = getDb()
  const row = db.prepare(`SELECT r.*,p.name partner_name,p.whatsapp,p.contact_email FROM bike_requests r JOIN partners p ON p.id=r.partner_id WHERE r.id=?`).get(requestId) as Record<string, any>
  if (!row) throw new Error('Povpraševanje ne obstaja')
  const base = String(useRuntimeConfig().public.baseUrl || 'http://localhost:3000')
  const url = `${base}/partner/ebike/${row.confirmation_token}`
  const text = `🚲 Novo povpraševanje za e-kolesa\n\nGost: ${row.guest_name}\nObdobje: ${row.start_date}–${row.end_date}\nŠtevilo: ${row.bike_count}\nOpombe: ${row.guest_notes || '—'}\n\nPotrditev ali zavrnitev: ${url}`
  const tasks: Promise<unknown>[] = []
  if (row.whatsapp) tasks.push(getWhatsAppProvider().send(row.whatsapp, text))
  const email = getEmailConfig()
  if (row.contact_email && email.configured) tasks.push(sendEmail({ apiKey: email.apiKey, from: email.from, to: row.contact_email, subject: 'Novo povpraševanje za e-kolesa', html: text.replaceAll('\n','<br>') }))
  await Promise.allSettled(tasks)
}

export const newEbikeToken = () => randomBytes(24).toString('hex')
export const rentalDays = (from: string, to: string) => Math.floor((Date.parse(to)-Date.parse(from))/86400000)+1
