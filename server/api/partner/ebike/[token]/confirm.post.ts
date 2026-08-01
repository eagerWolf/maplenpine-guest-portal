import { getDb, now } from '../../../../db/index'
import { sendBentralGuestMessage } from '../../../../utils/bentral'

export default defineEventHandler(async event => {
  const token = String(getRouterParam(event, 'token'))
  const db = getDb()
  const request = db.prepare(`SELECT br.*, res.bentral_reservation_id, res.guest_lang_override, res.guest_lang
    FROM bike_requests br JOIN reservations res ON res.id=br.reservation_id
    WHERE br.confirmation_token=? AND br.status='requested'`).get(token) as Record<string, any> | undefined
  if (!request) throw createError({ statusCode: 409, statusMessage: 'Povpraševanja ni mogoče potrditi' })
  db.prepare("UPDATE bike_requests SET status='approved',confirmed_at=?,updated_at=? WHERE id=?").run(now(), now(), request.id)

  const setting = db.prepare("SELECT value FROM app_settings WHERE key='bentral_api_key'").get() as { value: string } | undefined
  const messages: Record<string, string> = {
    sl: `Vaše povpraševanje za ${request.bike_count} e-koles (${request.start_date}–${request.end_date}) je potrjeno. Plačilo lahko opravite v portalu za goste.`,
    en: `Your request for ${request.bike_count} e-bike(s) (${request.start_date}–${request.end_date}) has been approved. Payment is now available in the guest portal.`,
    de: `Ihre Anfrage für ${request.bike_count} E-Bike(s) (${request.start_date}–${request.end_date}) wurde bestätigt. Die Zahlung ist jetzt im Gästeportal möglich.`,
    hr: `Vaš upit za ${request.bike_count} e-bicikl(a) (${request.start_date}–${request.end_date}) je potvrđen. Plaćanje je sada dostupno na portalu za goste.`,
    sr: `Vaš upit za ${request.bike_count} e-bicikl(a) (${request.start_date}–${request.end_date}) je potvrđen. Plaćanje je sada dostupno na portalu za goste.`,
  }
  const message = messages[request.guest_lang_override || request.guest_lang] ?? messages.en!
  if (setting?.value && request.bentral_reservation_id) {
    try { await sendBentralGuestMessage(setting.value, request.bentral_reservation_id, message) }
    catch (error) { console.error('[ebike:bentral-message]', error) }
  }
  return { success: true }
})
