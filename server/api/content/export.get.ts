import { buildWebsiteExport, validateWebsiteExportToken } from '../../utils/websiteContent'

export default defineEventHandler((event) => {
  validateWebsiteExportToken(getHeader(event, 'authorization'))
  const payload = buildWebsiteExport()
  setHeader(event, 'cache-control', 'private, no-store')
  setHeader(event, 'etag', `"${payload.contentHash}"`)
  return payload
})
