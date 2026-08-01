import { describe, expect, it, vi } from 'vitest'
vi.mock('#imports', () => ({ useRuntimeConfig: () => ({}) }))
import { sendGuestPin } from '../server/utils/email'

describe('večjezični PIN email', () => {
  it('uporabi jezik rezervacije', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await sendGuestPin({
      to: 'ana@example.com', guestName: 'Ana Novak', pin: '1234', door: 'Maple',
      validFrom: '2026-08-02 13:00', validUntil: '2026-08-05 11:30',
      portalLink: 'https://portal.test/guest/token', apiKey: 'sg', from: 'portal@test.si', lang: 'sl',
    })
    const request = fetchMock.mock.calls[0]?.[1] as { body: string }
    const payload = JSON.parse(request.body)
    expect(payload.subject).toContain('Vaša dostopna PIN koda')
    expect(payload.content[0].value).toContain('Velja od')
  })

  it('za neznan jezik uporabi angleščino', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await sendGuestPin({
      to: 'ana@example.com', guestName: 'Ana Novak', pin: '1234', door: 'Pine',
      validFrom: 'from', validUntil: 'until', portalLink: 'https://portal.test',
      apiKey: 'sg', from: 'portal@test.si', lang: 'fr',
    })
    const payload = JSON.parse((fetchMock.mock.calls[0]?.[1] as { body: string }).body)
    expect(payload.subject).toContain('Your Access PIN')
  })
})
