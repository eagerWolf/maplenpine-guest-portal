import { getDb, now } from '../../../../db/index'
import { writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  const db = getDb()

  const existing = db.prepare('SELECT id FROM partners WHERE id = ?').get(id) as { id: number } | undefined
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Partner ne obstaja' })

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'contract')
  if (!filePart?.data) throw createError({ statusCode: 400, statusMessage: 'Manjka datoteka (polje: contract)' })

  if (filePart.data.length > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'Datoteka je prevelika (max 20 MB)' })
  }

  const originalName = filePart.filename ?? 'pogodba'
  const ext = extname(originalName) || '.bin'
  const storedName = `partner_${id}${ext}`

  await writeFile(join(process.cwd(), 'data', 'contracts', storedName), filePart.data)

  db.prepare(
    'UPDATE partners SET contract_filename = ?, contract_original_name = ?, updated_at = ? WHERE id = ?',
  ).run(storedName, originalName, now(), id)

  return { success: true, filename: storedName, originalName }
})
