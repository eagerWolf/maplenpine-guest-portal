import { getDb, now } from '../../../db/index'
import type { News } from '../../../db/index'
import { parseLocalizedText } from '../../../utils/localized'
import { validateContentDates } from '../../../utils/dateRange'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  const id = getRouterParam(event, 'id'); const db = getDb()
  const item = db.prepare('SELECT * FROM news WHERE id=?').get(id) as News | undefined
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Novica ni najdena' })
  const body = await readBody<any>(event)
  const title = body.title === undefined ? JSON.parse(item.title) : parseLocalizedText(body.title, 'Naslov')
  const content = body.content === undefined ? JSON.parse(item.content) : parseLocalizedText(body.content, 'Vsebina')
  const recurring = body.recurring === undefined ? !!item.recurring : !!body.recurring
  const dates = validateContentDates('valid_from' in body ? body.valid_from : item.valid_from, 'valid_to' in body ? body.valid_to : item.valid_to, recurring)
  db.prepare(`UPDATE news SET title_sl=?,title_en=?,content_sl=?,content_en=?,title=?,content=?,recurring=?,active=?,valid_from=?,valid_to=?,updated_at=? WHERE id=?`).run(
    title.sl,title.en,content.sl,content.en,JSON.stringify(title),JSON.stringify(content),recurring?1:0,
    body.active === undefined ? item.active : (body.active ? 1 : 0),dates.validFrom,dates.validTo,now(),id)
  return { success: true }
})
