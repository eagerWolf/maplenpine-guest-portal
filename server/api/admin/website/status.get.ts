import { buildWebsiteExport } from '../../../utils/websiteContent'
import { getSettings } from '../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })
  const settings = getSettings()
  const content = buildWebsiteExport()
  return {
    configured: !!settings.website_export_token && !!settings.website_portal_public_url,
    deployConfigured: !!settings.cloudflare_deploy_hook,
    nightlyEnabled: settings.website_nightly_publish === '1',
    lastPublishAt: settings.website_last_publish_at || null,
    lastPublishStatus: settings.website_last_publish_status || null,
    lastPublishError: settings.website_last_publish_error || null,
    counts: {
      restaurants: content.restaurants.length,
      suggestions: content.suggestions.length,
      news: content.news.length,
      faq: content.faq.length,
      howTo: content.howTo.length,
      houseRules: content.houseRules.length,
    },
    contentHash: content.contentHash,
  }
})
