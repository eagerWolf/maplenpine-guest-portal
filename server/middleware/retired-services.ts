import { legacyServicePath } from '../utils/servicePolicy'

export default defineEventHandler(event => {
  const path = getRequestURL(event).pathname
  if (legacyServicePath(path, event.method)) {
    throw createError({ statusCode: 410, statusMessage: 'Portal orders are no longer available. Please contact the recommended provider directly.' })
  }
})
