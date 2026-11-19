import type { Reservation } from '../db/index'

// Plain text for Bentral's guest conversation; keep all access data server-side.
export function guestAccessMessage(reservation: Reservation, pin: string, portalLink: string): string {
  const door = reservation.door.replace(',', ' & ')
  const from = reservation.access_valid_from || reservation.check_in
  const until = reservation.access_valid_until || reservation.check_out
  const messages: Record<string, string> = {
    en: `Welcome to Maple & Pine!\nApartment: ${door}\nYour access PIN: ${pin}\nValid from: ${from}\nValid until: ${until}\nYour guest portal with arrival instructions and recommendations: ${portalLink}`,
    sl: `Dobrodošli v Maple & Pine!\nApartma: ${door}\nVaša koda za dostop: ${pin}\nVelja od: ${from}\nVelja do: ${until}\nVaš gostinski portal z navodili za prihod in priporočili: ${portalLink}`,
    de: `Willkommen bei Maple & Pine!\nApartment: ${door}\nIhr Zugangscode: ${pin}\nGültig ab: ${from}\nGültig bis: ${until}\nIhr Gästeportal mit Anreiseinformationen und Empfehlungen: ${portalLink}`,
    hr: `Dobrodošli u Maple & Pine!\nApartman: ${door}\nVaš pristupni PIN: ${pin}\nVrijedi od: ${from}\nVrijedi do: ${until}\nVaš portal za goste s uputama za dolazak i preporukama: ${portalLink}`,
    sr: `Dobrodošli u Maple & Pine!\nApartman: ${door}\nVaš pristupni PIN: ${pin}\nVaži od: ${from}\nVaži do: ${until}\nVaš portal za goste sa uputstvima za dolazak i preporukama: ${portalLink}`,
  }
  return messages[reservation.guest_lang_override || reservation.guest_lang || 'en'] || messages.en!
}
