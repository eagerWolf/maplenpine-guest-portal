export const serviceLocales = ['en', 'sl', 'de', 'hr', 'sr'] as const
export type ServiceLocale = typeof serviceLocales[number]
export type ServiceKind = 'breakfast' | 'bikes'

export const serviceCopy = {
  en: { recommendation: 'Our recommendation', breakfast: 'Breakfast', bikes: 'Bike rental', breakfastAction: 'Order from Bled Breakfast', bikesAction: 'Visit A&B Bike', direct: 'Arrange your order, payment and any changes directly with the provider.' },
  sl: { recommendation: 'Naše priporočilo', breakfast: 'Zajtrk', bikes: 'Najem koles', breakfastAction: 'Naroči pri Bled Breakfast', bikesAction: 'Obišči A&B Bike', direct: 'Naročilo, plačilo in morebitne spremembe uredi neposredno pri ponudniku.' },
  de: { recommendation: 'Unsere Empfehlung', breakfast: 'Frühstück', bikes: 'Fahrradverleih', breakfastAction: 'Bei Bled Breakfast bestellen', bikesAction: 'A&B Bike besuchen', direct: 'Bestellung, Zahlung und Änderungen vereinbaren Sie direkt mit dem Anbieter.' },
  hr: { recommendation: 'Naša preporuka', breakfast: 'Doručak', bikes: 'Najam bicikala', breakfastAction: 'Naruči kod Bled Breakfast', bikesAction: 'Posjeti A&B Bike', direct: 'Narudžbu, plaćanje i eventualne promjene dogovori izravno s pružateljem usluge.' },
  sr: { recommendation: 'Naša preporuka', breakfast: 'Doručak', bikes: 'Iznajmljivanje bicikala', breakfastAction: 'Naruči kod Bled Breakfast', bikesAction: 'Poseti A&B Bike', direct: 'Porudžbinu, plaćanje i eventualne promene dogovori direktno sa pružaocem usluge.' },
} satisfies Record<ServiceLocale, Record<string, string>>

export const recommendationDefaults: Record<string, string> = {
  recommendation_breakfast_name: 'Bled Breakfast',
  recommendation_breakfast_url: 'https://www.bledbreakfast.com/',
  recommendation_bikes_name: 'A&B Bike',
  recommendation_bikes_url: 'https://www.ab-bike.si/en',
}
const descriptions: Record<ServiceKind, Record<ServiceLocale, string>> = {
  breakfast: {
    en: 'Start your morning with a breakfast basket from Bled Breakfast. Their baskets bring together products from local farms and bakeries, with delivery in the Bled area. Browse the current selection and place your order on their website.',
    sl: 'Za prijetno jutro priporočamo košarico Bled Breakfast. V njej so izdelki lokalnih kmetij in pekarn, ponudnik pa dostavlja na območju Bleda. Aktualno ponudbo preveri in naročilo oddaj na njihovi spletni strani.',
    de: 'Beginnen Sie den Morgen mit einem Frühstückskorb von Bled Breakfast. Die Körbe enthalten Produkte lokaler Bauernhöfe und Bäckereien und werden in der Region Bled geliefert. Das aktuelle Angebot und die Bestellung finden Sie auf der Website des Anbieters.',
    hr: 'Za ugodno jutro preporučujemo košaricu Bled Breakfast s proizvodima lokalnih farmi i pekarnica te dostavom na području Bleda. Aktualnu ponudu provjeri i narudžbu napravi na njihovoj stranici.',
    sr: 'Za prijatno jutro preporučujemo korpu Bled Breakfast sa proizvodima lokalnih farmi i pekara i dostavom na području Bleda. Aktuelnu ponudu proveri i porudžbinu napravi na njihovom sajtu.',
  },
  bikes: {
    en: 'Explore Bled and the surrounding area by bike. We recommend A&B Bike for bike and e-bike rental. Check their website for the current selection, availability and rental conditions.',
    sl: 'Bled in okolico razišči s kolesom. Za najem koles in e-koles priporočamo A&B Bike. Aktualno ponudbo, razpoložljivost in pogoje najema preveri na njihovi spletni strani.',
    de: 'Entdecken Sie Bled und die Umgebung mit dem Fahrrad. Für Fahrräder und E-Bikes empfehlen wir A&B Bike. Das aktuelle Angebot, die Verfügbarkeit und die Mietbedingungen finden Sie auf der Website des Anbieters.',
    hr: 'Istraži Bled i okolicu biciklom. Za najam bicikala i e-bicikala preporučujemo A&B Bike. Aktualnu ponudu, dostupnost i uvjete najma provjeri na njihovoj stranici.',
    sr: 'Istraži Bled i okolinu biciklom. Za iznajmljivanje bicikala i e-bicikala preporučujemo A&B Bike. Aktuelnu ponudu, dostupnost i uslove najma proveri na njihovom sajtu.',
  },
}
const notes: Record<ServiceKind, Record<ServiceLocale, string>> = {
  breakfast: {
    en: 'When ordering, enter your apartment address and confirm delivery details with Bled Breakfast. Check prices, delivery times, order deadlines and dietary options with the provider.',
    sl: 'Ob naročilu navedi naslov apartmaja in z Bled Breakfast potrdi podrobnosti dostave. Pri ponudniku preveri cene, ure dostave, rok naročila in prehranske možnosti.',
    de: 'Geben Sie bei der Bestellung die Adresse Ihres Apartments an und bestätigen Sie die Lieferung mit Bled Breakfast. Preise, Lieferzeiten, Bestellfristen und Ernährungsoptionen erfragen Sie beim Anbieter.',
    hr: 'Pri naručivanju navedi adresu apartmana i s Bled Breakfast potvrdi detalje dostave. Cijene, vrijeme dostave, rok naručivanja i prehrambene opcije provjeri kod pružatelja usluge.',
    sr: 'Pri naručivanju navedi adresu apartmana i sa Bled Breakfast potvrdi detalje dostave. Cene, vreme dostave, rok naručivanja i opcije ishrane proveri kod pružaoca usluge.',
  },
  bikes: {
    en: 'Ask A&B Bike whether they can deliver the bikes to your apartment. Arrange availability, delivery, collection and any additional charge directly with them.',
    sl: 'Pri A&B Bike vprašaj za možnost prevoza koles do apartmaja. Razpoložljivost, dostavo, prevzem in morebitno doplačilo dogovori neposredno z njimi.',
    de: 'Fragen Sie A&B Bike, ob die Fahrräder zu Ihrem Apartment geliefert werden können. Verfügbarkeit, Lieferung, Abholung und mögliche Zusatzkosten vereinbaren Sie direkt mit dem Anbieter.',
    hr: 'Pitaj A&B Bike mogu li dostaviti bicikle do apartmana. Dostupnost, dostavu, preuzimanje i eventualnu nadoplatu dogovori izravno s njima.',
    sr: 'Pitaj A&B Bike da li mogu da dostave bicikle do apartmana. Dostupnost, dostavu, preuzimanje i eventualnu doplatu dogovori direktno sa njima.',
  },
}
for (const kind of ['breakfast', 'bikes'] as const) {
  for (const locale of serviceLocales) {
    recommendationDefaults[`recommendation_${kind}_description_${locale}`] = descriptions[kind][locale]
    recommendationDefaults[`recommendation_${kind}_note_${locale}`] = notes[kind][locale]
  }
}
export const recommendationKeys = Object.keys(recommendationDefaults)

export function recommendation(kind: ServiceKind, locale: ServiceLocale, settings: Record<string, string> = {}) {
  const value = (field: string) => settings[`recommendation_${kind}_${field}`]?.trim() || recommendationDefaults[`recommendation_${kind}_${field}`] || ''
  const url = value('url')
  let safeUrl = recommendationDefaults[`recommendation_${kind}_url`]!
  try { const parsed = new URL(url); if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) safeUrl = parsed.href } catch {}
  return { name: value('name'), url: safeUrl, description: value(`description_${locale}`), note: value(`note_${locale}`) }
}
