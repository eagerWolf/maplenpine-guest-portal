import { getDb } from '../../db/index'
import { getEmailConfig, sendEmail } from '../../utils/email'
import { createPasswordReset, resetTokenHash } from '../../utils/passwordReset'
import { enforceRateLimit } from '../../utils/rateLimit'
import { setTimeout as delay } from 'node:timers/promises'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event,'forgot-password',5,15*60_000)
  const { email } = await readBody<{email?:string}>(event)
  if (typeof email !== 'string' || email.length > 254 || !email.includes('@')) throw createError({statusCode:400,statusMessage:'Vnesite veljaven e-poštni naslov.'})
  const mail = getEmailConfig()
  if (!mail.configured) throw createError({statusCode:503,statusMessage:'Obnova po e-pošti trenutno ni nastavljena. Obrnite se na administratorja.'})
  const responseAt = Date.now()+2000
  const normalized = email.trim().toLowerCase()
  const user = getDb().prepare('SELECT id FROM users WHERE email=? AND active != 0 AND portal_access != 0 AND password_hash IS NOT NULL').get(normalized) as {id:number}|undefined
  if (user) {
    const token = createPasswordReset(user.id)
    const url = new URL('/reset-password',String(useRuntimeConfig().public.baseUrl))
    url.hash = token
    try {
      await sendEmail({apiKey:mail.apiKey,from:mail.from,to:normalized,timeoutMs:1500,subject:'Ponastavitev gesla — Maple & Pine Portal',html:`<p>Za nastavitev novega gesla odprite povezavo:</p><p><a href="${url.href}">Ponastavi geslo</a></p><p>Povezava velja 30 minut in jo lahko uporabite enkrat. Če ponastavitve niste zahtevali, sporočilo prezrite.</p>`})
    } catch {
      getDb().prepare('DELETE FROM password_reset_tokens WHERE token_hash=?').run(resetTokenHash(token))
      console.error('[password-reset] Email delivery failed')
    }
  }
  await delay(Math.max(0,responseAt-Date.now()))
  return {success:true,message:'Če račun obstaja in je aktiven, boste prejeli povezavo za ponastavitev gesla.'}
})
