import { getDb, now } from '../../../db/index'
import { fetchBentralPropertyTimes } from '../../../utils/bentral'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const config = useRuntimeConfig()
  if (!config.bentralApiKey || !config.bentralPropertyId) {
    throw createError({ statusCode: 400, statusMessage: 'Bentral API ni konfiguriran' })
  }

  const times = await fetchBentralPropertyTimes(config.bentralApiKey, config.bentralPropertyId)

  const db = getDb()
  const ts = now()
  const upsert = db.prepare(
    'INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
  )
  upsert.run('bentral_checkin_time', times.checkinFrom, ts)
  upsert.run('bentral_checkout_time', times.checkoutTo, ts)

  return { success: true, checkinFrom: times.checkinFrom, checkoutTo: times.checkoutTo }
})
