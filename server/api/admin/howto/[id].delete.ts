import { getDb } from '../../../db/index'
import type { HowtoItemRow } from '../../../db/index'
import { existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = getRouterParam(event, 'id')
  const db = getDb()
  const item = db.prepare('SELECT * FROM howto_items WHERE id = ?').get(id) as HowtoItemRow | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Navodilo ni najdeno' })
  }

  if (item.image_path) {
    const filePath = join(process.cwd(), 'data', 'uploads', 'howto', item.image_path)
    if (existsSync(filePath)) unlinkSync(filePath)
  }

  db.prepare('DELETE FROM howto_items WHERE id = ?').run(id)

  return { success: true }
})
