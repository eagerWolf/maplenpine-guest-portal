import { getDb } from '../../db/index'
import { recommendationDefaults, recommendationKeys } from '../../../shared/serviceRecommendations'

const PUBLIC_KEYS = ['instagram_url', 'facebook_url', 'contact_phone', 'property_nav_url', 'breakfast_enabled', 'ebike_enabled', ...recommendationKeys]

export default defineEventHandler(() => {
  const db = getDb()
  const rows = db.prepare(
    `SELECT key, value FROM app_settings WHERE key IN (${PUBLIC_KEYS.map(() => '?').join(',')})`,
  ).all(...PUBLIC_KEYS) as Array<{ key: string; value: string }>

  const result: Record<string, string> = {}
  for (const key of PUBLIC_KEYS) result[key] = recommendationDefaults[key] || ''
  for (const row of rows) result[row.key] = row.value
  // Legacy order switches no longer control the recommendation pages.
  result.breakfast_enabled = '0'
  result.ebike_enabled = '0'
  return result
})
