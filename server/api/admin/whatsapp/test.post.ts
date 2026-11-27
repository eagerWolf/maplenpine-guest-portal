import { getDb, now } from '../../../db/index'
import { getWhatsAppProvider } from '../../../utils/whatsapp'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { notificationEvents, notificationSamples, defaultNotificationTemplate, renderNotificationTemplate, type EditableNotificationEvent } from '../../../../shared/notificationTemplates'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({statusCode:403,statusMessage:'Ni dovoljenja'})
  enforceRateLimit(event,'whatsapp-test',15,60_000)
  const { type } = await readBody<{type:string}>(event)
  if (!Object.hasOwn(notificationEvents,type)) throw createError({statusCode:400,statusMessage:'Neznana vrsta obvestila'})
  const db = getDb()
  const value = (key:string) => (db.prepare('SELECT value FROM app_settings WHERE key=?').get(key) as {value:string}|undefined)?.value || ''
  const user = db.prepare('SELECT whatsapp_phone FROM users WHERE id=? AND active != 0 AND role=\'admin\'').get(session.user.id) as {whatsapp_phone:string|null}|undefined
  const recipient = user?.whatsapp_phone?.trim() || ''
  if (!/^\+[1-9]\d{7,14}$/.test(recipient)) throw createError({statusCode:400,statusMessage:'V svojem uporabniškem profilu najprej izpolnite veljavno WhatsApp številko (+386…). '})
  const base = new URL(String(useRuntimeConfig().public.baseUrl)).origin
  // No real cleaning token or guest data: this URL cannot confirm a cleaning task.
  const link = base + (type === 'cleaning_reminder' ? '/cleaning/test-preview' : '/admin')
  const body = '[TEST] ' + renderNotificationTemplate(value(`notification_template_${type}`) || defaultNotificationTemplate,notificationSamples[type as EditableNotificationEvent]+'\n'+link,base)
  let status = 'sent'
  try { await getWhatsAppProvider({ manualTest: true }).send(recipient,body) }
  catch { status = 'failed' }
  db.prepare(`INSERT INTO notification_log(channel,event_type,recipient,body,status,created_at) VALUES('whatsapp',?,?,?,?,?)`).run(`test_${type}`,recipient,body,status,now())
  if (status === 'failed') throw createError({statusCode:502,statusMessage:'Test ni uspel. Preverite omogočeno pošiljanje, Twilio pošiljatelja in odobreno predlogo.'})
  return {success:true,recipient}
})
