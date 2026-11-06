import { authenticateTV, buildTVContent } from '../../utils/tvContent'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(event => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  enforceRateLimit(event, 'tv-content', 120, 60_000)
  const apartment = authenticateTV(getHeader(event, 'authorization'))
  const section = getQuery(event).section
  if (typeof section !== 'string') throw createError({ statusCode: 400, statusMessage: 'Missing section' })
  return buildTVContent(apartment, section)
})
