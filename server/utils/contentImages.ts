import { getDb, now } from '../db/index'
import { writeFile, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import type { H3Event } from 'h3'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_EXT = ['.webp', '.jpg', '.jpeg', '.png']

type ContentTable = 'restaurants' | 'suggestions' | 'howto_items'
type ContentCategory = 'restaurants' | 'suggestions' | 'howto'

export async function saveContentImage(event: H3Event, table: ContentTable, category: ContentCategory) {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  const db = getDb()
  const existing = db.prepare(`SELECT id, image_path FROM ${table} WHERE id = ?`).get(id) as
    | { id: number; image_path: string | null }
    | undefined
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Vnos ne obstaja' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'image')
  if (!filePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Manjka datoteka (polje: image)' })
  }
  if (filePart.data.length > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'Slika je prevelika (max 5 MB)' })
  }

  const ext = extname(filePart.filename ?? '').toLowerCase()
  if (!ALLOWED_EXT.includes(ext)) {
    throw createError({ statusCode: 400, statusMessage: 'Dovoljene so samo slike (webp, jpg, png)' })
  }

  const dir = join(process.cwd(), 'data', 'uploads', category)
  const filename = `${id}-${Date.now()}${ext}`
  await writeFile(join(dir, filename), filePart.data)

  if (existing.image_path) {
    const oldPath = join(dir, existing.image_path)
    if (existsSync(oldPath)) await unlink(oldPath).catch(() => {})
  }

  db.prepare(`UPDATE ${table} SET image_path = ?, updated_at = ? WHERE id = ?`).run(filename, now(), id)

  return { success: true, imagePath: filename }
}
