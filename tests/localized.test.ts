import { describe, expect, it } from 'vitest'
import { CONTENT_LOCALES, normalizeLocalizedLabel, parseLocalizedLinks, parseLocalizedText } from '../server/utils/localized'

const translations = { en: ' Hello ', sl: ' Živjo ', de: ' Hallo ', hr: ' Bok ', sr: ' Zdravo ' }

describe('prevodi vsebin', () => {
  it('zahteva in obreže vse jezike', () => {
    const parsed = parseLocalizedText(translations, 'Naslov')
    expect(parsed.en).toBe('Hello')
    expect(Object.keys(parsed)).toEqual(CONTENT_LOCALES)
  })
  it('zavrne manjkajoč prevod', () => expect(() => parseLocalizedText({ ...translations, de: '' }, 'Naslov')).toThrow('DE'))
  it('staro besedilo razširi v vse jezike', () => expect(normalizeLocalizedLabel('Lokacija')).toEqual({ en: 'Lokacija', sl: 'Lokacija', de: 'Lokacija', hr: 'Lokacija', sr: 'Lokacija' }))
  it('validira lokalizirane povezave', () => {
    expect(parseLocalizedLinks([{ label: translations, href: ' https://maps.google.com/test ' }], 'Gumbi')[0]?.href).toBe('https://maps.google.com/test')
    expect(() => parseLocalizedLinks([{ label: translations, href: '' }], 'Gumbi')).toThrow('povezava je obvezna')
  })
})
