import type { H3Event } from 'h3'
import { isIP } from 'node:net'

const attempts = new Map<string, { count: number; resetAt: number }>()

const normalize = (ip: string) => ip.startsWith('::ffff:') ? ip.slice(7) : ip

// Exact proxy addresses only. The edge must overwrite the selected header.
export function clientAddress(event: H3Event): string {
  const peer = normalize(event.node.req.socket.remoteAddress || 'unknown')
  const trusted = (process.env.TRUSTED_PROXY_IPS || '').split(',').map(ip => normalize(ip.trim())).filter(ip => isIP(ip))
  if (!trusted.includes(peer)) return peer
  const header = process.env.TRUSTED_PROXY_HEADER
  if (header !== 'cf-connecting-ip' && header !== 'x-forwarded-for') return peer
  const value = getHeader(event, header)?.trim()
  if (!value) return peer
  if (header === 'cf-connecting-ip') return isIP(value) ? normalize(value) : peer
  // Walk from the socket towards the client; never trust a client-supplied leftmost entry.
  const chain = value.split(',').map(ip => ip.trim())
  if (chain.some(ip => !isIP(ip))) return peer
  for (const ip of chain.reverse().map(normalize)) if (!trusted.includes(ip)) return ip
  return peer
}

export function pruneRateLimits(timestamp = Date.now()): number {
  for (const [key, value] of attempts) if (value.resetAt <= timestamp) attempts.delete(key)
  return attempts.size
}

const cleanup = setInterval(pruneRateLimits, 60_000)
cleanup.unref()

export function enforceRateLimit(event: H3Event, scope: string, limit = 10, windowMs = 15 * 60_000): void {
  const key = `${scope}:${clientAddress(event)}`
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
