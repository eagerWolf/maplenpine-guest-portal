import type { Reservation } from '../db/index'

// Access timestamps are already local apartment times; do not convert time zones.
function displayAccessTime(value: string, language: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2})(?::\d{2})?)?$/)
  if (!match) return value
  const date = `${Number(match[3])}. ${Number(match[2])}. ${match[1]}`
  if (!match[4]) return date
  const at: Record<string, string> = { sl: 'ob', en: 'at', de: 'um', hr: 'u', sr: 'u' }
  return `${date} ${at[language] || at.en} ${match[4]}`
}

// Plain text: Bentral routes the message to the reservation's conversation.
export function guestAccessMessage(reservation: Reservation, pin: string, portalLink: string): string {
  const requested = reservation.guest_lang_override || reservation.guest_lang || 'en'
  const language = ['sl', 'en', 'de', 'hr', 'sr'].includes(requested) ? requested : 'en'
  const firstName = (reservation.first_name || '').trim().replace(/\s+/g, ' ')
  const name = firstName ? ` ${firstName}` : ''
  const door = reservation.door.split(',').map(value => value.trim()).join(' & ')
  const plural = reservation.door.includes(',')
  const from = displayAccessTime(reservation.access_valid_from || reservation.check_in, language)
  const until = displayAccessTime(reservation.access_valid_until || reservation.check_out, language)
  const signature = 'Maple & Pine'
  const messages: Record<string, string> = {
    sl: `Hej${name},\n\nvaša osebna koda za vstop v ${plural ? 'apartmaja' : 'apartma'} ${door} je:\n\n${pin}\n\nKoda velja od ${from} do ${until}.\n\nVeč informacij o vašem bivanju, navodila za prihod in priporočila najdete na vašem osebnem portalu:\n${portalLink}\n\nLep pozdrav,\n${signature}`,
    en: `Hi${name},\n\nyour personal access code for ${plural ? 'apartments' : 'apartment'} ${door} is:\n\n${pin}\n\nThe code is valid from ${from} until ${until}.\n\nYou can find more information about your stay, arrival instructions and recommendations on your personal guest portal:\n${portalLink}\n\nBest regards,\n${signature}`,
    de: `Hallo${name},\n\nIhr persönlicher Zugangscode für ${plural ? 'die Apartments' : 'das Apartment'} ${door} lautet:\n\n${pin}\n\nDer Code ist vom ${from} bis zum ${until} gültig.\n\nWeitere Informationen zu Ihrem Aufenthalt, Hinweise zur Anreise und Empfehlungen finden Sie in Ihrem persönlichen Gästeportal:\n${portalLink}\n\nFreundliche Grüße\n${signature}`,
    hr: `Pozdrav${name},\n\nvaša osobna šifra za ulazak u ${plural ? 'apartmane' : 'apartman'} ${door} je:\n\n${pin}\n\nŠifra vrijedi od ${from} do ${until}.\n\nViše informacija o vašem boravku, upute za dolazak i preporuke pronaći ćete na svom osobnom portalu:\n${portalLink}\n\nSrdačan pozdrav,\n${signature}`,
    sr: `Zdravo${name},\n\nvaša lična šifra za ulazak u ${plural ? 'apartmane' : 'apartman'} ${door} je:\n\n${pin}\n\nŠifra važi od ${from} do ${until}.\n\nViše informacija o vašem boravku, uputstva za dolazak i preporuke pronaći ćete na svom ličnom portalu:\n${portalLink}\n\nSrdačan pozdrav,\n${signature}`,
  }
  return messages[language]!
}
