import { getDb } from '../../../db/index'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({statusCode:403,statusMessage:'Ni dovoljenja'})
  const user = getDb().prepare("SELECT whatsapp_phone FROM users WHERE id=? AND active != 0 AND role='admin'").get(session.user.id) as {whatsapp_phone:string|null}|undefined
  const recipient = user?.whatsapp_phone?.trim() || ''
  return {recipient, valid: /^\+[1-9]\d{7,14}$/.test(recipient)}
})
