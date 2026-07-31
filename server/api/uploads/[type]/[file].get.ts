import { createReadStream, existsSync } from 'node:fs'
import { join, basename, extname } from 'node:path'

const ALLOWED_TYPES = ['restaurants', 'suggestions', 'howto']

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
}

export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, 'type') ?? ''
  const file = basename(getRouterParam(event, 'file') ?? '')

  if (!ALLOWED_TYPES.includes(type) || !file) {
    throw createError({ statusCode: 404, statusMessage: 'Slika ni najdena' })
  }

  const filePath = join(process.cwd(), 'data', 'uploads', type, file)
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Slika ni najdena' })
  }

  const mime = MIME_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
  setResponseHeader(event, 'Content-Type', mime)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return sendStream(event, createReadStream(filePath))
})
