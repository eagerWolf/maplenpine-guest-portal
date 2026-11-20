import { afterEach, expect, it, vi } from 'vitest'
import { recommendation, serviceLocales } from '../shared/serviceRecommendations'
import { legacyServicePath, messagingEnabled, emailEnabled, bentralGuestMessagesEnabled } from '../server/utils/servicePolicy'
import { sendBentralGuestMessage } from '../server/utils/bentral'
import { guestAccessMessage } from '../server/utils/guestAccessMessage'
import type { Reservation } from '../server/db/index'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
it('provides external recommendations and bike delivery guidance in all five languages', () => {
  for (const locale of serviceLocales) {
    const breakfast = recommendation('breakfast', locale)
    const bikes = recommendation('bikes', locale)
    expect(breakfast.url).toBe('https://www.bledbreakfast.com/')
    expect(bikes.url).toBe('https://www.ab-bike.si/en')
    expect(bikes.description.length).toBeGreaterThan(40)
    expect(bikes.note.length).toBeGreaterThan(40)
  }
  expect(recommendation('bikes', 'sl').note).toContain('prevoza koles do apartmaja')
  expect(recommendation('bikes', 'en', { recommendation_bikes_url: 'javascript:alert(1)' }).url).toBe('https://www.ab-bike.si/en')
})
it('blocks retired order API writes and guest order reads while preserving historical admin reads', () => {
  expect(legacyServicePath('/api/guest/breakfast/order', 'POST')).toBe(true)
  expect(legacyServicePath('/api/guest/ebike/providers', 'GET')).toBe(true)
  expect(legacyServicePath('/api/partner/breakfast/token/confirm', 'POST')).toBe(true)
  expect(legacyServicePath('/api/admin/breakfast/orders', 'GET')).toBe(false)
  expect(legacyServicePath('/api/public/settings', 'GET')).toBe(false)
})
it('keeps WhatsApp separate from opt-in SendGrid and independently paused Bentral guest sends', () => {
  vi.stubEnv('PORTAL_WHATSAPP_ENABLED', '')
  vi.stubEnv('PORTAL_EMAIL_ENABLED', '')
  vi.stubEnv('BENTRAL_GUEST_MESSAGES_ENABLED', 'false')
  expect(messagingEnabled()).toBe(true)
  expect(emailEnabled()).toBe(false)
  expect(bentralGuestMessagesEnabled()).toBe(false)
  vi.stubEnv('PORTAL_WHATSAPP_ENABLED', 'false')
  expect(messagingEnabled()).toBe(false)
})
it('uses the support-provided Bentral payload and leaves recipient routing to Bentral', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }); vi.stubGlobal('fetch', fetch)
  await sendBentralGuestMessage('test-key', 'R-1', 'PIN and portal link')
  expect(fetch).toHaveBeenCalledWith('https://api.bentral.com/v1/messages', expect.objectContaining({
    method: 'POST', headers: { 'X-API-KEY': 'test-key', 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'email', reservationId: 'R-1', message: 'PIN and portal link' }),
  }))
})
it('flags an ambiguous Bentral POST for manual review, without claiming non-delivery', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
  await expect(sendBentralGuestMessage('test', 'R-1', 'test')).rejects.toMatchObject({ name: 'BentralMessageDeliveryUnknown' })
})
it('composes a localized PIN and portal link without needing a guest email', () => {
  const reservation = { door: 'Maple,Pine', check_in: '2026-12-01', check_out: '2026-12-03', guest_lang: 'sl' } as Reservation
  const message = guestAccessMessage(reservation, '1234', 'https://portal.test/guest/token')
  expect(message).toContain('vaša osebna koda za vstop v apartmaja Maple & Pine je:\n\n1234')
  expect(message).toContain('https://portal.test/guest/token')
  expect(message).toContain('Maple & Pine')
})

it('personalizes the access message using exact local access dates and times', () => {
  const reservation = {
    first_name: 'Matija', door: 'Maple', check_in: '2026-12-06', check_out: '2026-12-12',
    access_valid_from: '2026-12-06 13:00', access_valid_until: '2026-12-12 11:30', guest_lang: 'sl',
  } as Reservation
  const message = guestAccessMessage(reservation, '1234', 'https://portal.test/guest/example')
  expect(message).toContain('Hej Matija,\n\n')
  expect(message).toContain('Koda velja od 6. 12. 2026 ob 13:00 do 12. 12. 2026 ob 11:30.')
  expect(message).toContain('\n\n1234\n\n')
  expect(message).toContain('osebnem portalu:\nhttps://portal.test/guest/example')
  expect(message).toMatch(/Lep pozdrav,\nMaple & Pine$/)
  expect(message).not.toMatch(/\{(?:pin|signature|first_name)\}/)
})

it('uses language override, English fallback and a clean greeting without a name', () => {
  const base = { door: 'Pine', check_in: '2026-12-06', check_out: '2026-12-12', guest_lang: 'sl', guest_lang_override: 'en' } as Reservation
  expect(guestAccessMessage(base, '1234', 'https://portal.test')).toMatch(/^Hi,\n/)
  expect(guestAccessMessage({ ...base, guest_lang_override: 'xx' }, '1234', 'https://portal.test')).toMatch(/^Hi,\n/)
  for (const language of ['sl', 'en', 'de', 'hr', 'sr']) {
    const text = guestAccessMessage({ ...base, guest_lang_override: language }, '1234', 'https://portal.test')
    expect(text).toContain('1234')
    expect(text).toContain('https://portal.test')
    expect(text).toContain('6. 12. 2026')
    expect(text).not.toContain('undefined')
  }
})
