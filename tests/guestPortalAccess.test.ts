import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const fixture = vi.hoisted(() => ({
  reservation: {
    id: 1, first_name: 'Test', last_name: 'Guest', door: 'Pine', status: 'active',
    check_in: '2026-11-28', check_out: '2026-12-03', pin: '1234',
    access_valid_from: '2026-11-28 13:00', access_valid_until: '2026-12-03 11:30',
  },
  token: { reservation_id: 1, expires_at: '2026-12-04T00:00:00Z' },
}))
vi.mock('../server/db/index', () => ({
  today: () => '2026-11-20',
  getDb: () => ({ prepare: (sql: string) => ({
    get: () => sql.includes('guest_tokens') ? fixture.token : fixture.reservation,
  }) }),
}))
vi.mock('../server/utils/jobs', () => ({ getSettings: () => ({
  contact_phone: '+38611111111', reception_whatsapp: '+38622222222',
}) }))
vi.mock('../server/utils/breakfast', () => ({ isAdminGuestPreview: async () => false }))
const handler = (await import('../server/api/guest/[token].get')).default as Function
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-20T12:00:00Z'))
  fixture.reservation.status = 'active'
  vi.stubGlobal('getRouterParam', () => 'test-link')
})
afterEach(() => vi.useRealTimers())

it('opens the portal before arrival without returning PIN or contacts', async () => {
  const result = await handler({})
  expect(result.name).toBe('Test Guest')
  expect(result.detailsAvailable).toBe(false)
  expect(result.pin).toBeNull()
  expect(result.contactPhone).toBeNull()
  expect(result.receptionPhone).toBeNull()
  expect(result.receptionWhatsapp).toBeNull()
})
it('returns PIN and contacts at exactly 72 hours before arrival', async () => {
  vi.setSystemTime(new Date('2026-11-25T12:00:00Z'))
  const result = await handler({})
  expect(result.detailsAvailable).toBe(true)
  expect(result.pin).toBe('1234')
  expect(result.receptionPhone).toBe('+38622222222')
})
it('still rejects a cancelled reservation', async () => {
  fixture.reservation.status = 'cancelled'
  await expect(handler({})).rejects.toMatchObject({ statusCode: 410 })
})
