import type { H3Event } from 'h3'

const attempts = new Map<string, { count: number; resetAt: number }>()

export function enforceRateLimit(event: H3Event, scope: string, limit = 10, windowMs = 15 * 60_000): void {
  const forwarded = getHeader(event, 'cf-connecting-ip') || getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
  const key = `${scope}:${forwarded || event.node.req.socket.remoteAddress || 'unknown'}`
  const timestamp = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= timestamp) {
    attempts.set(key, { count: 1, resetAt: timestamp + windowMs })
    return
  }
  current.count += 1
  if (current.count > limit) {
    setResponseHeader(event, 'Retry-After', Math.ceil((current.resetAt - timestamp) / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Preveč poskusov. Poskusite pozneje.' })
  }
}
