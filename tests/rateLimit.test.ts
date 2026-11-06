import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { clientAddress, enforceRateLimit, pruneRateLimits } from '../server/utils/rateLimit'

function event(peer: string, headers: Record<string, string> = {}) {
  return { node: { req: { socket: { remoteAddress: peer } } }, headers } as unknown as H3Event
}
beforeEach(() => {
  pruneRateLimits(Infinity)
  vi.stubEnv('TRUSTED_PROXY_IPS', '127.0.0.1,::1')
  vi.stubEnv('TRUSTED_PROXY_HEADER', 'x-forwarded-for')
  vi.stubGlobal('getHeader', (e: any, name: string) => e.headers[name])
  vi.stubGlobal('setResponseHeader', vi.fn())
})
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers() })

it('ignores spoofed headers from direct clients and cannot reset their limit', () => {
  enforceRateLimit(event('192.0.2.1', { 'x-forwarded-for': '1.1.1.1' }), 'login', 1)
  expect(() => enforceRateLimit(event('192.0.2.1', { 'x-forwarded-for': '2.2.2.2', 'cf-connecting-ip': '3.3.3.3' }), 'login', 1)).toThrow()
})
it('trusts the nearest untrusted address, not an injected leftmost address', () => {
  expect(clientAddress(event('::ffff:127.0.0.1', { 'x-forwarded-for': '1.1.1.1, 192.0.2.1, ::1' }))).toBe('192.0.2.1')
})
it('accepts CF only when explicitly configured and behind a trusted peer', () => {
  vi.stubEnv('TRUSTED_PROXY_HEADER', 'cf-connecting-ip')
  expect(clientAddress(event('127.0.0.1', { 'cf-connecting-ip': '2001:db8::1' }))).toBe('2001:db8::1')
  expect(clientAddress(event('192.0.2.1', { 'cf-connecting-ip': '2001:db8::1' }))).toBe('192.0.2.1')
})
it('fails closed for missing, invalid or unconfigured headers', () => {
  expect(clientAddress(event('127.0.0.1', { 'x-forwarded-for': 'garbage, 192.0.2.1' }))).toBe('127.0.0.1')
  vi.stubEnv('TRUSTED_PROXY_IPS', '')
  expect(clientAddress(event('127.0.0.1', { 'x-forwarded-for': '192.0.2.1' }))).toBe('127.0.0.1')
})
it('removes expired entries while keeping active limits and resets the window', () => {
  vi.useFakeTimers(); vi.setSystemTime(1000)
  enforceRateLimit(event('192.0.2.1'), 'login', 1, 1000)
  enforceRateLimit(event('192.0.2.2'), 'login', 1, 3000)
  expect(pruneRateLimits(2000)).toBe(1)
  vi.setSystemTime(2000)
  expect(() => enforceRateLimit(event('192.0.2.1'), 'login', 1, 1000)).not.toThrow()
  expect(() => enforceRateLimit(event('192.0.2.2'), 'login', 1, 3000)).toThrow()
  expect(pruneRateLimits(5000)).toBe(0)
})
