import { getDb } from '../../../../db/index'
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })

  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  const db = getDb()

  const partner = db.prepare('SELECT contract_filename, contract_original_name FROM partners WHERE id = ?').get(id) as {
    contract_filename: string | null
    contract_original_name: string | null
  } | undefined

  if (!partner?.contract_filename) throw createError({ statusCode: 404, statusMessage: 'Pogodba ne obstaja' })

  const filePath = join(process.cwd(), 'data', 'contracts', partner.contract_filename)
  if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: 'Datoteka ni najdena' })

  const filename = encodeURIComponent(partner.contract_original_name ?? partner.contract_filename)
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setResponseHeader(event, 'Cache-Control', 'no-cache')

  return sendStream(event, createReadStream(filePath))
})
