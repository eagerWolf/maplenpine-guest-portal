import { confirmCleaning } from '../../../utils/staffNotifications'
import { enforceRateLimit } from '../../../utils/rateLimit'
export default defineEventHandler(async event => {
  enforceRateLimit(event,'cleaning-confirm',15)
  setResponseHeader(event,'Cache-Control','no-store')
  const body = await readBody(event)
  if (body?.confirm !== true) throw createError({statusCode:400,statusMessage:'Potrdite, da je apartma pripravljen'})
  return confirmCleaning(String(getRouterParam(event,'token') || ''))
})
