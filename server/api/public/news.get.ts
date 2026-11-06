import { getDb, today } from '../../db/index'
import type { News } from '../../db/index'
import { isActiveToday } from '../../utils/dateRange'

// Editorial content only. Never add reservation, Wi-Fi or device credentials here.
export default defineEventHandler((event) => {
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Cache-Control', 'no-store')
  const rows = getDb().prepare(`
    SELECT id, title, content, created_at, active, valid_from, valid_to, recurring
    FROM news WHERE active = 1 ORDER BY created_at DESC, id DESC
  `).all() as News[]
  const date = today()
  return {
    source: 'portal',
    syncedAt: new Date().toISOString(),
    items: rows.filter(n => isActiveToday(n.valid_from, n.valid_to, !!n.recurring, date)).map(n => ({
      id: n.id,
      title: JSON.parse(n.title),
      content: JSON.parse(n.content),
      createdAt: n.created_at,
      active: true,
      validFrom: n.valid_from,
      validTo: n.valid_to,
      recurring: !!n.recurring,
    })),
  }
})
