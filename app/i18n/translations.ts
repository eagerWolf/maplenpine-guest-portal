export type Locale = 'en' | 'sl' | 'de' | 'hr' | 'sr'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'sl', label: 'SL' },
  { code: 'de', label: 'DE' },
  { code: 'hr', label: 'HR' },
  { code: 'sr', label: 'SR' },
]

// ─── UI strings ────────────────────────────────────────────────────────────

export interface UI {
  nav: { home: string; howToUse: string; faq: string; restaurants: string; suggestions: string; breakfast: string }
  hero: {
    kicker: string; welcome: string
    guestSingular: string; guestPlural: string
    checkIn: string; checkOut: string
    directions: string; callUs: string
  }
  pin: { kicker: string; reveal: string; hide: string; pending: string }
  parking: { kicker: string; text: string }
  rules: { kicker: string; items: string[] }
  weather: { kicker: string }
  news: { kicker: string }
  access: { expiredTitle: string; expiredMessage: string; notFoundTitle: string; notFoundMessage: string }
  adventure: { title: string; desc: string; cta: string }
  pages: {
    howTo: { kicker: string; title: string; pdfLabel: string }
    faq: { kicker: string; title: string }
    goodToKnow: { kicker: string; title: string }
    restaurants: { kicker: string; title: string }
    suggestions: { kicker: string; title: string }
  }
  related: {
    howToUse: string; howToUseDesc: string
    faq: string; faqDesc: string
    goodToKnow: string; goodToKnowDesc: string
    restaurants: string; restaurantsDesc: string
    suggestions: string; suggestionsDesc: string
  }
  goodToKnow: {
    checkIn: { title: string; text: string }
    checkOut: { title: string; text: string }
    access: { title: string; text: string }
    parking: { title: string; text: string }
    distances: { title: string }
  }
  breakfast: {
    title: string; subtitle: string
    disabled: string
    noDates: string; noDatesHint: string
    step1: string; selectAll: string; clearAll: string
    selectedSingular: string; selectedPlural: string
    step2: string; countHint: string; countHintGuests: string
    step3: string
    step4: string; step4Hint: string; vegetarian: string; glutenFree: string
    step5: string; phoneLabel: string; phonePlaceholder: string; notesLabel: string; notesPlaceholder: string
    summaryTitle: string; summaryDates: string; summarySlot: string; summaryCount: string
    summaryVegetarian: string; summaryGlutenFree: string; summaryPrice: string; summaryDays: string; summaryTotal: string
    summaryNote: string
    errorNoDate: string; submitLoading: string; submitNoDates: string; submitPay: string
    ordersTitle: string
    statusTitle: string; statusLoading: string; statusBack: string
    statusOk: string; statusProcessing: string; statusFailed: string; statusRefunded: string
    paymentTitle: string
    statuses: {
      pending_payment: string; paid: string; sent_to_partner: string
      confirmed_by_partner: string; rejected_by_partner: string
      cancelled: string; payment_failed: string; refunded: string
    }
  }
}

export const ui: Record<Locale, UI> = {
  en: {
    nav: { home: 'Home', howToUse: 'How to use', faq: 'FAQ', restaurants: 'Restaurants', suggestions: 'Experiences', breakfast: 'Breakfast' },
    hero: {
      kicker: 'Maple & Pine · Bled',
      welcome: 'Welcome,',
      guestSingular: 'guest',
      guestPlural: 'guests',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      directions: 'Directions',
      callUs: 'Call us',
    },
    pin: {
      kicker: 'Your access PIN',
      reveal: 'Reveal PIN',
      hide: 'Hide PIN',
      pending: 'Your PIN is being set up. You\'ll receive an email as soon as it\'s ready.',
    },
    parking: {
      kicker: 'Parking',
      text: 'Parking is available in the first two spots on the left side of the driveway, next to the electric charging station.',
    },
    rules: {
      kicker: 'Good to know',
      items: [
        'No smoking inside the apartment.',
        'Please separate waste and flush toilet paper only.',
        'Please do not feed the horses — unsuitable food can harm them.',
        'Do not lean on or climb the upper-floor fence.',
        'The horse fence is electrified.',
        'Tap water is safe to drink.',
      ],
    },
    weather: { kicker: 'Weather · Bled' },
    news: { kicker: 'News' },
    access: {
      expiredTitle: 'Thank you for staying with us!',
      expiredMessage: 'We hope you had a wonderful stay. Access to this guest portal has now ended.',
      notFoundTitle: 'Access not found',
      notFoundMessage: 'This link is invalid or has expired.',
    },
    adventure: { title: 'Things to do around Bled', desc: 'A few practical ideas for lake views, short walks, day trips and local experiences during your stay.', cta: 'Explore ideas' },
    pages: {
      howTo: { kicker: 'Guest guide', title: 'How to use the apartment', pdfLabel: 'Open PDF manual' },
      faq: { kicker: 'Guest guide', title: 'Frequently asked questions' },
      goodToKnow: { kicker: 'Guest guide', title: 'Good to know' },
      restaurants: { kicker: 'Guest guide', title: 'Restaurant recommendations' },
      suggestions: { kicker: 'Guest guide', title: 'Experiences around Bled' },
    },
    related: {
      howToUse: 'How to use', howToUseDesc: 'Clear notes for the apartment features.',
      faq: 'FAQ', faqDesc: 'Groceries, transport and practical questions.',
      goodToKnow: 'Good to know', goodToKnowDesc: 'Parking, distances and useful local notes.',
      restaurants: 'Restaurants', restaurantsDesc: 'Places we are happy to recommend in Bled.',
      suggestions: 'Experiences', suggestionsDesc: 'Ideas for your time in and around Bled.',
    },
    goodToKnow: {
      checkIn: { title: 'Check-in', text: 'From 3:00 pm, unless agreed otherwise.' },
      checkOut: { title: 'Check-out', text: 'By 11:00 am, unless agreed otherwise.' },
      access: { title: 'Access', text: 'Self check-in with the door code sent before arrival.' },
      parking: { title: 'Parking', text: 'Free private parking in front of the apartment.' },
      distances: { title: 'Distances' },
    },
    breakfast: {
      title: 'Order breakfast', subtitle: 'Breakfast is delivered to your apartment. Bled Breakfast handles the order, and it is sent to the partner after payment is completed.',
      disabled: 'Breakfast ordering is currently unavailable. Please try again later.',
      noDates: 'No dates are available for breakfast ordering during your stay.',
      noDatesHint: 'Please order by {hour}:00 for delivery the next day.',
      step1: 'Select delivery dates', selectAll: 'Select all', clearAll: 'Clear',
      selectedSingular: 'Selected: {n} day', selectedPlural: 'Selected: {n} days',
      step2: 'Number of breakfasts per day', countHint: 'Min {min}, max {max}', countHintGuests: 'Min {min}, max {max} (based on guest count)',
      step3: 'Delivery time slot',
      step4: 'Special options', step4Hint: 'Special options must be ordered in even numbers and cannot exceed the total number of breakfasts.', vegetarian: '🌿 Vegetarian', glutenFree: '🌾 Gluten-free',
      step5: 'Contact & notes', phoneLabel: 'Phone number (optional)', phonePlaceholder: '+386 40 123 456', notesLabel: 'Notes (allergies, special requests…)', notesPlaceholder: 'E.g. egg allergy…',
      summaryTitle: 'Order summary', summaryDates: 'Delivery dates', summarySlot: 'Time slot', summaryCount: 'Breakfasts per day',
      summaryVegetarian: 'Vegetarian', summaryGlutenFree: 'Gluten-free', summaryPrice: 'Price per breakfast', summaryDays: 'Number of days', summaryTotal: 'Total',
      summaryNote: 'After payment, the order is sent to Bled Breakfast. Confirmation is handled separately. If the order cannot be accepted, your payment will be refunded.',
      errorNoDate: 'Please select at least one date.', submitLoading: 'Preparing payment…', submitNoDates: 'Select dates', submitPay: 'Pay {price} EUR',
      ordersTitle: 'Your orders',
      statusTitle: 'Order status', statusLoading: 'Loading order status…', statusBack: 'Back to ordering',
      statusOk: 'Your order has been received and sent to Bled Breakfast. You will receive confirmation separately. If the order cannot be accepted, the payment will be refunded.',
      statusProcessing: 'Payment is still processing… Please refresh again in a moment.',
      statusFailed: 'Payment failed. The order was not placed.',
      statusRefunded: 'The order was cancelled. The payment has been refunded.',
      paymentTitle: 'Payment',
      statuses: {
        pending_payment: 'Awaiting payment', paid: 'Paid', sent_to_partner: 'Sent to partner',
        confirmed_by_partner: 'Confirmed', rejected_by_partner: 'Rejected',
        cancelled: 'Cancelled', payment_failed: 'Payment failed', refunded: 'Refunded',
      },
    },
  },
  sl: {
    nav: { home: 'Domov', howToUse: 'Navodila', faq: 'FAQ', restaurants: 'Restavracije', suggestions: 'Doživetja', breakfast: 'Zajtrk' },
    hero: {
      kicker: 'Maple & Pine · Bled',
      welcome: 'Dobrodošli,',
      guestSingular: 'gost',
      guestPlural: 'gostje',
      checkIn: 'Prijava',
      checkOut: 'Odjava',
      directions: 'Navigacija',
      callUs: 'Pokliči nas',
    },
    pin: {
      kicker: 'Vaša PIN koda za dostop',
      reveal: 'Pokaži PIN',
      hide: 'Skrij PIN',
      pending: 'Vaša PIN koda je v izdelavi. Ko bo pripravljena, boste prejeli e-pošto.',
    },
    parking: {
      kicker: 'Parkiranje',
      text: 'Parkiranje je možno na prvih dveh mestih na levi strani dovoza ob električni polnilnici.',
    },
    rules: {
      kicker: 'Dobro je vedeti',
      items: [
        'Kajenje v apartmaju ni dovoljeno.',
        'Prosimo, ločujte odpadke in splakujte samo toaletni papir.',
        'Prosimo, ne hranite konj — neprimerna hrana jim lahko škodi.',
        'Ne naslanjajte se na ograjo zgornjega nadstropja in ne plezajte nanjo.',
        'Konjska ograja je elektrificirana.',
        'Voda iz pipe je primerna za pitje.',
      ],
    },
    weather: { kicker: 'Vreme · Bled' },
    news: { kicker: 'Novice' },
    access: {
      expiredTitle: 'Hvala za vaš obisk!',
      expiredMessage: 'Upamo, da je bilo vaše bivanje prijetno. Dostop do gostovega portala je zaključen.',
      notFoundTitle: 'Dostop ni najden',
      notFoundMessage: 'Ta povezava ni veljavna ali je potekla.',
    },
    adventure: { title: 'Kaj početi v okolici Bleda', desc: 'Nekaj uporabnih idej za razglede, sprehode, izlete in lokalna doživetja med vašim bivanjem.', cta: 'Razišči ideje' },
    pages: {
      howTo: { kicker: 'Vodič za gosta', title: 'Navodila za uporabo apartmaja', pdfLabel: 'Odpri PDF navodila' },
      faq: { kicker: 'Vodič za gosta', title: 'Pogosta vprašanja' },
      goodToKnow: { kicker: 'Vodič za gosta', title: 'Koristne informacije' },
      restaurants: { kicker: 'Vodič za gosta', title: 'Priporočene restavracije' },
      suggestions: { kicker: 'Vodič za gosta', title: 'Doživetja okoli Bleda' },
    },
    related: {
      howToUse: 'Navodila', howToUseDesc: 'Jasna navodila za opremo v apartmaju.',
      faq: 'FAQ', faqDesc: 'Trgovine, prevoz in praktična vprašanja.',
      goodToKnow: 'Koristne info', goodToKnowDesc: 'Parkiranje, razdalje in uporabni lokalni napotki.',
      restaurants: 'Restavracije', restaurantsDesc: 'Restavracije v Bledu, ki jih z veseljem priporočamo.',
      suggestions: 'Doživetja', suggestionsDesc: 'Ideje za čas v Bledu in okolici.',
    },
    goodToKnow: {
      checkIn: { title: 'Prijava', text: 'Od 15:00, razen če ni dogovorjeno drugače.' },
      checkOut: { title: 'Odjava', text: 'Do 11:00, razen če ni dogovorjeno drugače.' },
      access: { title: 'Dostop', text: 'Samostojna prijava s kodo za vrata, ki jo prejmete pred prihodom.' },
      parking: { title: 'Parkiranje', text: 'Zasebno brezplačno parkiranje pred apartmajem.' },
      distances: { title: 'Razdalje' },
    },
    breakfast: {
      title: 'Naroči zajtrk', subtitle: 'Zajtrk vam dostavijo v apartma. Naročilo ureja Bled Breakfast in ga po uspešnem plačilu posreduje partnerju.',
      disabled: 'Naročanje zajtrkov trenutno ni na voljo. Poskusite kasneje.',
      noDates: 'Za vaše bivanje ni na voljo datumov za naročanje zajtrka.',
      noDatesHint: 'Za dostavo naslednji dan naročite do {hour}:00.',
      step1: 'Izbira datumov dostave', selectAll: 'Izberi vse', clearAll: 'Počisti',
      selectedSingular: 'Izbran: {n} dan', selectedPlural: 'Izbrano: {n} dni',
      step2: 'Število zajtrkov na dan', countHint: 'Min {min}, max {max}', countHintGuests: 'Min {min}, max {max} (glede na število gostov)',
      step3: 'Termin dostave',
      step4: 'Posebne možnosti', step4Hint: 'Posebne možnosti morajo biti naročene v sodem številu in ne smejo presegati skupnega števila zajtrkov.', vegetarian: '🌿 Vegetarijanski', glutenFree: '🌾 Brez glutena',
      step5: 'Kontakt in opombe', phoneLabel: 'Telefonska številka (neobvezno)', phonePlaceholder: '+386 40 123 456', notesLabel: 'Opombe (alergije, posebne želje…)', notesPlaceholder: 'Npr. alergija na jajca…',
      summaryTitle: 'Povzetek naročila', summaryDates: 'Datumi dostave', summarySlot: 'Termin', summaryCount: 'Zajtrki na dan',
      summaryVegetarian: 'Vegetarijanski', summaryGlutenFree: 'Brez glutena', summaryPrice: 'Cena na zajtrk', summaryDays: 'Število dni', summaryTotal: 'Skupaj',
      summaryNote: 'Po plačilu bo naročilo posredovano Bled Breakfast. Potrditev prejmete ločeno. Če naročila ni mogoče sprejeti, bo plačilo vrnjeno.',
      errorNoDate: 'Izberite vsaj en datum.', submitLoading: 'Pripravljam plačilo…', submitNoDates: 'Izberite datume', submitPay: 'Plačaj {price} EUR',
      ordersTitle: 'Vaša naročila',
      statusTitle: 'Status naročila', statusLoading: 'Nalagam status naročila…', statusBack: 'Nazaj na naročilo',
      statusOk: 'Naročilo je bilo prejeto in poslano Bled Breakfast. Potrditev boste prejeli ločeno. Če naročila ni mogoče sprejeti, bo plačilo vrnjeno.',
      statusProcessing: 'Plačilo je še v obdelavi… Prosimo, osvežite stran čez trenutek.',
      statusFailed: 'Plačilo ni uspelo. Naročilo ni bilo oddano.',
      statusRefunded: 'Naročilo je bilo preklicano. Plačilo je vrnjeno.',
      paymentTitle: 'Plačilo',
      statuses: {
        pending_payment: 'Čaka plačilo', paid: 'Plačano', sent_to_partner: 'Poslano partnerju',
        confirmed_by_partner: 'Potrjeno', rejected_by_partner: 'Zavrnjeno',
        cancelled: 'Preklicano', payment_failed: 'Plačilo neuspešno', refunded: 'Vračilo opravljeno',
      },
    },
  },
  de: {
    nav: { home: 'Start', howToUse: 'Anleitung', faq: 'FAQ', restaurants: 'Restaurants', suggestions: 'Erlebnisse', breakfast: 'Frühstück' },
    hero: {
      kicker: 'Maple & Pine · Bled',
      welcome: 'Willkommen,',
      guestSingular: 'Gast',
      guestPlural: 'Gäste',
      checkIn: 'Anreise',
      checkOut: 'Abreise',
      directions: 'Navigation',
      callUs: 'Anrufen',
    },
    pin: {
      kicker: 'Ihr Zugangscode',
      reveal: 'PIN anzeigen',
      hide: 'PIN verbergen',
      pending: 'Ihr PIN wird gerade eingerichtet. Sobald er bereit ist, erhalten Sie eine E-Mail.',
    },
    parking: {
      kicker: 'Parken',
      text: 'Parkplätze stehen auf den ersten zwei Stellplätzen auf der linken Seite der Einfahrt neben der Ladestation zur Verfügung.',
    },
    rules: {
      kicker: 'Gut zu wissen',
      items: [
        'Rauchen in der Wohnung ist nicht gestattet.',
        'Bitte Abfall trennen und nur Toilettenpapier spülen.',
        'Bitte füttern Sie die Pferde nicht — ungeeignetes Futter kann ihnen schaden.',
        'Bitte nicht auf den Zaun im Obergeschoss lehnen oder ihn besteigen.',
        'Der Pferdezaun ist elektrifiziert.',
        'Leitungswasser ist trinkbar.',
      ],
    },
    weather: { kicker: 'Wetter · Bled' },
    news: { kicker: 'Neuigkeiten' },
    access: {
      expiredTitle: 'Vielen Dank für Ihren Besuch!',
      expiredMessage: 'Wir hoffen, Sie hatten einen schönen Aufenthalt. Der Zugang zu diesem Gästeportal ist nun beendet.',
      notFoundTitle: 'Zugang nicht gefunden',
      notFoundMessage: 'Dieser Link ist ungültig oder abgelaufen.',
    },
    adventure: { title: 'Ideen rund um Bled', desc: 'Praktische Vorschläge für Aussichtspunkte, Spaziergänge, Tagesausflüge und lokale Erlebnisse während Ihres Aufenthalts.', cta: 'Ideen ansehen' },
    pages: {
      howTo: { kicker: 'Gästeleitfaden', title: 'So nutzen Sie die Wohnung', pdfLabel: 'PDF-Anleitung öffnen' },
      faq: { kicker: 'Gästeleitfaden', title: 'Häufig gestellte Fragen' },
      goodToKnow: { kicker: 'Gästeleitfaden', title: 'Gut zu wissen' },
      restaurants: { kicker: 'Gästeleitfaden', title: 'Restaurantempfehlungen' },
      suggestions: { kicker: 'Gästeleitfaden', title: 'Erlebnisse rund um Bled' },
    },
    related: {
      howToUse: 'Anleitung', howToUseDesc: 'Klare Hinweise zur Ausstattung der Wohnung.',
      faq: 'FAQ', faqDesc: 'Einkaufen, Verkehr und praktische Fragen.',
      goodToKnow: 'Gut zu wissen', goodToKnowDesc: 'Parken, Entfernungen und nützliche lokale Hinweise.',
      restaurants: 'Restaurants', restaurantsDesc: 'Restaurants in Bled, die wir gerne empfehlen.',
      suggestions: 'Erlebnisse', suggestionsDesc: 'Ideen für Ihre Zeit in und um Bled.',
    },
    goodToKnow: {
      checkIn: { title: 'Check-in', text: 'Ab 15:00 Uhr, sofern nicht anders vereinbart.' },
      checkOut: { title: 'Check-out', text: 'Bis 11:00 Uhr, sofern nicht anders vereinbart.' },
      access: { title: 'Zugang', text: 'Self-Check-in mit dem Türcode, den Sie vor der Anreise erhalten.' },
      parking: { title: 'Parken', text: 'Kostenloser Privatparkplatz vor der Wohnung.' },
      distances: { title: 'Entfernungen' },
    },
    breakfast: {
      title: 'Frühstück bestellen', subtitle: 'Das Frühstück wird direkt in Ihre Wohnung geliefert. Bled Breakfast bearbeitet die Bestellung und leitet sie nach erfolgreicher Zahlung an den Partner weiter.',
      disabled: 'Die Frühstücksbestellung ist derzeit nicht verfügbar. Bitte versuchen Sie es später.',
      noDates: 'Für Ihren Aufenthalt sind keine Daten für die Frühstücksbestellung verfügbar.',
      noDatesHint: 'Bitte bestellen Sie bis {hour}:00 Uhr für die Lieferung am nächsten Tag.',
      step1: 'Lieferdaten auswählen', selectAll: 'Alle auswählen', clearAll: 'Löschen',
      selectedSingular: 'Ausgewählt: {n} Tag', selectedPlural: 'Ausgewählt: {n} Tage',
      step2: 'Anzahl der Frühstücke pro Tag', countHint: 'Min {min}, max {max}', countHintGuests: 'Min {min}, max {max} (basierend auf Gästezahl)',
      step3: 'Lieferzeit',
      step4: 'Besondere Optionen', step4Hint: 'Besondere Optionen müssen in gerader Anzahl bestellt werden und dürfen die Gesamtzahl der Frühstücke nicht überschreiten.', vegetarian: '🌿 Vegetarisch', glutenFree: '🌾 Glutenfrei',
      step5: 'Kontakt & Hinweise', phoneLabel: 'Telefonnummer (optional)', phonePlaceholder: '+386 40 123 456', notesLabel: 'Hinweise (Allergien, besondere Wünsche…)', notesPlaceholder: 'z. B. Eiallergie…',
      summaryTitle: 'Bestellübersicht', summaryDates: 'Lieferdaten', summarySlot: 'Lieferzeit', summaryCount: 'Frühstücke pro Tag',
      summaryVegetarian: 'Vegetarisch', summaryGlutenFree: 'Glutenfrei', summaryPrice: 'Preis pro Frühstück', summaryDays: 'Anzahl der Tage', summaryTotal: 'Gesamt',
      summaryNote: 'Nach der Zahlung wird die Bestellung an Bled Breakfast gesendet. Die Bestätigung erfolgt separat. Falls die Bestellung nicht angenommen werden kann, wird Ihre Zahlung erstattet.',
      errorNoDate: 'Bitte wählen Sie mindestens ein Datum.', submitLoading: 'Zahlung wird vorbereitet…', submitNoDates: 'Datum auswählen', submitPay: '{price} EUR bezahlen',
      ordersTitle: 'Ihre Bestellungen',
      statusTitle: 'Bestellstatus', statusLoading: 'Bestellstatus wird geladen…', statusBack: 'Zurück zur Bestellung',
      statusOk: 'Ihre Bestellung wurde erhalten und an Bled Breakfast gesendet. Sie erhalten die Bestätigung separat. Falls die Bestellung nicht angenommen werden kann, wird Ihre Zahlung erstattet.',
      statusProcessing: 'Die Zahlung wird noch verarbeitet… Bitte aktualisieren Sie die Seite in einem Moment.',
      statusFailed: 'Zahlung fehlgeschlagen. Die Bestellung wurde nicht aufgegeben.',
      statusRefunded: 'Die Bestellung wurde storniert. Die Zahlung wurde erstattet.',
      paymentTitle: 'Zahlung',
      statuses: {
        pending_payment: 'Zahlung ausstehend', paid: 'Bezahlt', sent_to_partner: 'An Partner gesendet',
        confirmed_by_partner: 'Bestätigt', rejected_by_partner: 'Abgelehnt',
        cancelled: 'Storniert', payment_failed: 'Zahlung fehlgeschlagen', refunded: 'Erstattet',
      },
    },
  },
  hr: {
    nav: { home: 'Početna', howToUse: 'Upute', faq: 'FAQ', restaurants: 'Restorani', suggestions: 'Doživljaji', breakfast: 'Doručak' },
    hero: {
      kicker: 'Maple & Pine · Bled',
      welcome: 'Dobrodošli,',
      guestSingular: 'gost',
      guestPlural: 'gosti',
      checkIn: 'Prijava',
      checkOut: 'Odjava',
      directions: 'Navigacija',
      callUs: 'Nazovite nas',
    },
    pin: {
      kicker: 'Vaš pristupni PIN',
      reveal: 'Prikaži PIN',
      hide: 'Sakrij PIN',
      pending: 'Vaš PIN se priprema. Primit ćete e-mail čim bude spreman.',
    },
    parking: {
      kicker: 'Parkiranje',
      text: 'Parkiranje je moguće na prva dva mjesta na lijevoj strani ulaza, pored električne punionice.',
    },
    rules: {
      kicker: 'Korisno znati',
      items: [
        'Pušenje u apartmanu nije dozvoljeno.',
        'Molimo odvajajte otpad i bacajte samo toaletni papir.',
        'Molimo ne hranite konje — neprikladna hrana može im nauditi.',
        'Ne naslanjajte se na ogradu gornjeg kata niti se penjite na nju.',
        'Ograda za konje je elektrificirana.',
        'Voda iz slavine je sigurna za piće.',
      ],
    },
    weather: { kicker: 'Vrijeme · Bled' },
    news: { kicker: 'Novosti' },
    access: {
      expiredTitle: 'Hvala na posjeti!',
      expiredMessage: 'Nadamo se da ste uživali u boravku. Pristup ovom portalu za gosta je završen.',
      notFoundTitle: 'Pristup nije pronađen',
      notFoundMessage: 'Ova poveznica nije važeća ili je istekla.',
    },
    adventure: { title: 'Što raditi oko Bleda', desc: 'Nekoliko praktičnih ideja za vidikovce, šetnje, izlete i lokalne doživljaje tijekom boravka.', cta: 'Pogledajte ideje' },
    pages: {
      howTo: { kicker: 'Vodič za goste', title: 'Upute za korištenje apartmana', pdfLabel: 'Otvori PDF priručnik' },
      faq: { kicker: 'Vodič za goste', title: 'Često postavljana pitanja' },
      goodToKnow: { kicker: 'Vodič za goste', title: 'Korisne informacije' },
      restaurants: { kicker: 'Vodič za goste', title: 'Preporučeni restorani' },
      suggestions: { kicker: 'Vodič za goste', title: 'Doživljaji oko Bleda' },
    },
    related: {
      howToUse: 'Upute', howToUseDesc: 'Jasne upute za opremu u apartmanu.',
      faq: 'FAQ', faqDesc: 'Trgovine, prijevoz i praktična pitanja.',
      goodToKnow: 'Korisne info', goodToKnowDesc: 'Parkiranje, udaljenosti i korisne lokalne napomene.',
      restaurants: 'Restorani', restaurantsDesc: 'Restorani u Bledu koje rado preporučujemo.',
      suggestions: 'Doživljaji', suggestionsDesc: 'Ideje za vrijeme u Bledu i okolici.',
    },
    goodToKnow: {
      checkIn: { title: 'Prijava', text: 'Od 15:00, osim ako nije drugačije dogovoreno.' },
      checkOut: { title: 'Odjava', text: 'Do 11:00, osim ako nije drugačije dogovoreno.' },
      access: { title: 'Pristup', text: 'Samostalna prijava pomoću koda za vrata koji ćete dobiti prije dolaska.' },
      parking: { title: 'Parkiranje', text: 'Besplatno privatno parkiranje ispred apartmana.' },
      distances: { title: 'Udaljenosti' },
    },
    breakfast: {
      title: 'Naruči doručak', subtitle: 'Doručak se dostavlja izravno u vaš apartman. Narudžbu obrađuje Bled Breakfast i prosljeđuje je partneru nakon uspješne uplate.',
      disabled: 'Naručivanje doručka trenutno nije dostupno. Molimo pokušajte kasnije.',
      noDates: 'Za vaš boravak nema dostupnih datuma za naručivanje doručka.',
      noDatesHint: 'Za dostavu sljedeći dan naručite do {hour}:00.',
      step1: 'Odabir datuma dostave', selectAll: 'Odaberi sve', clearAll: 'Obriši',
      selectedSingular: 'Odabran: {n} dan', selectedPlural: 'Odabrano: {n} dana',
      step2: 'Broj doručaka po danu', countHint: 'Min {min}, max {max}', countHintGuests: 'Min {min}, max {max} (prema broju gostiju)',
      step3: 'Termin dostave',
      step4: 'Posebne opcije', step4Hint: 'Posebne opcije moraju biti naručene u parnom broju i ne smiju premašiti ukupan broj doručaka.', vegetarian: '🌿 Vegetarijansko', glutenFree: '🌾 Bez glutena',
      step5: 'Kontakt i napomene', phoneLabel: 'Broj telefona (neobavezno)', phonePlaceholder: '+386 40 123 456', notesLabel: 'Napomene (alergije, posebne želje…)', notesPlaceholder: 'Npr. alergija na jaja…',
      summaryTitle: 'Sažetak narudžbe', summaryDates: 'Datumi dostave', summarySlot: 'Termin', summaryCount: 'Doručci po danu',
      summaryVegetarian: 'Vegetarijansko', summaryGlutenFree: 'Bez glutena', summaryPrice: 'Cijena po doručku', summaryDays: 'Broj dana', summaryTotal: 'Ukupno',
      summaryNote: 'Nakon uplate narudžba se šalje Bled Breakfastu. Potvrdu ćete dobiti zasebno. Ako narudžbu nije moguće prihvatiti, uplata će biti vraćena.',
      errorNoDate: 'Odaberite barem jedan datum.', submitLoading: 'Pripremam plaćanje…', submitNoDates: 'Odaberite datume', submitPay: 'Plati {price} EUR',
      ordersTitle: 'Vaše narudžbe',
      statusTitle: 'Status narudžbe', statusLoading: 'Učitavam status narudžbe…', statusBack: 'Natrag na naručivanje',
      statusOk: 'Vaša narudžba je primljena i poslana Bled Breakfastu. Potvrdu ćete dobiti zasebno. Ako narudžbu nije moguće prihvatiti, uplata će biti vraćena.',
      statusProcessing: 'Plaćanje je još u obradi… Osvježite stranicu za trenutak.',
      statusFailed: 'Plaćanje nije uspjelo. Narudžba nije predana.',
      statusRefunded: 'Narudžba je otkazana. Uplata je vraćena.',
      paymentTitle: 'Plaćanje',
      statuses: {
        pending_payment: 'Čeka uplatu', paid: 'Plaćeno', sent_to_partner: 'Poslano partneru',
        confirmed_by_partner: 'Potvrđeno', rejected_by_partner: 'Odbijeno',
        cancelled: 'Otkazano', payment_failed: 'Plaćanje nije uspjelo', refunded: 'Povrat izvršen',
      },
    },
  },
  sr: {
    nav: { home: 'Početna', howToUse: 'Uputstva', faq: 'FAQ', restaurants: 'Restorani', suggestions: 'Doživljaji', breakfast: 'Doručak' },
    hero: {
      kicker: 'Maple & Pine · Bled',
      welcome: 'Dobrodošli,',
      guestSingular: 'gost',
      guestPlural: 'gosti',
      checkIn: 'Prijava',
      checkOut: 'Odjava',
      directions: 'Navigacija',
      callUs: 'Pozovite nas',
    },
    pin: {
      kicker: 'Vaš pristupni PIN',
      reveal: 'Prikaži PIN',
      hide: 'Sakrij PIN',
      pending: 'Vaš PIN se podešava. Dobićete e-mail čim bude spreman.',
    },
    parking: {
      kicker: 'Parkiranje',
      text: 'Parkiranje je moguće na prva dva mesta na levoj strani ulaza, pored električne punionice.',
    },
    rules: {
      kicker: 'Korisno znati',
      items: [
        'Pušenje u apartmanu nije dozvoljeno.',
        'Molimo odvajajte otpad i bacajte samo toaletni papir.',
        'Molimo ne hranite konje — neprikladna hrana im može naškoditi.',
        'Ne naslanjajte se na ogradu gornjeg sprata niti se penjite na nju.',
        'Ograda za konje je elektrificirana.',
        'Voda iz slavine je bezbedna za piće.',
      ],
    },
    weather: { kicker: 'Vreme · Bled' },
    news: { kicker: 'Novosti' },
    access: {
      expiredTitle: 'Hvala na poseti!',
      expiredMessage: 'Nadamo se da ste uživali u boravku. Pristup ovom portalu za gosta je završen.',
      notFoundTitle: 'Pristup nije pronađen',
      notFoundMessage: 'Ova veza nije važeća ili je istekla.',
    },
    adventure: { title: 'Šta raditi oko Bleda', desc: 'Nekoliko praktičnih ideja za vidikovce, šetnje, izlete i lokalne doživljaje tokom boravka.', cta: 'Pogledajte ideje' },
    pages: {
      howTo: { kicker: 'Vodič za goste', title: 'Uputstva za korišćenje apartmana', pdfLabel: 'Otvori PDF priručnik' },
      faq: { kicker: 'Vodič za goste', title: 'Često postavljana pitanja' },
      goodToKnow: { kicker: 'Vodič za goste', title: 'Korisne informacije' },
      restaurants: { kicker: 'Vodič za goste', title: 'Preporučeni restorani' },
      suggestions: { kicker: 'Vodič za goste', title: 'Doživljaji oko Bleda' },
    },
    related: {
      howToUse: 'Uputstva', howToUseDesc: 'Jasna uputstva za opremu u apartmanu.',
      faq: 'FAQ', faqDesc: 'Prodavnice, prevoz i praktična pitanja.',
      goodToKnow: 'Korisne info', goodToKnowDesc: 'Parkiranje, udaljenosti i korisne lokalne napomene.',
      restaurants: 'Restorani', restaurantsDesc: 'Restorani u Bledu koje rado preporučujemo.',
      suggestions: 'Doživljaji', suggestionsDesc: 'Ideje za vreme u Bledu i okolini.',
    },
    goodToKnow: {
      checkIn: { title: 'Prijava', text: 'Od 15:00, osim ako nije drugačije dogovoreno.' },
      checkOut: { title: 'Odjava', text: 'Do 11:00, osim ako nije drugačije dogovoreno.' },
      access: { title: 'Pristup', text: 'Samostalna prijava pomoću koda za vrata koji ćete dobiti pre dolaska.' },
      parking: { title: 'Parkiranje', text: 'Besplatno privatno parkiranje ispred apartmana.' },
      distances: { title: 'Udaljenosti' },
    },
    breakfast: {
      title: 'Naruči doručak', subtitle: 'Doručak se dostavlja direktno u vaš apartman. Porudžbinu obrađuje Bled Breakfast i prosleđuje je partneru nakon uspešne uplate.',
      disabled: 'Naručivanje doručka trenutno nije dostupno. Molimo pokušajte kasnije.',
      noDates: 'Za vaš boravak nema dostupnih datuma za naručivanje doručka.',
      noDatesHint: 'Za dostavu sledećeg dana naručite do {hour}:00.',
      step1: 'Odabir datuma dostave', selectAll: 'Odaberi sve', clearAll: 'Obriši',
      selectedSingular: 'Odabran: {n} dan', selectedPlural: 'Odabrano: {n} dana',
      step2: 'Broj doručaka po danu', countHint: 'Min {min}, max {max}', countHintGuests: 'Min {min}, max {max} (prema broju gostiju)',
      step3: 'Termin dostave',
      step4: 'Posebne opcije', step4Hint: 'Posebne opcije moraju biti naručene u parnom broju i ne smeju premašiti ukupan broj doručaka.', vegetarian: '🌿 Vegetarijansko', glutenFree: '🌾 Bez glutena',
      step5: 'Kontakt i napomene', phoneLabel: 'Broj telefona (neobavezno)', phonePlaceholder: '+386 40 123 456', notesLabel: 'Napomene (alergije, posebne želje…)', notesPlaceholder: 'Npr. alergija na jaja…',
      summaryTitle: 'Pregled porudžbine', summaryDates: 'Datumi dostave', summarySlot: 'Termin', summaryCount: 'Doručci po danu',
      summaryVegetarian: 'Vegetarijansko', summaryGlutenFree: 'Bez glutena', summaryPrice: 'Cena po doručku', summaryDays: 'Broj dana', summaryTotal: 'Ukupno',
      summaryNote: 'Nakon uplate porudžbina se šalje Bled Breakfastu. Potvrdu ćete dobiti zasebno. Ako porudžbinu nije moguće prihvatiti, uplata će biti vraćena.',
      errorNoDate: 'Odaberite barem jedan datum.', submitLoading: 'Pripremam plaćanje…', submitNoDates: 'Odaberite datume', submitPay: 'Plati {price} EUR',
      ordersTitle: 'Vaše porudžbine',
      statusTitle: 'Status porudžbine', statusLoading: 'Učitavam status porudžbine…', statusBack: 'Nazad na naručivanje',
      statusOk: 'Vaša porudžbina je primljena i poslata Bled Breakfastu. Potvrdu ćete dobiti zasebno. Ako porudžbinu nije moguće prihvatiti, uplata će biti vraćena.',
      statusProcessing: 'Plaćanje je još u obradi… Osvežite stranicu za trenutak.',
      statusFailed: 'Plaćanje nije uspelo. Porudžbina nije poslata.',
      statusRefunded: 'Porudžbina je otkazana. Uplata je vraćena.',
      paymentTitle: 'Plaćanje',
      statuses: {
        pending_payment: 'Čeka uplatu', paid: 'Plaćeno', sent_to_partner: 'Poslato partneru',
        confirmed_by_partner: 'Potvrđeno', rejected_by_partner: 'Odbijeno',
        cancelled: 'Otkazano', payment_failed: 'Plaćanje nije uspelo', refunded: 'Povrat izvršen',
      },
    },
  },
}

// ─── FAQ content ───────────────────────────────────────────────────────────

export interface FaqItem {
  id: string
  title: string
  description: string
  links?: Array<{ label: string; href: string }>
}

const FAQ_HREFS = {
  breakfast: '/guest/breakfast',
  mercatorSmall: 'https://goo.gl/maps/Sk76eFdxdwDwPFWW9',
  mercator: 'https://goo.gl/maps/z7P9Laq8R9ZtFcc36',
  spar: 'https://goo.gl/maps/YvM5AbGeoeWnqNDy5',
  pathNearest: 'https://goo.gl/maps/eEqwY1ne6pniw2rB6',
  pathAlt: 'https://goo.gl/maps/EZmGyMntWcTCx31d6',
  castle: 'https://goo.gl/maps/SuBNG7hF5tMgexL77',
  outdoor: 'https://outdoor.capital/maple-pine-bled/',
  bakery1: 'https://goo.gl/maps/LHxF5x1CktHACWxp9',
  bakery2: 'https://goo.gl/maps/36eWoM7fLWAqHvGd7',
  train: 'https://www.bled.si/en/information/getting-around-bled/20190920131939/tourist-train/',
  trainStation: 'https://goo.gl/maps/MrymrQrLoYBSzzzM8',
  busAp: 'https://www.ap-ljubljana.si/',
  railwayBledJezero: 'https://goo.gl/maps/vWPYX1CBgq1ZfND3A',
  railwayLesce: 'https://goo.gl/maps/a553P2DtEtb3aEvQA',
  railwaySZ: 'https://potniski.sz.si/',
  taxi: 'https://bledtransfers.si/',
  bikeRental: 'https://www.bled.si/en/information/getting-around-bled/2019100917061847/bike-and-ebike-rental/',
  ebike: 'https://www.ab-bike.si/en',
  gettingAround: 'https://www.bled.si/en/information/getting-around-bled/',
}

export const faqContent: Record<Locale, FaqItem[]> = {
  en: [
    { id: 'breakfast', title: 'Breakfast delivery', description: 'You can order a Bled Breakfast Basket for delivery to the apartment. It usually includes local bread and pastries, milk, yoghurt, butter, cheese, free-range eggs, homemade salami, honey, jam, seasonal fruit, granola and apple juice.', links: [{ label: 'Order breakfast', href: FAQ_HREFS.breakfast }] },
    { id: 'groceries', title: 'Groceries nearby', description: 'On the way to the lake you will find a smaller Mercator shop for quick essentials. Two larger grocery stores, Mercator and Spar, are also nearby.', links: [{ label: 'Small Mercator', href: FAQ_HREFS.mercatorSmall }, { label: 'Mercator', href: FAQ_HREFS.mercator }, { label: 'Spar', href: FAQ_HREFS.spar }] },
    { id: 'to-the-lake', title: 'Nearest path to Lake Bled', description: 'The shortest path to the lake is about 800 metres. It starts along a local road without a pavement, so take a little care at the beginning. It is a commonly used route.', links: [{ label: 'Nearest path', href: FAQ_HREFS.pathNearest }, { label: 'Alternative quieter route', href: FAQ_HREFS.pathAlt }] },
    { id: 'bled-castle', title: 'Path to Bled Castle', description: 'You can walk from the apartment to Bled Castle in about 15 minutes. The route includes stairs, so it is worth planning ahead if you have a stroller.', links: [{ label: 'Path to the castle', href: FAQ_HREFS.castle }] },
    { id: 'sport', title: 'Outdoor activities', description: 'For hiking, cycling, water activities and guided trips around Bled or elsewhere in Slovenia, OUTdoor Capital is a useful starting point.', links: [{ label: 'Explore activities', href: FAQ_HREFS.outdoor }] },
    { id: 'bakeries', title: 'Bakeries', description: 'There are two bakeries close to the apartment. The map links are useful for opening hours and Sunday availability.', links: [{ label: 'Bakery Hitri kruhek', href: FAQ_HREFS.bakery1 }, { label: 'Bakery Planika', href: FAQ_HREFS.bakery2 }] },
    { id: 'tourist-train', title: 'Tourist train around the lake', description: 'The tourist train circles Lake Bled. The nearest stop for you is Zdraviliški park.', links: [{ label: 'Tourist train timetable', href: FAQ_HREFS.train }, { label: 'Nearest station', href: FAQ_HREFS.trainStation }] },
    { id: 'buses', title: 'Buses', description: 'There is a nearby bus stop for local and regional transport. For departures and current timetables, please check the official Ljubljana bus station website.', links: [{ label: 'Bus timetable', href: FAQ_HREFS.busAp }] },
    { id: 'railway', title: 'Trains', description: 'Bled Jezero station is convenient for trips toward Bohinjska Bistrica, Most na Soči and Nova Gorica. If you are travelling toward Ljubljana or other major destinations, Lesce-Bled station is usually the more practical choice.', links: [{ label: 'Slovenian railways', href: FAQ_HREFS.railwaySZ }, { label: 'Bled Jezero station', href: FAQ_HREFS.railwayBledJezero }, { label: 'Lesce-Bled station', href: FAQ_HREFS.railwayLesce }] },
    { id: 'taxi', title: 'Taxi & transfers', description: 'For airport transfers or longer trips in the region, we recommend Bled Transfers. Private transfers can be booked in advance through their website.', links: [{ label: 'Bled Transfers', href: FAQ_HREFS.taxi }] },
    { id: 'bicycle', title: 'Rent a bike', description: 'Bled has several bike rental options. The official Bled website keeps an updated overview of standard bicycle rental providers.', links: [{ label: 'Bike rental options', href: FAQ_HREFS.bikeRental }] },
    { id: 'ebike', title: 'Rent an eBike', description: 'For eBike rental or organised eBike tours, we recommend checking local providers. You can also ask whether delivery to the apartment and later pick-up are available.', links: [{ label: 'eBike rental', href: FAQ_HREFS.ebike }] },
    { id: 'getting-around', title: 'Getting around Bled', description: 'Bled is easy to explore on foot, by bike, by bus, by taxi or by the traditional Pletna boat. The official Bled website has a good overview of transport options and practical tips for moving around the area.', links: [{ label: 'Getting around Bled', href: FAQ_HREFS.gettingAround }] },
  ],
  sl: [
    { id: 'breakfast', title: 'Dostava zajtrka', description: 'Naročite lahko Bled Breakfast Basket z dostavo v apartma. Običajno vključuje lokalni kruh in pecivo, mleko, jogurt, maslo, sir, jajca s proste reje, domačo salamo, med, marmelado, sezonsko sadje, granolo in jabolčni sok.', links: [{ label: 'Naroči zajtrk', href: FAQ_HREFS.breakfast }] },
    { id: 'groceries', title: 'Bližnje trgovine', description: 'Na poti do jezera je manjša trgovina Mercator za hiter nakup osnovnih stvari. V bližini sta tudi večji trgovini Mercator in Spar.', links: [{ label: 'Mali Mercator', href: FAQ_HREFS.mercatorSmall }, { label: 'Mercator', href: FAQ_HREFS.mercator }, { label: 'Spar', href: FAQ_HREFS.spar }] },
    { id: 'to-the-lake', title: 'Najkrajša pot do Blejskega jezera', description: 'Najkrajša pot do jezera je dolga približno 800 metrov. Začne se po lokalni cesti brez pločnika, zato bodite na začetku nekoliko previdni. Pot domačini in gostje pogosto uporabljajo.', links: [{ label: 'Najkrajša pot', href: FAQ_HREFS.pathNearest }, { label: 'Mirnejša alternativa', href: FAQ_HREFS.pathAlt }] },
    { id: 'bled-castle', title: 'Pot do Blejskega gradu', description: 'Do Blejskega gradu lahko iz apartmaja pridete peš v približno 15 minutah. Pot vključuje stopnice, zato je pri otroškem vozičku dobro pot načrtovati vnaprej.', links: [{ label: 'Pot do gradu', href: FAQ_HREFS.castle }] },
    { id: 'sport', title: 'Aktivnosti na prostem', description: 'Za pohodništvo, kolesarjenje, vodne aktivnosti in vodene izlete na Bledu ali drugod po Sloveniji je OUTdoor Capital uporabno izhodišče.', links: [{ label: 'Oglej si aktivnosti', href: FAQ_HREFS.outdoor }] },
    { id: 'bakeries', title: 'Pekarne', description: 'V bližini apartmaja sta dve pekarni. Na spodnjih povezavah lahko preverite odpiralni čas in ali sta odprti ob nedeljah.', links: [{ label: 'Pekarna Hitri kruhek', href: FAQ_HREFS.bakery1 }, { label: 'Pekarna Planika', href: FAQ_HREFS.bakery2 }] },
    { id: 'tourist-train', title: 'Turistični vlak okoli jezera', description: 'Turistični vlak kroži okoli Blejskega jezera. Najbližja postaja je Zdraviliški park.', links: [{ label: 'Vozni red vlaka', href: FAQ_HREFS.train }, { label: 'Najbližja postaja', href: FAQ_HREFS.trainStation }] },
    { id: 'buses', title: 'Avtobusi', description: 'V bližini je avtobusna postaja za lokalni in medkrajevni promet. Za odhode in aktualne vozne rede preverite uradno spletno stran avtobusne postaje Ljubljana.', links: [{ label: 'Vozni red avtobusov', href: FAQ_HREFS.busAp }] },
    { id: 'railway', title: 'Vlaki', description: 'Postaja Bled Jezero je priročna za potovanja proti Bohinjski Bistrici, Mostu na Soči in Novi Gorici. Za Ljubljana in druge večje destinacije je Lesce-Bled postaja navadno praktičnejša izbira.', links: [{ label: 'Slovenske železnice', href: FAQ_HREFS.railwaySZ }, { label: 'Postaja Bled Jezero', href: FAQ_HREFS.railwayBledJezero }, { label: 'Postaja Lesce-Bled', href: FAQ_HREFS.railwayLesce }] },
    { id: 'taxi', title: 'Taksi in transferji', description: 'Za prevoz z letališča ali daljše vožnje po regiji priporočamo Bled Transfers. Zasebne transferje lahko rezervirate vnaprej na njihovi spletni strani.', links: [{ label: 'Bled Transfers', href: FAQ_HREFS.taxi }] },
    { id: 'bicycle', title: 'Izposoja kolesa', description: 'Bled ima več možnosti izposoje koles. Na uradni spletni strani Bleda najdete aktualen pregled ponudnikov.', links: [{ label: 'Izposoja koles', href: FAQ_HREFS.bikeRental }] },
    { id: 'ebike', title: 'Izposoja e-kolesa', description: 'Za izposojo e-kolesa ali organizirane e-kolesarske ture priporočamo lokalne ponudnike. Vprašajte, ali nudijo dostavo in prevzem pri apartmaju.', links: [{ label: 'Izposoja e-kolesa', href: FAQ_HREFS.ebike }] },
    { id: 'getting-around', title: 'Gibanje po Bledu', description: 'Bled je enostaven za raziskovanje peš, s kolesom, z avtobusom, s taksijem ali s tradicionalno pletno. Na uradni spletni strani Bleda najdete dober pregled prevoznih možnosti in praktičnih nasvetov.', links: [{ label: 'Gibanje po Bledu', href: FAQ_HREFS.gettingAround }] },
  ],
  de: [
    { id: 'breakfast', title: 'Frühstückslieferung', description: 'Bestellen Sie einen Bled Breakfast Basket und lassen Sie ihn direkt in die Wohnung liefern. Er enthält Produkte von lokalen Bauernhöfen und Bäckereien: frisches Brot, Croissants, Milch, Joghurt, Butter, Käse, Freilandeier, hausgemachte Salami, Honig, Marmeladen, saisonale Früchte, Granola und Apfelsaft.', links: [{ label: 'Frühstück bestellen', href: FAQ_HREFS.breakfast }] },
    { id: 'groceries', title: 'Einkaufsmöglichkeiten in der Nähe', description: 'Auf dem Weg zum See finden Sie einen kleineren Mercator-Laden für schnelle Besorgungen. Zwei größere Supermärkte, Mercator und Spar, sind ebenfalls in der Nähe.', links: [{ label: 'Kleiner Mercator', href: FAQ_HREFS.mercatorSmall }, { label: 'Mercator', href: FAQ_HREFS.mercator }, { label: 'Spar', href: FAQ_HREFS.spar }] },
    { id: 'to-the-lake', title: 'Kürzester Weg zum Bleder See', description: 'Der kürzeste Weg zum See ist etwa 800 Meter lang und beginnt auf einer Nebenstraße ohne Gehsteig. Er wirkt anfangs vielleicht ungewöhnlich, wird aber häufig genutzt und ist ungefährlich.', links: [{ label: 'Kürzester Weg', href: FAQ_HREFS.pathNearest }, { label: 'Alternative ruhigere Route', href: FAQ_HREFS.pathAlt }] },
    { id: 'bled-castle', title: 'Weg zur Burg Bled', description: 'Sie können in etwa 15 Minuten zu Fuß direkt von der Wohnung zur Burg Bled gelangen. Der Weg beinhaltet Treppen, daher möchten Familien mit Kleinkind oder Kinderwagen die Route im Voraus planen.', links: [{ label: 'Weg zur Burg', href: FAQ_HREFS.castle }] },
    { id: 'sport', title: 'Sportliche Aktivitäten', description: 'Wenn Sie Outdoor-Aktivitäten in Bled oder anderswo in Slowenien suchen, ist die OUTdoor Capital Website ein guter Ausgangspunkt. Sie finden Ideen für Wandern, Radfahren, Wasseraktivitäten und geführte Abenteuer.', links: [{ label: 'Aktivitäten entdecken', href: FAQ_HREFS.outdoor }] },
    { id: 'bakeries', title: 'Bäckereien', description: 'In der Nähe der Wohnung gibt es zwei Bäckereien. Über die Kartenlinks unten können Sie auch die Öffnungszeiten und die Sonntagsöffnung prüfen.', links: [{ label: 'Bäckerei Hitri kruhek', href: FAQ_HREFS.bakery1 }, { label: 'Bäckerei Planika', href: FAQ_HREFS.bakery2 }] },
    { id: 'tourist-train', title: 'Touristenzug um den See', description: 'Der Touristenzug fährt um den Bleder See. Die nächste Haltestelle für Sie ist Zdraviliški park.', links: [{ label: 'Fahrplan Touristenzug', href: FAQ_HREFS.train }, { label: 'Nächste Haltestelle', href: FAQ_HREFS.trainStation }] },
    { id: 'buses', title: 'Busse', description: 'In der Nähe gibt es eine Bushaltestelle für lokalen und regionalen Verkehr. Abfahrten und aktuelle Fahrpläne finden Sie auf der offiziellen Website des Busbahnhofs Ljubljana.', links: [{ label: 'Busfahrplan', href: FAQ_HREFS.busAp }] },
    { id: 'railway', title: 'Züge', description: 'Der Bahnhof Bled Jezero eignet sich für Fahrten nach Bohinjska Bistrica, Most na Soči und Nova Gorica. Für Ljubljana und andere größere Ziele ist der Bahnhof Lesce-Bled meist praktischer.', links: [{ label: 'Slowenische Bahn', href: FAQ_HREFS.railwaySZ }, { label: 'Bhf. Bled Jezero', href: FAQ_HREFS.railwayBledJezero }, { label: 'Bhf. Lesce-Bled', href: FAQ_HREFS.railwayLesce }] },
    { id: 'taxi', title: 'Taxi & Transfers', description: 'Für komfortable Transfers zum Flughafen Ljubljana oder andere Ziele in der Region empfehlen wir Bled Transfers. Sie bieten Privattransfers mit Vorabreservierung an.', links: [{ label: 'Bled Transfers', href: FAQ_HREFS.taxi }] },
    { id: 'bicycle', title: 'Fahrrad mieten', description: 'Bled bietet mehrere Fahrradverleihoptionen. Die offizielle Bled-Website führt eine aktuelle Übersicht der Anbieter.', links: [{ label: 'Fahrradverleih', href: FAQ_HREFS.bikeRental }] },
    { id: 'ebike', title: 'E-Bike mieten', description: 'Für E-Bike-Verleih oder geführte E-Bike-Touren empfehlen wir lokale Anbieter. Fragen Sie, ob Lieferung zur Wohnung und spätere Abholung möglich sind.', links: [{ label: 'E-Bike-Verleih', href: FAQ_HREFS.ebike }] },
    { id: 'getting-around', title: 'Fortbewegung in Bled', description: 'Bled lässt sich leicht zu Fuß, mit dem Fahrrad, dem Bus, dem Taxi oder dem traditionellen Pletna-Boot erkunden. Die offizielle Bled-Website bietet einen guten Überblick über Transportmöglichkeiten.', links: [{ label: 'Fortbewegung in Bled', href: FAQ_HREFS.gettingAround }] },
  ],
  hr: [
    { id: 'breakfast', title: 'Dostava doručka', description: 'Naručite Bled Breakfast Basket i primite ga direktno u apartman. Uključuje proizvode s lokalnih farmi i pekara: svježi kruh, kroasane, mlijeko, jogurte, maslac, sir, jaja iz slobodnog uzgoja, domaću salamu, med, džemove, sezonsko voće, granolu i sok od jabuke.', links: [{ label: 'Naruči doručak', href: FAQ_HREFS.breakfast }] },
    { id: 'groceries', title: 'Obližnje trgovine', description: 'Na putu prema jezeru naći ćete manji Mercator za brzu kupovinu. Dva veća supermarketa, Mercator i Spar, također su u blizini.', links: [{ label: 'Mali Mercator', href: FAQ_HREFS.mercatorSmall }, { label: 'Mercator', href: FAQ_HREFS.mercator }, { label: 'Spar', href: FAQ_HREFS.spar }] },
    { id: 'to-the-lake', title: 'Najbliži put do Blejskog jezera', description: 'Najkraći put do jezera dugačak je oko 800 metara i počinje lokalnom cestom bez pločnika. Isprva može izgledati neobično, ali se često koristi i nije opasan.', links: [{ label: 'Najbliži put', href: FAQ_HREFS.pathNearest }, { label: 'Alternativna tiša ruta', href: FAQ_HREFS.pathAlt }] },
    { id: 'bled-castle', title: 'Put do Blejskog dvorca', description: 'Do Blejskog dvorca možete hodati pješice izravno iz apartmana za oko 15 minuta. Ruta uključuje stepenice, pa obitelji s bebom ili kolicima možda žele unaprijed planirati put.', links: [{ label: 'Put do dvorca', href: FAQ_HREFS.castle }] },
    { id: 'sport', title: 'Sportske aktivnosti', description: 'Ako tražite aktivnosti u prirodi u Bledu ili drugdje u Sloveniji, web stranica OUTdoor Capital odlično je polazište. Naći ćete ideje za planinarenje, biciklizam, vodene aktivnosti i vođene avanture.', links: [{ label: 'Istraži aktivnosti', href: FAQ_HREFS.outdoor }] },
    { id: 'bakeries', title: 'Pekare', description: 'U blizini apartmana nalaze se dvije pekare. Na linkovima ispod možete provjeriti radno vrijeme i jesu li otvorene nedjeljom.', links: [{ label: 'Pekara Hitri kruhek', href: FAQ_HREFS.bakery1 }, { label: 'Pekara Planika', href: FAQ_HREFS.bakery2 }] },
    { id: 'tourist-train', title: 'Turistički vlak oko jezera', description: 'Turistički vlak kruži oko Blejskog jezera. Najbliža postaja za vas je Zdraviliški park.', links: [{ label: 'Red vožnje vlaka', href: FAQ_HREFS.train }, { label: 'Najbliža stanica', href: FAQ_HREFS.trainStation }] },
    { id: 'buses', title: 'Autobusi', description: 'U blizini se nalazi autobusna stanica za lokalni i regionalni prijevoz. Odlaske i aktualne vozne redove provjerite na službenoj stranici autobusnog kolodvora Ljubljana.', links: [{ label: 'Red vožnje autobusa', href: FAQ_HREFS.busAp }] },
    { id: 'railway', title: 'Vlakovi', description: 'Postaja Bled Jezero pogodna je za putovanja prema Bohinjskoj Bistrici, Mostu na Soči i Novoj Gorici. Za Ljubljana i druge veće destinacije, postaja Lesce-Bled obično je praktičniji izbor.', links: [{ label: 'Slovenačke željeznice', href: FAQ_HREFS.railwaySZ }, { label: 'Postaja Bled Jezero', href: FAQ_HREFS.railwayBledJezero }, { label: 'Postaja Lesce-Bled', href: FAQ_HREFS.railwayLesce }] },
    { id: 'taxi', title: 'Taxi i transferi', description: 'Za udobne transfere do aerodroma Ljubljana ili bilo gdje u regiji preporučujemo Bled Transfers. Nude privatne transfere s prethodnom rezervacijom.', links: [{ label: 'Bled Transfers', href: FAQ_HREFS.taxi }] },
    { id: 'bicycle', title: 'Iznajmljivanje bicikla', description: 'Bled ima nekoliko opcija iznajmljivanja bicikala. Službena web stranica Bleda održava ažurirani pregled pružatelja usluga.', links: [{ label: 'Iznajmljivanje bicikla', href: FAQ_HREFS.bikeRental }] },
    { id: 'ebike', title: 'Iznajmljivanje e-bicikla', description: 'Za iznajmljivanje e-bicikla ili organizirane e-biciklističke ture preporučujemo lokalne pružatelje usluga. Možete pitati je li dostupna dostava do apartmana i kasniji preuzim.', links: [{ label: 'Iznajmljivanje e-bicikla', href: FAQ_HREFS.ebike }] },
    { id: 'getting-around', title: 'Kretanje po Bledu', description: 'Bled je lako istraživati pješice, biciklom, autobusom, taksijem ili tradicionalnim čamcem Pletna. Službena web stranica Bleda nudi dobar pregled prijevoznih opcija i praktičnih savjeta.', links: [{ label: 'Kretanje po Bledu', href: FAQ_HREFS.gettingAround }] },
  ],
  sr: [
    { id: 'breakfast', title: 'Dostava doručka', description: 'Naručite Bled Breakfast Basket i primite ga direktno u apartman. Uključuje proizvode sa lokalnih farmi i pekara: svež hleb, kroasane, mleko, jogurte, puter, sir, jaja iz slobodnog uzgoja, domaću salamu, med, džemove, sezonsko voće, granolu i sok od jabuke.', links: [{ label: 'Naruči doručak', href: FAQ_HREFS.breakfast }] },
    { id: 'groceries', title: 'Obližnje prodavnice', description: 'Na putu prema jezeru naći ćete manji Mercator za brzu kupovinu. Dva veća supermarketa, Mercator i Spar, takođe su u blizini.', links: [{ label: 'Mali Mercator', href: FAQ_HREFS.mercatorSmall }, { label: 'Mercator', href: FAQ_HREFS.mercator }, { label: 'Spar', href: FAQ_HREFS.spar }] },
    { id: 'to-the-lake', title: 'Najbliži put do Blejskog jezera', description: 'Najkraći put do jezera dugačak je oko 800 metara i počinje lokalnim putem bez trotoara. Isprva može izgledati neobično, ali se često koristi i nije opasan.', links: [{ label: 'Najbliži put', href: FAQ_HREFS.pathNearest }, { label: 'Alternativna tiša ruta', href: FAQ_HREFS.pathAlt }] },
    { id: 'bled-castle', title: 'Put do Blejskog dvorca', description: 'Do Blejskog dvorca možete hodati pešice direktno iz apartmana za oko 15 minuta. Ruta uključuje stepenice, pa porodice sa bebom ili kolicima možda žele unapred planirati put.', links: [{ label: 'Put do dvorca', href: FAQ_HREFS.castle }] },
    { id: 'sport', title: 'Sportske aktivnosti', description: 'Ako tražite aktivnosti u prirodi u Bledu ili drugde u Sloveniji, sajt OUTdoor Capital je odlično polazište. Naći ćete ideje za planinarenje, biciklizam, vodene aktivnosti i vođene avanture.', links: [{ label: 'Istraži aktivnosti', href: FAQ_HREFS.outdoor }] },
    { id: 'bakeries', title: 'Pekare', description: 'U blizini apartmana nalaze se dve pekare. Na linkovima ispod možete proveriti radno vreme i da li su otvorene nedeljom.', links: [{ label: 'Pekara Hitri kruhek', href: FAQ_HREFS.bakery1 }, { label: 'Pekara Planika', href: FAQ_HREFS.bakery2 }] },
    { id: 'tourist-train', title: 'Turistički voz oko jezera', description: 'Turistički voz kruži oko Blejskog jezera. Najbliža stanica za vas je Zdraviliški park.', links: [{ label: 'Red vožnje voza', href: FAQ_HREFS.train }, { label: 'Najbliža stanica', href: FAQ_HREFS.trainStation }] },
    { id: 'buses', title: 'Autobusi', description: 'U blizini se nalazi autobuska stanica za lokalni i regionalni prevoz. Polaske i aktuelne vozne redove proverite na zvaničnom sajtu autobuske stanice Ljubljana.', links: [{ label: 'Red vožnje autobusa', href: FAQ_HREFS.busAp }] },
    { id: 'railway', title: 'Vozovi', description: 'Stanica Bled Jezero pogodna je za putovanja prema Bohinjskoj Bistrici, Mostu na Soči i Novoj Gorici. Za Ljubljanu i druge veće destinacije, stanica Lesce-Bled obično je praktičniji izbor.', links: [{ label: 'Slovenačke železnice', href: FAQ_HREFS.railwaySZ }, { label: 'Stanica Bled Jezero', href: FAQ_HREFS.railwayBledJezero }, { label: 'Stanica Lesce-Bled', href: FAQ_HREFS.railwayLesce }] },
    { id: 'taxi', title: 'Taxi i transferi', description: 'Za udobne transfere do aerodroma Ljubljana ili bilo gde u regiji preporučujemo Bled Transfers. Nude privatne transfere s prethodnom rezervacijom.', links: [{ label: 'Bled Transfers', href: FAQ_HREFS.taxi }] },
    { id: 'bicycle', title: 'Iznajmljivanje bicikla', description: 'Bled ima nekoliko opcija iznajmljivanja bicikala. Zvanični sajt Bleda održava ažurirani pregled pružaoca usluga.', links: [{ label: 'Iznajmljivanje bicikla', href: FAQ_HREFS.bikeRental }] },
    { id: 'ebike', title: 'Iznajmljivanje e-bicikla', description: 'Za iznajmljivanje e-bicikla ili organizovane e-biciklističke ture preporučujemo lokalne pružaoce usluga. Možete pitati da li je dostupna dostava do apartmana i kasniji preuzet.', links: [{ label: 'Iznajmljivanje e-bicikla', href: FAQ_HREFS.ebike }] },
    { id: 'getting-around', title: 'Kretanje po Bledu', description: 'Bled je lako istraživati pešice, biciklom, autobusom, taksijem ili tradicionalnim čamcem Pletna. Zvanični sajt Bleda nudi dobar pregled prevoznih opcija i praktičnih saveta.', links: [{ label: 'Kretanje po Bledu', href: FAQ_HREFS.gettingAround }] },
  ],
}

// ─── How-to content ────────────────────────────────────────────────────────

export interface HowToItem {
  id: string; title: string; description: string; image?: string
  links?: Array<{ label: string; href: string }>
}

const HOW_TO_IMAGES: Record<string, string> = {
  ac: '/how-to/ac.webp', tv: '/how-to/tv.webp', 'child-safety': '/how-to/kids-safety.webp',
  ventilation: '/how-to/ventilation-control.webp', blinds: '/how-to/blinds-control.webp',
  'roof-window': '/how-to/roof-window.webp', oven: '/how-to/gorenje-h30mobs10hc-oven.jpg',
  'outdoor-lights': '/how-to/outdoor.webp', 'kitchen-lights': '/how-to/kitchen.webp',
  'bathroom-heating': '/how-to/bathroom.webp',
}

export const howToContent: Record<Locale, HowToItem[]> = {
  en: [
    { id: 'ac', title: 'Air conditioning', description: 'On the upper floor there is an air conditioner with a standard remote control. Please adjust it however it suits you best.', image: HOW_TO_IMAGES.ac },
    { id: 'tv', title: 'TV', description: 'The apartment has a TCL 55P69B 4K UHD TV with Google TV. You can use it for regular TV content, streaming apps and casting through Google TV or Chromecast. Use the large remote to switch the HDMI source and the small remote to control the TV.', image: HOW_TO_IMAGES.tv },
    { id: 'child-safety', title: 'Safety gate for kids', description: 'The stairs are protected by a child safety gate. To unlock or lock it, press and twist the button on the holder.', image: HOW_TO_IMAGES['child-safety'] },
    { id: 'ventilation', title: 'Automatic ventilation', description: 'The ventilation controls are located in the lower part of the apartment near the sofa. The right-side control operates ventilation with heat recovery and is the recommended setting for everyday use.', image: HOW_TO_IMAGES.ventilation },
    { id: 'blinds', title: 'Blinds', description: 'Press and hold the up arrow for about a second to raise the blinds and the down arrow to lower them. A short press stops them.', image: HOW_TO_IMAGES.blinds },
    { id: 'roof-window', title: 'Roof window', description: 'Use the arrow buttons to open or close the roof window, and the middle button to stop it at any position. Please do not operate the window manually.', image: HOW_TO_IMAGES['roof-window'] },
    { id: 'oven', title: 'Gorenje combination oven', description: 'The kitchen has a Gorenje H30MOBS10HC combination oven. It can be used as a microwave, convection oven, grill and air-fry oven. Detailed instructions are available in the PDF below.', image: HOW_TO_IMAGES.oven, links: [{ label: 'Open PDF manual', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }] },
    { id: 'family-friendly', title: 'Baby chair', description: 'In the kitchen cabinet under the microwave you will find a child-seat kit that fits the kitchen chair.' },
    { id: 'bed-safety', title: 'Bed safety for kids', description: 'If you need a bed safety rail, it is stored under the first single bed. Lift the mattress and place the rail on the bed where you need it.' },
    { id: 'outdoor-lights', title: 'Outdoor light', description: 'The outdoor light switch is by the entrance. Top position: always on. Middle: off. Bottom: motion sensor.', image: HOW_TO_IMAGES['outdoor-lights'] },
    { id: 'kitchen-lights', title: 'Kitchen light', description: 'Under the kitchen cabinet above the stove there is a blue touch switch. Touch to turn on/off, hold to adjust brightness.', image: HOW_TO_IMAGES['kitchen-lights'] },
    { id: 'bathroom-heating', title: 'Bathroom heating', description: 'By the bathroom entrance there is a switch with a heating icon. Press it to activate additional bathroom heating for about 30 minutes.', image: HOW_TO_IMAGES['bathroom-heating'] },
    { id: 'waste-handling', title: 'Waste handling', description: 'Under the sink you will find separate bins for waste sorting. Outside by the driveway there are collection bins, including a separate glass container.' },
  ],
  sl: [
    { id: 'ac', title: 'Klimatska naprava', description: 'Na zgornjem nadstropju je klimatska naprava s standardnim daljinskim upravljalnikom. Nastavite jo po svojih željah.', image: HOW_TO_IMAGES.ac },
    { id: 'tv', title: 'Televizija', description: 'Apartma ima televizor TCL 55P69B 4K UHD z Google TV. Uporabite ga za redne televizijske kanale, pretočne aplikacije in predvajanje prek Google TV ali Chromecast. Z velikim daljincem preklopite HDMI vir, z malim pa upravljate televizor.', image: HOW_TO_IMAGES.tv },
    { id: 'child-safety', title: 'Varnostna vrata za otroke', description: 'Stopnišče je zaščiteno z varnostnimi vrati za otroke. Za odklepanje ali zaklepanje pritisnite in zavrtite gumb na držalu.', image: HOW_TO_IMAGES['child-safety'] },
    { id: 'ventilation', title: 'Samodejno prezračevanje', description: 'Upravljalnik prezračevanja se nahaja v spodnjem delu apartmaja pri kavču. Desni upravljalnik nadzoruje prezračevanje s toplotnim rekuperatorjem in je priporočena nastavitev za vsakodnevno uporabo.', image: HOW_TO_IMAGES.ventilation },
    { id: 'blinds', title: 'Žaluzije', description: 'Pridržite puščico gor za sekundo, da dvignete žaluzijo, in puščico dol, da jo spustite. Kratki pritisk jo ustavi.', image: HOW_TO_IMAGES.blinds },
    { id: 'roof-window', title: 'Strešno okno', description: 'Z gumbi s puščicami odprite ali zaprite strešno okno, srednji gumb ga ustavi na katerem koli položaju. Prosimo, ne upravljajte okna ročno.', image: HOW_TO_IMAGES['roof-window'] },
    { id: 'oven', title: 'Kombinirana pečica Gorenje', description: 'V kuhinji je kombinirana pečica Gorenje H30MOBS10HC. Deluje kot mikrovalovna, konvekcijska pečica, žar in pečica za airfry. Podrobna navodila so na voljo v PDF-ju spodaj.', image: HOW_TO_IMAGES.oven, links: [{ label: 'Odpri PDF navodila', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }] },
    { id: 'family-friendly', title: 'Otroški stolček', description: 'V kuhinjski omari pod mikrovalovno pečico najdete komplet za otroški sedež, ki se pritrdi na kuhinjski stol.' },
    { id: 'bed-safety', title: 'Varnostna ograja za posteljo', description: 'Če potrebujete varnostno ograjo za posteljo, je shranjena pod prvo enojno posteljo. Dvignite vzmetnico in namestite ograjo tja, kjer jo potrebujete.' },
    { id: 'outdoor-lights', title: 'Zunanja svetilka', description: 'Stikalo za zunanjo svetilko je pri vhodu. Zgoraj: vedno vklopljeno. Na sredini: izklopljeno. Spodaj: senzor gibanja.', image: HOW_TO_IMAGES['outdoor-lights'] },
    { id: 'kitchen-lights', title: 'Kuhinjska svetilka', description: 'Pod kuhinjsko omaro nad štedilnikom je modro tipkalno stikalo. Dotaknite se za vklop/izklop, pridržite za nastavitev svetlosti.', image: HOW_TO_IMAGES['kitchen-lights'] },
    { id: 'bathroom-heating', title: 'Kopalniško ogrevanje', description: 'Pri vhodu v kopalnico je stikalo z ikono ogrevanja. Pritisnite ga za vklop dodatnega kopalničnega ogrevanja za približno 30 minut.', image: HOW_TO_IMAGES['bathroom-heating'] },
    { id: 'waste-handling', title: 'Ločevanje odpadkov', description: 'Pod kopalničkim umivalnikom najdete ločene koše za odpadke. Zunaj pri dovozu so zbiralni kontejnerji, vključno z ločenim za steklo.' },
  ],
  de: [
    { id: 'ac', title: 'Klimaanlage', description: 'Im Obergeschoss befindet sich eine Klimaanlage mit einer Standardfernbedienung. Stellen Sie sie nach Ihren Wünschen ein.', image: HOW_TO_IMAGES.ac },
    { id: 'tv', title: 'Fernseher', description: 'Die Wohnung verfügt über einen TCL 55P69B 4K UHD TV mit Google TV. Nutzen Sie ihn für reguläre TV-Inhalte, Streaming-Apps und Casting über Google TV oder Chromecast. Mit der großen Fernbedienung wechseln Sie den HDMI-Eingang, mit der kleinen steuern Sie den Fernseher.', image: HOW_TO_IMAGES.tv },
    { id: 'child-safety', title: 'Kinderschutzgitter', description: 'Die Treppe ist durch ein Kinderschutzgitter gesichert. Zum Öffnen oder Schließen den Knopf am Halter drücken und drehen.', image: HOW_TO_IMAGES['child-safety'] },
    { id: 'ventilation', title: 'Automatische Lüftung', description: 'Die Lüftungssteuerung befindet sich im unteren Teil der Wohnung beim Sofa. Die rechte Steuerung betreibt die Lüftung mit Wärmerückgewinnung und ist die empfohlene Einstellung für den Alltag.', image: HOW_TO_IMAGES.ventilation },
    { id: 'blinds', title: 'Jalousien', description: 'Pfeil nach oben ca. eine Sekunde gedrückt halten, um die Jalousie hochzufahren, Pfeil nach unten zum Herunterlassen. Ein kurzer Druck stoppt sie.', image: HOW_TO_IMAGES.blinds },
    { id: 'roof-window', title: 'Dachfenster', description: 'Mit den Pfeiltasten das Dachfenster öffnen oder schließen, mit der mittleren Taste an jeder Position stoppen. Bitte das Fenster nicht manuell bedienen.', image: HOW_TO_IMAGES['roof-window'] },
    { id: 'oven', title: 'Gorenje Kombi-Backofen', description: 'In der Küche steht ein Gorenje H30MOBS10HC Kombinationsgerät. Es kann als Mikrowelle, Heißluftbackofen, Grill und Air-Fryer genutzt werden. Eine ausführliche Anleitung steht als PDF bereit.', image: HOW_TO_IMAGES.oven, links: [{ label: 'PDF-Anleitung öffnen', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }] },
    { id: 'family-friendly', title: 'Babystuhl', description: 'Im Küchenschrank unter der Mikrowelle finden Sie ein Kindersitzset, das auf den Küchenstuhl passt.' },
    { id: 'bed-safety', title: 'Bettschutzgitter für Kinder', description: 'Falls Sie ein Bettschutzgitter benötigen, befindet es sich unter dem ersten Einzelbett. Heben Sie die Matratze an und platzieren Sie das Gitter dort, wo Sie es brauchen.' },
    { id: 'outdoor-lights', title: 'Außenbeleuchtung', description: 'Der Schalter für die Außenbeleuchtung befindet sich beim Eingang. Oben: dauerhaft an. Mitte: aus. Unten: Bewegungssensor.', image: HOW_TO_IMAGES['outdoor-lights'] },
    { id: 'kitchen-lights', title: 'Küchenbeleuchtung', description: 'Unter dem Küchenschrank über dem Herd befindet sich ein blauer Touch-Schalter. Antippen zum Ein-/Ausschalten, gedrückt halten zum Dimmen.', image: HOW_TO_IMAGES['kitchen-lights'] },
    { id: 'bathroom-heating', title: 'Badezimmerheizung', description: 'Beim Badezimmereingang gibt es einen Schalter mit einem Heizsymbol. Drücken Sie ihn, um die zusätzliche Badezimmerheizung für ca. 30 Minuten einzuschalten.', image: HOW_TO_IMAGES['bathroom-heating'] },
    { id: 'waste-handling', title: 'Mülltrennung', description: 'Unter dem Waschbecken finden Sie separate Behälter für die Mülltrennung. Draußen an der Einfahrt stehen Sammelcontainer, darunter ein separater für Glas.' },
  ],
  hr: [
    { id: 'ac', title: 'Klima uređaj', description: 'Na gornjem katu nalazi se klima uređaj sa standardnim daljinskim upravljačem. Namjestite ga kako vam najviše odgovara.', image: HOW_TO_IMAGES.ac },
    { id: 'tv', title: 'Televizor', description: 'Apartman ima TCL 55P69B 4K UHD TV s Google TV-om. Koristite ga za redovne TV kanale, streaming aplikacije i prijenos putem Google TV ili Chromecast-a. Velikim daljincem mijenjate HDMI izvor, malim upravljate televizorom.', image: HOW_TO_IMAGES.tv },
    { id: 'child-safety', title: 'Zaštitna vrata za djecu', description: 'Stubište je zaštićeno sigurnosnim vratima za djecu. Za otključavanje ili zaključavanje pritisnite i zavrtite gumb na nosaču.', image: HOW_TO_IMAGES['child-safety'] },
    { id: 'ventilation', title: 'Automatska ventilacija', description: 'Upravljač ventilacije nalazi se u donjem dijelu apartmana kod sofe. Desni upravljač kontrolira ventilaciju s rekuperacijom topline i preporučena je postavka za svakodnevnu upotrebu.', image: HOW_TO_IMAGES.ventilation },
    { id: 'blinds', title: 'Žaluzine', description: 'Pritisnite i držite strelicu gore oko sekunde za podizanje žaluzine, strelicu dolje za spuštanje. Kratki pritisak zaustavlja je.', image: HOW_TO_IMAGES.blinds },
    { id: 'roof-window', title: 'Krovni prozor', description: 'Strelicama otvorite ili zatvorite krovni prozor, srednjim gumbom zaustavite ga na bilo kojoj poziciji. Molimo ne upravljajte prozorom ručno.', image: HOW_TO_IMAGES['roof-window'] },
    { id: 'oven', title: 'Gorenje kombinirana pećnica', description: 'U kuhinji se nalazi Gorenje H30MOBS10HC kombinirana pećnica. Može se koristiti kao mikrovalna, konvekcijska pećnica, roštilj i air-fry pećnica. Detaljne upute dostupne su u PDF-u ispod.', image: HOW_TO_IMAGES.oven, links: [{ label: 'Otvori PDF priručnik', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }] },
    { id: 'family-friendly', title: 'Dječja stolica', description: 'U kuhinjskom ormariću ispod mikrovalne pećnice naći ćete komplet dječjeg sjedala koji odgovara kuhinjskoj stolici.' },
    { id: 'bed-safety', title: 'Zaštitna ograda za krevet', description: 'Ako vam treba zaštitna ograda za krevet, pohranjena je ispod prvog jednostrukog kreveta. Podignite madrac i postavite ogradu tamo gdje vam treba.' },
    { id: 'outdoor-lights', title: 'Vanjska rasvjeta', description: 'Prekidač za vanjsku rasvjetu nalazi se kod ulaza. Gore: uvijek uključeno. Sredina: isključeno. Dolje: senzor pokreta.', image: HOW_TO_IMAGES['outdoor-lights'] },
    { id: 'kitchen-lights', title: 'Kuhinjska rasvjeta', description: 'Ispod kuhinjskog ormara iznad štednjaka nalazi se plavi touch prekidač. Dodirnite za uključivanje/isključivanje, dugo pritisnite za podešavanje svjetline.', image: HOW_TO_IMAGES['kitchen-lights'] },
    { id: 'bathroom-heating', title: 'Grijanje kupaonice', description: 'Kod ulaza u kupaonicu nalazi se prekidač s ikonom grijanja. Pritisnite ga za aktiviranje dodatnog grijanja kupaonice na oko 30 minuta.', image: HOW_TO_IMAGES['bathroom-heating'] },
    { id: 'waste-handling', title: 'Razvrstavanje otpada', description: 'Ispod sudopera naći ćete odvojene kante za razvrstavanje otpada. Vani kod ulaza nalaze se zbirni kontejneri, uključujući odvojeni za staklo.' },
  ],
  sr: [
    { id: 'ac', title: 'Klima uređaj', description: 'Na gornjem spratu nalazi se klima uređaj sa standardnim daljinskim upravljačem. Podesite ga kako vam najviše odgovara.', image: HOW_TO_IMAGES.ac },
    { id: 'tv', title: 'Televizor', description: 'Apartman ima TCL 55P69B 4K UHD TV sa Google TV-om. Koristite ga za redovne TV kanale, streaming aplikacije i prenos putem Google TV ili Chromecast-a. Velikim daljinskim menjate HDMI izvor, malim upravljate televizorom.', image: HOW_TO_IMAGES.tv },
    { id: 'child-safety', title: 'Zaštitna vrata za decu', description: 'Stepenište je zaštićeno sigurnosnim vratima za decu. Za otključavanje ili zaključavanje pritisnite i zavrtite dugme na nosaču.', image: HOW_TO_IMAGES['child-safety'] },
    { id: 'ventilation', title: 'Automatska ventilacija', description: 'Upravljač ventilacije nalazi se u donjem delu apartmana kod sofe. Desni upravljač kontroliše ventilaciju s rekuperacijom toplote i preporučena je postavka za svakodnevnu upotrebu.', image: HOW_TO_IMAGES.ventilation },
    { id: 'blinds', title: 'Žaluzine', description: 'Pritisnite i držite strelicu gore oko sekunde za podizanje žaluzine, strelicu dole za spuštanje. Kratak pritisak zaustavlja je.', image: HOW_TO_IMAGES.blinds },
    { id: 'roof-window', title: 'Krovni prozor', description: 'Strelicama otvorite ili zatvorite krovni prozor, srednjim dugmetom zaustavite ga na bilo kojoj poziciji. Molimo ne upravljajte prozorom ručno.', image: HOW_TO_IMAGES['roof-window'] },
    { id: 'oven', title: 'Gorenje kombinovana rerna', description: 'U kuhinji se nalazi Gorenje H30MOBS10HC kombinovana rerna. Može se koristiti kao mikrotalasna, konvekcijska rerna, roštilj i air-fry rerna. Detaljna uputstva dostupna su u PDF-u ispod.', image: HOW_TO_IMAGES.oven, links: [{ label: 'Otvori PDF priručnik', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }] },
    { id: 'family-friendly', title: 'Dečja stolica', description: 'U kuhinjskom ormariću ispod mikrotalasne naći ćete komplet dečjeg sedišta koji odgovara kuhinjskoj stolici.' },
    { id: 'bed-safety', title: 'Zaštitna ograda za krevet', description: 'Ako vam treba zaštitna ograda za krevet, pohranjena je ispod prvog jednostrukog kreveta. Podignite madrac i postavite ogradu tamo gde vam treba.' },
    { id: 'outdoor-lights', title: 'Spoljašnja rasveta', description: 'Prekidač za spoljašnju rasvetu nalazi se kod ulaza. Gore: uvek uključeno. Sredina: isključeno. Dole: senzor pokreta.', image: HOW_TO_IMAGES['outdoor-lights'] },
    { id: 'kitchen-lights', title: 'Kuhinjska rasveta', description: 'Ispod kuhinjskog ormara iznad šporeta nalazi se plavi touch prekidač. Dodirnite za uključivanje/isključivanje, dugo pritisnite za podešavanje svetline.', image: HOW_TO_IMAGES['kitchen-lights'] },
    { id: 'bathroom-heating', title: 'Grejanje kupatila', description: 'Kod ulaza u kupatilo nalazi se prekidač sa ikonom grejanja. Pritisnite ga za aktiviranje dodatnog grejanja kupatila na oko 30 minuta.', image: HOW_TO_IMAGES['bathroom-heating'] },
    { id: 'waste-handling', title: 'Razvrstavanje otpada', description: 'Ispod sudopere naći ćete odvojene kante za razvrstavanje otpada. Napolju kod ulaza nalaze se zbirni kontejneri, uključujući odvojeni za staklo.' },
  ],
}

// ─── Restaurant content ────────────────────────────────────────────────────

export interface Restaurant {
  id: string; name: string; type: string; description: string; website: string; image?: string
}

const RESTAURANT_TYPES: Record<Locale, { fineDining: string; traditional: string; casual: string }> = {
  en: { fineDining: 'Fine dining', traditional: 'Traditional', casual: 'Casual' },
  sl: { fineDining: 'Vrhunska kuhinja', traditional: 'Tradicionalna', casual: 'Priložnostna' },
  de: { fineDining: 'Gehobene Küche', traditional: 'Traditionell', casual: 'Ungezwungen' },
  hr: { fineDining: 'Visoka kuhinja', traditional: 'Tradicionalna', casual: 'Opuštena' },
  sr: { fineDining: 'Visoka kuhinja', traditional: 'Tradicionalna', casual: 'Opuštena' },
}

const RESTAURANTS_EN: Restaurant[] = [
  { id: 'old-cellar', name: 'Old Cellar Lake View', type: 'fineDining', image: '/restaurants/oldcellarlakeview.webp', website: 'https://www.oldcellarbled.com/en/', description: 'A polished choice for a special meal in Bled, with seasonal Slovenian dishes, local ingredients, a good wine list and lake views.' },
  { id: 'pri-planincu', name: 'Pri Planincu', type: 'traditional', image: '/restaurants/planinc.webp', website: 'https://www.pri-planincu.com/', description: 'A family-run restaurant in a restored 19th-century building, known for traditional local dishes and a long Bled history.' },
  { id: 'blejska-hisa', name: 'Blejska Hiša', type: 'traditional', image: '/restaurants/blejska-hisa.webp', website: 'https://blejskahisa.si', description: 'A popular restaurant in Bled known for traditional Slovenian cuisine and generous portions of homemade dishes. The menu features meat specialties and Slovenian classics prepared with a modern touch in a cozy alpine atmosphere.' },
  { id: 'al-fresco', name: 'Al Fresco', type: 'casual', image: '/restaurants/al-fresco.webp', website: 'https://al-fresco.si', description: 'A modern restaurant serving breakfast, lunch and dinner in a relaxed atmosphere. The kitchen focuses on fresh ingredients and a contemporary European approach. Guests can enjoy meals on the pleasant outdoor terrace during warmer months.' },
  { id: 'julijana', name: 'Restaurant Julijana', type: 'fineDining', image: '/restaurants/julijana.webp', website: 'https://www.sava-hotels-resorts.com/en/sava-hotels-bled/services-and-experiences/gastronomy/restaurant-julijana/', description: 'Located in Grand Hotel Toplice, Julijana is one of Bled\'s refined dining options, with seasonal tasting menus, local ingredients and lake views.' },
  { id: 'sova', name: 'Restaurant Sova', type: 'fineDining', image: '/restaurants/sova.webp', website: 'https://www.restavracija-sova-bled.si/', description: 'A well-known lakeside restaurant suitable for a special dinner or a relaxed lunch by the water. The menu combines Slovenian and international influences, with fish, meat and seasonal dishes in a polished but welcoming atmosphere.' },
  { id: 'spica', name: 'Špica', type: 'casual', image: '/restaurants/spica.webp', website: 'https://www.spica-bled.si/', description: 'A relaxed restaurant close to the lake and the centre of Bled. A practical choice for families, casual lunches and easy evening meals after a day outdoors, with a broad menu and a lively local atmosphere.' },
  { id: 'central', name: 'Central Bled', type: 'casual', image: '/restaurants/central.webp', website: 'https://central-bled.com/', description: 'A convenient casual stop in the centre of Bled for coffee, brunch, lunch or a simple dinner. Works well for guests who want an easy, central option before or after exploring the lake, shops and town centre.' },
  { id: 'grajska-plaza', name: 'Grajska Plaža', type: 'casual', image: '/restaurants/grajska-plaza.webp', website: 'https://www.grajska-plaza.com/', description: 'A seasonal outdoor restaurant and lakeside spot by the castle bathing area, best suited for warm-weather lunches and drinks by the water. Open only during the season — check opening times before your visit.' },
  { id: 'mega-burger', name: 'Mega Burger', type: 'casual', image: '/restaurants/mega-burger.webp', website: 'https://www.mega-burger.si/', description: 'A casual choice for burgers, quick lunches and relaxed meals after a day at the lake or outdoors. A practical option for families who want something simple, filling and informal.' },
]

function localizeRestaurants(locale: Locale): Restaurant[] {
  const types = RESTAURANT_TYPES[locale]
  if (locale === 'en') return RESTAURANTS_EN.map(r => ({ ...r, type: types[r.type as keyof typeof types] }))

  const descriptions: Record<string, Record<Locale, string>> = {
    'old-cellar': {
      en: RESTAURANTS_EN[0]!.description,
      sl: 'Uglajena izbira za posebno kosilo ali večerjo v Bledu, s sezonskimi slovenskimi jedmi, lokalnimi sestavinami, dobro vinsko karto in razgledom na jezero.',
      de: 'Eine stilvolle Wahl für ein besonderes Essen in Bled, mit saisonaler slowenischer Küche, lokalen Zutaten, guter Weinauswahl und Blick auf den See.',
      hr: 'Uređen izbor za poseban ručak ili večeru u Bledu, sa sezonskim slovenskim jelima, lokalnim namirnicama, dobrom vinskom kartom i pogledom na jezero.',
      sr: 'Uređen izbor za poseban ručak ili večeru u Bledu, sa sezonskim slovenačkim jelima, lokalnim namirnicama, dobrom vinskom kartom i pogledom na jezero.',
    },
    'pri-planincu': {
      en: RESTAURANTS_EN[1]!.description,
      sl: 'Družinska restavracija v prenovljeni stavbi iz 19. stoletja, znana po tradicionalnih lokalnih jedeh in dolgi blejski zgodbi.',
      de: 'Ein familiengeführtes Restaurant in einem restaurierten Gebäude aus dem 19. Jahrhundert, bekannt für traditionelle lokale Gerichte und eine lange Geschichte in Bled.',
      hr: 'Obiteljski restoran u obnovljenoj zgradi iz 19. stoljeća, poznat po tradicionalnim lokalnim jelima i dugoj blejskoj povijesti.',
      sr: 'Porodični restoran u obnovljenoj zgradi iz 19. veka, poznat po tradicionalnim lokalnim jelima i dugoj blejskoj istoriji.',
    },
    'blejska-hisa': {
      en: RESTAURANTS_EN[2]!.description,
      sl: 'Priljubljena restavracija v Bledu, znana po tradicionalni slovenski kuhinji in izdatnih obrokih domače hrane. Jedilnik ponuja mesne specialitete in slovensko klasiko s sodobnim pridihom v prijetnem alpskem vzdušju.',
      de: 'Ein beliebtes Restaurant in Bled, bekannt für traditionelle slowenische Küche und großzügige Portionen hausgemachter Gerichte. Die Speisekarte bietet Fleischspezialitäten und slowenische Klassiker mit modernem Touch in gemütlicher Alpenatmosphäre.',
      hr: 'Popularan restoran u Bledu poznat po tradicionalnoj slovenačkoj kuhinji i izdašnim obrocima domaće hrane. Jelovnik nudi mesne specijalitete i slovenačke klasike s modernim prizvukom u ugodnoj alpskoj atmosferi.',
      sr: 'Popularan restoran u Bledu poznat po tradicionalnoj slovenačkoj kuhinji i izdašnim obrocima domaće hrane. Jelovnik nudi mesne specijalitete i slovenačke klasike sa modernim prizvukom u ugodnoj alpskoj atmosferi.',
    },
    'al-fresco': {
      en: RESTAURANTS_EN[3]!.description,
      sl: 'Moderna restavracija, ki v sproščenem vzdušju streže zajtrk, kosilo in večerjo. Kuhinja se osredotoča na sveže sestavine in sodobni evropski pristop. V toplejših mesecih je na voljo prijetna zunanja terasa.',
      de: 'Ein modernes Restaurant, das in entspannter Atmosphäre Frühstück, Mittagessen und Abendessen serviert. Die Küche setzt auf frische Zutaten und einen zeitgemäßen europäischen Ansatz. In wärmeren Monaten ist eine angenehme Außenterrasse verfügbar.',
      hr: 'Moderan restoran koji u opuštenom ozračju poslužuje doručak, ručak i večeru. Kuhinja se fokusira na svježe namirnice i suvremeni europski pristup. U toplijim mjesecima dostupna je ugodna vanjska terasa.',
      sr: 'Moderan restoran koji u opuštenoj atmosferi poslužuje doručak, ručak i večeru. Kuhinja se fokusira na sveže namirnice i savremeni evropski pristup. U toplijim mesecima dostupna je ugodna spoljna terasa.',
    },
    'julijana': {
      en: RESTAURANTS_EN[4]!.description,
      sl: 'V Grand Hotelu Toplice je to ena najprestižnejših restavracij v Bledu. Ponuja sezonske degustacijske menije z močnim poudarkom na lokalnih sestavinah in čudovit razgled na Blejsko jezero.',
      de: 'Im Grand Hotel Toplice gelegen, ist dies eine der renommiertesten Gaststätten in Bled. Es bietet saisonale Degustationsmenüs mit Fokus auf lokale Zutaten und einen schönen Blick auf den Bleder See.',
      hr: 'Smješten u Grand Hotelu Toplice, ovo je jedno od najprestižnijih mjesta za objedovanje u Bledu. Nudi sezonske degustacijske menije s naglaskom na lokalne namirnice i prekrasan pogled na Blejsko jezero.',
      sr: 'Smešten u Grand Hotelu Toplice, ovo je jedno od najprestižnijih mesta za obedovanje u Bledu. Nudi sezonske degustacijske menije s naglaskom na lokalne namirnice i prekrasan pogled na Blejsko jezero.',
    },
    'sova': {
      en: RESTAURANTS_EN[5]!.description,
      sl: 'Znana restavracija ob jezeru, primerna za posebno večerjo ali sproščeno kosilo ob vodi. Jedilnik združuje slovensko in mednarodno kuhinjo z ribami, mesom in sezonskimi jedmi v uglajeni a domači atmosferi.',
      de: 'Ein bekanntes Restaurant am Seeufer, geeignet für ein besonderes Abendessen oder ein entspanntes Mittagessen am Wasser. Die Speisekarte kombiniert slowenische und internationale Einflüsse mit Fisch, Fleisch und saisonalen Gerichten.',
      hr: 'Poznati restoran na obali jezera, prikladan za posebnu večeru ili opušteni ručak uz vodu. Jelovnik kombinira slovenačke i međunarodne utjecaje s ribom, mesom i sezonskim jelima u uglednoj, ali ugodnoj atmosferi.',
      sr: 'Poznat restoran na obali jezera, prikladan za posebnu večeru ili opušteni ručak uz vodu. Jelovnik kombinuje slovenačke i međunarodne uticaje sa ribom, mesom i sezonskim jelima u uglednoj, ali ugodnoj atmosferi.',
    },
    'spica': {
      en: RESTAURANTS_EN[6]!.description,
      sl: 'Sproščena restavracija blizu jezera in centra Bleda. Praktična izbira za družine, priložnostna kosila in preprosto večerjo po dnevu v naravi, s pestrim jedilnikom in živahno lokalno vzdušje.',
      de: 'Ein entspanntes Restaurant nahe dem See und dem Zentrum von Bled. Eine praktische Wahl für Familien, ungezwungene Mittagessen und unkomplizierte Abendessen nach einem Tag draußen, mit breitem Angebot.',
      hr: 'Opušteni restoran blizu jezera i centra Bleda. Praktičan izbor za obitelji, neformalne ručkove i jednostavne večere nakon dana u prirodi, s raznolikom ponudom i živahnom lokalnom atmosferom.',
      sr: 'Opušten restoran blizu jezera i centra Bleda. Praktičan izbor za porodice, neformalne ručkove i jednostavne večere nakon dana u prirodi, s raznovrsnom ponudom i živahnom lokalnom atmosferom.',
    },
    'central': {
      en: RESTAURANTS_EN[7]!.description,
      sl: 'Priročna priložnostna postaja v centru Bleda za kavo, brunch, kosilo ali preprosto večerjo. Dobro deluje za goste, ki iščejo enostavno in centralno možnost pred ali po ogledu jezera in mesta.',
      de: 'Eine praktische Anlaufstelle im Zentrum von Bled für Kaffee, Brunch, Mittagessen oder ein einfaches Abendessen. Gut geeignet für Gäste, die eine unkomplizierte, zentrale Option vor oder nach dem Erkunden des Sees wünschen.',
      hr: 'Praktična neformalna postaja u centru Bleda za kavu, brunch, ručak ili jednostavnu večeru. Dobro funkcionira za goste koji žele laganu, centralnu opciju prije ili nakon istraživanja jezera i centra.',
      sr: 'Praktična neformalna stanica u centru Bleda za kafu, brunch, ručak ili jednostavnu večeru. Dobro funkcioniše za goste koji žele laganu, centralnu opciju pre ili posle istraživanja jezera i centra.',
    },
    'grajska-plaza': {
      en: RESTAURANTS_EN[8]!.description,
      sl: 'Sezonska zunanja restavracija in točka ob jezeru pri gradu, primerna za kosilo in pijačo ob vodi v toplem vremenu. Odprta samo v sezoni — pred obiskom preverite delovni čas.',
      de: 'Ein saisonales Außenrestaurant am Seeufer beim Burgebadebereich, ideal für Mittagessen und Getränke am Wasser bei warmem Wetter. Nur in der Saison geöffnet — Öffnungszeiten vor dem Besuch prüfen.',
      hr: 'Sezonski vanjski restoran i točka uz jezero kod kupališta dvorca, najprikladniji za ručak i piće uz vodu po lijepom vremenu. Otvoren samo sezonski — provjerite radno vrijeme prije posjeta.',
      sr: 'Sezonski spoljni restoran i tačka uz jezero kod kupačkog mesta dvorca, najprikladniji za ručak i piće uz vodu po lepom vremenu. Otvoren samo sezonski — proverite radno vreme pre posete.',
    },
    'mega-burger': {
      en: RESTAURANTS_EN[9]!.description,
      sl: 'Priložnostna izbira v Bledu za hamburgerje, hitra kosila in sproščene obroke po dnevu ob jezeru ali v naravi. Praktična možnost za družine, ki iščejo preprosto, sito in neformalno.',
      de: 'Eine legere Wahl in Bled für Burger, schnelle Mittagessen und entspannte Mahlzeiten nach einem Tag am See oder in der Natur. Praktisch für Familien, die etwas Einfaches und Sättigendes suchen.',
      hr: 'Neformalan izbor u Bledu za burgere, brze ručkove i opuštene obroke nakon dana uz jezero ili u prirodi. Praktična opcija za obitelji koje žele nešto jednostavno, hranjivo i neformalno.',
      sr: 'Neformalan izbor u Bledu za burgere, brze ručkove i opuštene obroke nakon dana uz jezero ili u prirodi. Praktična opcija za porodice koje žele nešto jednostavno, hranjivo i neformalno.',
    },
  }

  return RESTAURANTS_EN.map(r => ({
    ...r,
    type: types[r.type as keyof typeof types],
    description: descriptions[r.id]?.[locale] ?? r.description,
  }))
}

export const restaurantContent: Record<Locale, Restaurant[]> = {
  en: localizeRestaurants('en'),
  sl: localizeRestaurants('sl'),
  de: localizeRestaurants('de'),
  hr: localizeRestaurants('hr'),
  sr: localizeRestaurants('sr'),
}

// ─── Suggestions ───────────────────────────────────────────────────────────

export interface SuggestionItem {
  id: string
  image: string
  title: string
  description: string
  season?: 'winter' | 'summer'
  buttons?: { label: string; href: string; target?: string }[]
}

const SUGGESTIONS_RAW: {
  id: string
  image: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  season?: 'winter' | 'summer'
  buttons?: { label: string; href: string; target?: string }[]
}[] = [
  {
    id: 'pletna-island',
    image: '/suggestions/pletna.webp',
    season: 'summer',
    title: {
      en: 'Pletna boat to Bled Island',
      sl: 'Vožnja s \'Pletno\' na Blejski otok',
      de: '"Pletna" Fahrt zur Insel Bled',
      hr: '"Pletna" putovanje na Blejski otok',
      sr: '"Pletna" putovanje na Blejsko ostrvo',
    },
    description: {
      en: 'A traditional Pletna boat is a relaxed way to reach Bled Island. You will find the wooden boats at several points along the lakeshore.',
      sl: 'Tradicionalna pletna je sproščen način za obisk Blejskega otoka. Lesene čolne najdete na več mestih ob obali jezera.',
      de: 'Ein traditionelles Pletna-Boot ist eine entspannte Art, die Insel Bled zu erreichen. Die Holzboote finden Sie an mehreren Stellen am Seeufer.',
      hr: 'Tradicionalna pletna opušten je način za odlazak na Blejski otok. Drvene čamce naći ćete na nekoliko mjesta uz obalu jezera.',
      sr: 'Tradicionalna pletna je opušten način da stignete do Blejskog ostrva. Drvene čamce naći ćete na nekoliko mesta uz obalu jezera.',
    },
  },
  {
    id: 'horse-carriages',
    image: '/suggestions/carriage.webp',
    title: {
      en: 'Horse-drawn carriages in Bled',
      sl: 'Spoznajte center Bleda z vožnjo s kočijo',
      de: 'Bled-Zentrum mit Pferdekutschen erkunden',
      hr: 'Istražite centar Bleda u konjskim kočijama',
      sr: 'Istražite centar Bleda u konjskim kočijama',
    },
    description: {
      en: 'Horse-drawn carriages are usually available in the centre of Bled and offer an easy, traditional ride around town or by the lake.',
      sl: 'Kočije so običajno na voljo v središču Bleda in so prijeten, tradicionalen način za krajšo vožnjo po mestu ali ob jezeru.',
      de: 'Pferdekutschen stehen meist im Zentrum von Bled bereit und bieten eine einfache, traditionelle Fahrt durch den Ort oder am See entlang.',
      hr: 'Kočije su obično dostupne u centru Bleda i nude jednostavnu, tradicionalnu vožnju po mjestu ili uz jezero.',
      sr: 'Kočije su obično dostupne u centru Bleda i nude jednostavnu, tradicionalnu vožnju kroz mesto ili pored jezera.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/YBuBG9FsBG3fTn8k6' },
    ],
  },
  {
    id: 'ojstrica',
    image: '/suggestions/ojstrica.webp',
    title: {
      en: 'Ojstrica viewpoint',
      sl: 'Ojstrica: Obvezno za lepe razglede na Bled',
      de: 'Ojstrica: Ein Muss für atemberaubende Bled-Aussichten',
      hr: 'Ojstrica: Obavezna destinacija za zadivljujuće poglede na Bled',
      sr: 'Ojstrica: Obavezna destinacija za zadivljujuće poglede na Bled',
    },
    description: {
      en: 'Ojstrica is one of the classic viewpoints above Lake Bled. The walk is short but steep in places, and the light is often especially good early in the morning.',
      sl: 'Ojstrica je ena klasičnih razglednih točk nad Blejskim jezerom. Pot je kratka, a ponekod strma; zgodaj zjutraj je svetloba pogosto najlepša.',
      de: 'Ojstrica ist einer der klassischen Aussichtspunkte über dem Bleder See. Der Weg ist kurz, stellenweise aber steil; früh am Morgen ist das Licht oft besonders schön.',
      hr: 'Ojstrica je jedan od klasičnih vidikovaca iznad Blejskog jezera. Staza je kratka, ali mjestimice strma; rano ujutro svjetlo je često najljepše.',
      sr: 'Ojstrica je jedan od klasičnih vidikovaca iznad Blejskog jezera. Staza je kratka, ali mestimično strma; rano ujutru svetlo je često najlepše.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/eZ2eKdY8VvwFyCtMA' },
    ],
  },
  {
    id: 'skiing',
    image: '/suggestions/skiing.webp',
    season: 'winter',
    title: {
      en: 'Skiing near Bled',
      sl: 'Smučarske avanture v alpski veličini okoli Bleda',
      de: 'Skiabenteuer im alpinen Glanz rund um Bled',
      hr: 'Skijaške avanture u alpskom sjaju oko Bleda',
      sr: 'Skijaške avanture u alpskom sjaju oko Bleda',
    },
    description: {
      en: 'In winter, Bled is within reach of several ski areas. Straža Bled is close and simple, while Kranjska Gora, Vogel, Krvavec and Pokljuka offer more options for a day on the snow.',
      sl: 'Prepustite se zimskemu čaru okolice Bleda, kjer Julijske Alpe postavljajo oder za razburljive smučarske izkušnje, primerne za vse ravni. Bled ponuja različne smučarske destinacije, od blagih pobočij Straže Bled do obsežnih terenov Kranjske Gore in Vogla.',
      de: 'Genießen Sie den Winterzauber rund um Bled, wo die Julischen Alpen die Bühne für aufregende Skierlebnisse bieten, die für alle Levels geeignet sind. Bled bietet verschiedene Ski-Destinationen, von den sanften Hängen der Straža Bled bis zu den weitläufigen Geländen der Kranjska Gora und Vogel.',
      hr: 'Prepustite se zimskoj čaroliji oko Bleda, gdje Julijske Alpe postavljaju pozornicu za uzbudljiva skijaška iskustva pogodna za sve razine. Bled nudi razne skijaške destinacije, od blagih padina Straže Bled do prostrana terena Kranjske Gore i Vogela.',
      sr: 'Prepustite se zimskoj čaroliji oko Bleda, gde Julijske Alpe postavljaju pozornicu za uzbudljiva skijaška iskustva pogodna za sve nivoe. Bled nudi razne skijaške destinacije, od blagih padina Straže Bled do prostornih terena Kranjske Gore i Vogela.',
    },
    buttons: [
      { label: 'Straža Bled', href: 'https://www.straza-bled.si/sl/Zima' },
      { label: 'Kranjska Gora', href: 'https://kranjska-gora.si/en/activities/skiing' },
      { label: 'Vogel', href: 'http://www.vogel.si/winter' },
      { label: 'Jelka family center', href: 'https://www.druzinskicenter-pokljuka.si/' },
      { label: 'Krvavec', href: 'https://www.rtc-krvavec.si/krvavec-winter' },
    ],
  },
  {
    id: 'sledding',
    image: '/suggestions/sledding.webp',
    season: 'winter',
    title: {
      en: 'Sledding near Bled',
      sl: 'Sankaška sreča v zimski pravljici Bleda',
      de: 'Schlittenspaß im Winterwunderland Bled',
      hr: 'Sanjkanje u zimskoj bajci Bleda',
      sr: 'Sanjkanje u zimskoj bajci Bleda',
    },
    description: {
      en: 'Straža Bled is a convenient nearby option for family sledding when conditions allow. Kranjska Gora and Vogel are also worth checking for winter activities.',
      sl: 'Začutite hladen zimski zrak na obrazu, ko se drvite po pobočjih Straže Bled – popolno mesto za družine in začetnike, ki iščejo sankaški adrenalin. Za tiste, ki hrepenite po večjem vznemirjenju, raziščite vznemirljive spuste v Kranjski Gori ali na Voglu.',
      de: 'Spüren Sie die frische Winterluft im Gesicht, während Sie die Hänge der Straža Bled hinunterrasen – ein perfekter Ort für Familien und Anfänger. Für mehr Aufregung erkunden Sie die aufregenden Abfahrten in Kranjska Gora oder Vogel.',
      hr: 'Osjetite svježi zimski zrak na licu dok jurite niz padine Straže Bled – savršeno mjesto za obitelji i početnike. Za više uzbuđenja, istražite uzbudljive spuste u Kranjskoj Gori ili Vogelu.',
      sr: 'Osetite svež zimski vazduh na licu dok jurite niz padine Straže Bled – savršeno mesto za porodice i početnike. Za više uzbuđenja, istražite uzbudljive spuste u Kranjskoj Gori ili Vogelu.',
    },
    buttons: [
      { label: 'Straža Bled', href: 'https://www.straza-bled.si/sl/Zima' },
      { label: 'Kranjska Gora', href: 'https://kranjska-gora.si/en/activities/skiing' },
      { label: 'Vogel', href: 'http://www.vogel.si/winter' },
      { label: 'Jelka family center', href: 'https://www.druzinskicenter-pokljuka.si/' },
    ],
  },
  {
    id: 'vintgar-gorge',
    image: '/suggestions/vintgar.webp',
    title: {
      en: 'Vintgar Gorge',
      sl: 'Odkrijte Vintgarsko sotesko: Naravni čudež blizu Bleda',
      de: 'Entdecken Sie die Vintgar-Schlucht: Ein Naturwunder bei Bled',
      hr: 'Otkrijte Vintgarsku klanac: Prirodno čudo Bleda',
      sr: 'Otkrijte Vintgarsku klisuru: Prirodno čudo Bleda',
    },
    description: {
      en: 'Vintgar Gorge is a beautiful walk through the Radovna River gorge, a short trip from Bled. A taxi to the entrance is often the simplest option.',
      sl: 'Vintgarska soteska, ki jo je izoblikovala reka Radovna, je lep naravni fenomen le kratek odmik od Bleda. Za udobje razmislite o vožnji s taksijem do vhoda.',
      de: 'Die Vintgar-Schlucht, geformt durch den Fluss Radovna, ist ein faszinierendes Naturwunder in kurzer Entfernung von Bled. Für mehr Komfort empfiehlt sich eine Taxifahrt zum Eingang.',
      hr: 'Vintgarska klisura, oblikovana rijekom Radovnom, je zadivljujuće prirodno čudo na kratkoj udaljenosti od Bleda. Za veće udobje, razmotrite taksi vožnju do ulaza.',
      sr: 'Vintgarska klisura, oblikovana rekom Radovnom, je zadivljujuće prirodno čudo na kratkoj udaljenosti od Bleda. Za veće udobje, razmotrite taksi vožnju do ulaza.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/zA1mbXGZPHma1p639' },
      { label: 'Vintgar website', href: 'https://vintgar.si/' },
    ],
  },
  {
    id: 'pokljuka-gorge',
    image: '/suggestions/pokluska-soteska.webp',
    title: {
      en: 'Pokljuka Gorge',
      sl: 'Odkrijte Pokljuško sotesko: Ledeniški čudež',
      de: 'Entdecken Sie die Pokljuka-Schlucht: Ein Gletscherwunder',
      hr: 'Otkrijte Pokljušku klanac: Ledenjačko čudo',
      sr: 'Otkrijte Pokljušku klisuru: Lednjačko čudo',
    },
    description: {
      en: 'Pokljuka Gorge is a quieter nature trip with impressive rock formations and forest paths. You can reach it by car, taxi or bike if you are comfortable with the distance.',
      sl: 'Pokljuška soteska je mirnejši izlet v naravo z zanimivimi skalnimi oblikami in gozdnimi potmi. Do nje lahko pridete z avtomobilom, taksijem ali kolesom, če vam razdalja ustreza.',
      de: 'Entdecken Sie die Wunder der Pokljuka-Schlucht, ein Zeugnis der Naturkunst, geformt durch den beständigen Fluss von Gletscherwässern. Erreichbar mit Fahrrad, Auto oder Taxi.',
      hr: 'Otkrijte čuda Pokljuške klisure, prekrasnog svjedočanstva prirodne umjetnosti oblikovanog stalnim tokom ledenjačkih voda. Dostupna biciklom, automobilom ili taksijem.',
      sr: 'Otkrijte čuda Pokljuške klisure, prelekog svedočanstva prirodne umetnosti oblikovanog stalnim tokom lednjačkih voda. Dostupna biciklom, automobilom ili taksijem.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/7XM67f7YJF4PEQfB7' },
    ],
  },
  {
    id: 'radovna-valley',
    image: '/suggestions/radovna.webp',
    title: {
      en: 'Radovna Valley',
      sl: 'Dolina Radovne: Hladen poletni pobeg',
      de: 'Radovna-Tal: Eine kühle Sommerauszeit',
      hr: 'Dolina Radovne: Hladan ljetni bijeg',
      sr: 'Dolina Radovne: Hladan letnji odmor',
    },
    description: {
      en: 'Radovna Valley is a peaceful drive from Bled and a good choice on warm days, with cooler air, quiet roads and mountain scenery.',
      sl: 'V srcu poletja Dolina Radovne nudi mirno zatočišče, kjer se lahko prepustite neokrnjeni naravi in uživate v osvežujočem gorskem zraku. Prijetna vožnja z avtomobilom vas bo pripeljala do tega idiličnega umika.',
      de: 'Im Herzen des Sommers bietet das Radovna-Tal eine ruhige Zuflucht, wo Sie die unberührte Natur genießen können. Eine bequeme Fahrt mit dem Auto führt Sie zu diesem stillen Versteck.',
      hr: 'Usred ljeta, Dolina Radovne nudi mirno utočište gdje možete uživati u neokrnjenoj prirodi i osvježavajućem planinskom zraku. Ugodna vožnja automobilom odvest će vas do ovog tihog skrovišta.',
      sr: 'Usred leta, Dolina Radovne nudi mirno utočište gde možete uživati u neokrnjenoj prirodi i osvežavajućem planinskom vazduhu. Ugodna vožnja automobilom odvešće vas do ovog tihog skrovišta.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/vFJ5mQt98UzTsYyV7' },
    ],
  },
  {
    id: 'soca-river',
    image: '/suggestions/soca.webp',
    title: {
      en: 'Soča River day trip',
      sl: 'Reka Soča: Potovanje skozi lepoto in zgodovino',
      de: 'Soča-Fluss: Eine Reise durch Schönheit und Geschichte',
      hr: 'Rijeka Soča: Putovanje kroz ljepotu i povijest',
      sr: 'Reka Soča: Putovanje kroz lepotu i istoriju',
    },
    description: {
      en: 'The Soča Valley is a longer but rewarding day trip, known for emerald water, mountain views and stops around Trenta, Bovec and Kobarid.',
      sl: 'Odpravite se na očarljivo potovanje vzdolž reke Soče, alpskega dragulja, ki ga je proslavila pojavitev v Narniji: Princ Kaspian. Reka, ki se razteza 137 km, izvira iz skrivnostnega kraškega vira v Trenti in je znana po osupljivih smaragdnih vodah.',
      de: 'Begeben Sie sich auf eine faszinierende Reise entlang der Soča, einem alpinen Juwel, das durch seine Erscheinung in \'Narnia: Prinz Kaspian\' berühmt wurde. Der 137 km lange Fluss ist für seine smaragdgrünen Gewässer bekannt.',
      hr: 'Krenite na zadivljujuće putovanje uz rijeku Soču, alpinski dragulj poznat po pojavi u \'Narniji: Princ Kaspian.\' Rijeka dugačka 137 km poznata je po svom upadljivom smaragdnom vodi.',
      sr: 'Krenite na zadivljujuće putovanje uz reku Soču, alpinski dragulj poznat po pojavi u \'Narniji: Princ Kaspian.\' Reka dugačka 137 km poznata je po svom upadljivom smaragdnom vodi.',
    },
    buttons: [
      { label: 'Open roadmap', href: 'https://maps.app.goo.gl/wF97AUE6c4DLzQft8' },
    ],
  },
  {
    id: 'zelenci',
    image: '/suggestions/zelenci.webp',
    title: {
      en: 'Zelenci Springs',
      sl: 'Zelenci',
      de: 'Zelenci: Natures aquatisches Meisterwerk',
      hr: 'Zelenci: Prirodno vodeno remek-djelo',
      sr: 'Zelenci: Prirodno vodno remek-delo',
    },
    description: {
      en: 'Zelenci Springs are an easy stop near Kranjska Gora. The short walk leads to clear green water and views toward the mountains.',
      sl: 'Zelenški izviri, skriti v očarljivi pokrajini Slovenije, so lep prikaz naravne umetnosti. Izviri blizu Kranjske Gore ustvarjajo osupljiv vizualni spektakel z živahnimi odtenki turkizne in smaragdne barve.',
      de: 'Die Zelenci-Quellen, eingebettet in die angenehmen Landschaften Sloweniens, sind ein fesselndes Zeugnis der Naturkunst. In der Nähe von Kranjska Gora gelegen, erzeugen diese Quellen ein atemberaubendes visuelles Spektakel.',
      hr: 'Zelenački izviri, smješteni u lijepim predjelima Slovenije, zadivljujući su prikaz prirodne umjetnosti. Blizu Kranjske Gore, ovi izviri stvaraju zapanjujući vizualni spektakl sa živim nijansama tirkizne i smaragdne.',
      sr: 'Zelenački izvori, smešteni u lepim predelima Slovenije, zadivljujući su prikaz prirodne umetnosti. Blizu Kranjske Gore, ovi izvori stvaraju zapanjujući vizualni spektakl sa živim nijansama tirkizne i smaragdne.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/D3qZ2gi2jhoq4APAA' },
    ],
  },
  {
    id: 'lake-bohinj',
    image: '/suggestions/bohinj.webp',
    title: {
      en: 'Lake Bohinj',
      sl: 'Bohinjsko jezero: Slovensko naravno čudo',
      de: 'Wocheiner See: Sloweniens Naturwunder',
      hr: 'Bohinjsko jezero: Slovensko prirodno čudo',
      sr: 'Bohinjsko jezero: Slovensko prirodno čudo',
    },
    description: {
      en: 'Lake Bohinj is quieter and wilder than Bled, with swimming spots, walking paths and easy access to the Julian Alps. Parking can be busy in summer, so check options before you go.',
      sl: 'Gnezdeno v objemu štiriindvajsetih lepih vasic, je Bohinjsko jezero največji in najbolj očarljivi naravni zaklad Slovenije. To osupljivo jezero ponuja neskončne možnosti za ljubitelje narave.',
      de: 'Eingebettet in den Armen von vierundzwanzig charmanten Dörfern, ist der Wocheiner See Sloweniens größter natürlicher Schatz. Dieser wunderschöne See bietet unendliche Möglichkeiten für Naturbegeisterte.',
      hr: 'Smješteno u naručju dvadesetičetiri šarmantna sela, Bohinjsko jezero je najveće i najzanimljivije prirodno blago Slovenije. Ovo prekrasno jezero nudi beskrajne mogućnosti za ljubitelje prirode.',
      sr: 'Smešteno u naručju dvadesetičetiri šarmantna sela, Bohinjsko jezero je najveće i najzanimljivije prirodno blago Slovenije. Ovo prelepo jezero nudi beskrajne mogućnosti za ljubitelje prirode.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/KZXyR5hVFPiLdNbV9' },
      { label: 'Car parking', href: 'https://www.bohinj.si/en/information/parking-and-public-transport/' },
    ],
  },
  {
    id: 'radovljica',
    image: '/suggestions/radovljica.webp',
    title: {
      en: 'Radovljica, Begunje and Kropa',
      sl: 'Radovljica, Begunje & Kropa: Potovanje skozi čas',
      de: 'Radovljica, Begunje & Kropa: Zeitreise durch charmante Städtchen',
      hr: 'Radovljica, Begunje & Kropa: Putovanje kroz šarmantne gradiće',
      sr: 'Radovljica, Begunje & Kropa: Putovanje kroz šarmantne gradiće',
    },
    description: {
      en: 'These nearby towns are good for a slower half-day trip, with old centres, local museums, craft heritage and places for coffee or lunch.',
      sl: 'Odpravite se na potovanje skozi čas v majhnih mestecih Radovljica, Begunje in Kropa, kjer preteklost oživi v lepem srečanju.',
      de: 'Begeben Sie sich auf eine Zeitreise durch die kleinen Städte Radovljica, Begunje und Kropa, wo die Vergangenheit lebendig wird.',
      hr: 'Krenite na putovanje kroz vrijeme u malim gradićima Radovljica, Begunje i Kropa, gdje prošlost oživi u čarobnom susretu.',
      sr: 'Krenite na putovanje kroz vreme u malim gradićima Radovljica, Begunje i Kropa, gde prošlost oživljava u čarobnom susretu.',
    },
    buttons: [
      { label: 'Read more', href: 'https://www.radolca.si/en' },
    ],
  },
  {
    id: 'postojna-cave',
    image: '/suggestions/predjama.webp',
    title: {
      en: 'Postojna Cave and Predjama Castle',
      sl: 'Postojnska jama & Predjamski grad: Potovanje v čudežno deželo',
      de: 'Höhle von Postojna & Burg Predjama: Eine Reise ins Wunderland',
      hr: 'Postojnska jama & Predjamski dvorac: Putovanje u čudesnu zemlju',
      sr: 'Postojnska jama & Predjamski dvorac: Putovanje u čudesnu zemlju',
    },
    description: {
      en: 'Postojna Cave and Predjama Castle make a full and easy day trip by car. The cave visit includes an underground train, so booking ahead is recommended in busy periods.',
      sl: 'Začnite dan s lepim obiskom Postojnske jame, ki velja za \'kraljico podzemnega sveta.\' Po eni uri vožnje boste prispeli do jame in se podali na nepozabno vožnjo s podzemnim vlakom skozi lepe komore.',
      de: 'Beginnen Sie Ihren Tag mit einem wunderbaren Ausflug in die Höhle von Postojna, die als "Königin der Unterwelt" gilt. Nach einer malerischen Stunde Fahrt erwartet Sie eine unvergessliche Fahrt mit dem Höhlenzug.',
      hr: 'Počnite dan čudesnim posjetom Postojnskoj jami, nazvanoj "Kraljicom podzemnog svijeta." Nakon sat vremena vožnje, polazite na nezaboravnu vožnju podzemnim vlakom kroz prekrasne dvorane.',
      sr: 'Počnite dan čudesnom posetom Postojnskoj jami, nazvanoj "Kraljicom podzemnog sveta." Nakon sat vremena vožnje, polazite na nezaboravnu vožnju podzemnim vozom kroz prelepe dvorane.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/jRkjNKLfF5ZA94jR9' },
    ],
  },
  {
    id: 'horse-ridding',
    image: '/suggestions/horseriding.webp',
    title: {
      en: 'Horseback riding near Bled',
      sl: 'Blejske konjeniške pustolovščine: Vožnja skozi naravno lepoto',
      de: 'Bled Reitabenteuer: Eine Reise durch die Naturschönheit',
      hr: 'Blejske konjičke avanture: Jahanje kroz prirodnu ljepotu',
      sr: 'Blejske konjičke avanture: Jahanje kroz prirodnu lepotu',
    },
    description: {
      en: 'Local horseback rides are available near Bled and can suit different experience levels. Contact the provider directly for timing, availability and route details.',
      sl: 'Doživite osupljivo pokrajino Bleda med jahalno pustolovščino, primerno za turiste vseh ravni jahanja. Naši angleško govoreči vodniki vas bodo peljali skozi nekatere od najslikovitejših lokacij.',
      de: 'Erleben Sie das wunderschöne Gelände von Bled auf einem Reiterabenteuer, geeignet für Touristen aller Reitstufen. Englischsprachige Guides führen Sie durch malerische Orte.',
      hr: 'Doživite prekrasan teren Bleda na konjičkoj avanturi, pogodnoj za turiste svih razina jahanja. Naši vodiči govore engleski i provest će vas kroz slikovite lokacije.',
      sr: 'Doživite predivan teren Bleda na konjičkoj avanturi, pogodnoj za turiste svih nivoa jahanja. Naši vodiči govore engleski i provešće vas kroz slikovite lokacije.',
    },
    buttons: [
      { label: '+386 40 887 486', href: 'tel:0038640887486', target: '_self' },
    ],
  },
  {
    id: 'ljubljana',
    image: '/suggestions/ljubljana.webp',
    title: {
      en: 'Ljubljana day trip',
      sl: 'Odkrijte Ljubljano: Prestolnica zgodovine in lepote',
      de: 'Entdecken Sie Ljubljana: Eine Hauptstadt der Geschichte und Schönheit',
      hr: 'Otkrijte Ljubljanu: Prijestolnica povijesti i ljepote',
      sr: 'Otkrijte Ljubljanu: Prestonica istorije i lepote',
    },
    description: {
      en: 'Ljubljana is an easy day trip for a riverside walk, the old town, the market, cafés and a visit to the castle.',
      sl: 'Ljubljana, lepa prestolnica Slovenije, vabi z bogato tapiserijo zgodovinskih in kulturnih zakladov, ki čakajo na odkritje.',
      de: 'Ljubljana, die charmante Hauptstadt Sloweniens, lockt mit einem reichen Teppich aus historischen und kulturellen Schätzen, die darauf warten, entdeckt zu werden.',
      hr: 'Ljubljana, šarmantna prijestolnica Slovenije, mami bogatim tapiserijom povijesnih i kulturnih blaga koja čekaju da budu istražena.',
      sr: 'Ljubljana, šarmantna prestonica Slovenije, mami bogatim tapiserijom istorijskih i kulturnih blaga koja čekaju da budu istražena.',
    },
    buttons: [
      { label: 'See location', href: 'https://goo.gl/maps/kevcMT3gHanuCqG76' },
      { label: 'Car parking', href: 'https://goo.gl/maps/KjgDHh4o3bayeK3Z9' },
    ],
  },
  {
    id: 'velika-planina',
    image: '/suggestions/velikaplanina.webp',
    title: {
      en: 'Velika Planina',
      sl: 'Velika Planina: Visokogorski raj v Evropi',
      de: 'Velika Planina: Ein Hochgebirgsparadies in Europa',
      hr: 'Velika Planina: Visokoplaninska oaza u Europi',
      sr: 'Velika Planina: Visokoplaninska oaza u Evropi',
    },
    description: {
      en: 'Velika Planina is known for its high-mountain pasture, herdsmen\'s huts and wide views. Check cable car times and weather before setting off.',
      sl: 'Gnezdena v visokogorju Evrope, je Velika Planina slikovita pastirska vasica, kjer tradicija in narava soobstajata v harmoniji.',
      de: 'Eingebettet in die Hochgebirge Europas, ist Velika Planina ein malerisches Hirtendorf, in dem Tradition und Natur in Harmonie nebeneinander existieren.',
      hr: 'Smještena u visokim planinama Europe, Velika Planina je slikovito pastirsko selo u kojemu tradicija i priroda koegzistiraju u harmoniji.',
      sr: 'Smeštena u visokim planinama Evrope, Velika Planina je slikovito pastirsko selo u kome tradicija i priroda koegzistiraju u harmoniji.',
    },
    buttons: [
      { label: 'See location', href: 'https://www.velikaplanina.si/en/' },
    ],
  },
  {
    id: 'zipline-dolinka',
    image: '/suggestions/ziplinedolinka.webp',
    title: {
      en: 'Zipline Dolinka',
      sl: 'Zipline Dolinka: Letite skozi adrenalinska doživetja',
      de: 'Zipline Dolinka: Gleiten Sie durch malerische Nervenkitzel',
      hr: 'Zipline Dolinka: Letite kroz uzbudljive prizore',
      sr: 'Zipline Dolinka: Letite kroz uzbudljive prizore',
    },
    description: {
      en: 'Zipline Dolinka starts from the meeting point at "Grajska Cesta 16". The guides provide the required safety equipment and instructions before the tour.',
      sl: 'Pripravite se na pustolovščino, ki se začne na zbirnem mestu na Grajski cesti 16. Izkušeni vodniki vas bodo opremili z vso potrebno opremo, vključno s čelado in polno varnostno opasnico.',
      de: 'Bereiten Sie sich auf ein Adrenalin-Abenteuer vor, das am Treffpunkt "Grajska Cesta 16" beginnt. Ihre erfahrenen Guides statten Sie mit aller notwendigen Ausrüstung aus, einschließlich Helm und Sicherheitsgurt.',
      hr: 'Pripremite se za uzbudljivu avanturu koja počinje na zbirnom mjestu "Grajska Cesta 16". Vaši iskusni vodiči opremit će vas svom potrebnom opremom, uključujući kacigu i sigurnosni pojas.',
      sr: 'Pripremite se za uzbudljivu avanturu koja počinje na zbirnom mestu "Grajska Cesta 16". Vaši iskusni vodiči opremit će vas svom potrebnom opremom, uključujući kacigu i sigurnosni pojas.',
    },
    buttons: [
      { label: 'See office location', href: 'https://goo.gl/maps/rLjYicz15JYKqTBb8' },
      { label: 'Buy tickets', href: 'https://zipline-dolinka.si/' },
    ],
  },
  {
    id: 'sea-side',
    image: '/suggestions/piran.webp',
    title: {
      en: 'Piran and the Slovenian coast',
      sl: 'Od Bleda do Portorož in Piran: Slikovit pobeg ob slovenski obali',
      de: 'Von Bled nach Portorož und Piran: Ein malerischer slowenischer Ausflug',
      hr: 'Od Bleda do Portorož i Piran: Slikovit slovenački bijeg',
      sr: 'Od Bleda do Portorož i Piran: Slikovit slovenački odmor',
    },
    description: {
      en: 'Piran and Portorož are possible as a longer day trip from Bled. Leave early, allow for traffic, and plan parking before arriving on the coast.',
      sl: 'Odpravite se na enodnevno potovanje skozi raznolike pokrajine Slovenije, ki vas popelje od lepe alpske veličine Bleda do lepih obalnih mest Portorož in Piran. Ta slikovita pot obljublja razglede na slovensko podeželje in bleščeče Jadransko morje.',
      de: 'Begeben Sie sich auf eine Tagesreise durch die vielfältigen Landschaften Sloweniens, von der Alpenpracht Bleds zu den charmanten Küstenstädten Portorož und Piran.',
      hr: 'Krenite na jednodnevno putovanje kroz raznolike krajeve Slovenije, od alpskog sjaja Bleda do šarmantnih obalnih gradova Portorož i Piran i sjajnog Jadranskog mora.',
      sr: 'Krenite na jednodnevno putovanje kroz raznolike krajeve Slovenije, od alpskog sjaja Bleda do šarmantnih obalnih gradova Portorož i Piran i sjajnog Jadranskog mora.',
    },
    buttons: [
      { label: 'Piran location', href: 'https://goo.gl/maps/cDVN6vJrraZheNii9' },
      { label: 'Portorož location', href: 'https://goo.gl/maps/mcqdAL7iqPURG8oc9' },
    ],
  },
  {
    id: 'mountains',
    image: '/suggestions/alpe.webp',
    title: {
      en: 'Mountain day trips',
      sl: 'Gorski pobegi iz Bleda: Veličastje narave vas čaka',
      de: 'Bled Bergausflüge: Natures Majestät erwartet Sie',
      hr: 'Planinski izleti iz Bleda: Veličanstvo prirode čeka',
      sr: 'Planinski izleti iz Bleda: Veličanstvo prirode čeka',
    },
    description: {
      en: 'Bled is a good base for mountain walks and hikes in the Julian Alps and Triglav National Park. Choose a route that matches your fitness, equipment and the weather.',
      sl: 'Pripravite se na potovanje v srce lepe naravne lepote Slovenije z enodnevnimi izleti iz Bleda v okoliške gore. Pred vami se razvija tapiserija poti, ki vabi pohodnike v pristne pokrajine Julijanskih Alp in Triglavskega narodnega parka.',
      de: 'Begeben Sie sich auf eine Reise ins Herz der Naturschönheit Sloweniens mit Tagesausflügen von Bled in die umliegenden Berge. Ein Teppich von Wanderwegen lädt Sie ein, die unberührten Landschaften der Julischen Alpen zu erkunden.',
      hr: 'Pripremite se za putovanje u srce prirodne ljepote Slovenije s jednodnevnim izletima iz Bleda u okolne planine. Tapiserija staza poziva planinate da se uronu u netaknute krajolike Julijskih Alpa.',
      sr: 'Pripremite se za putovanje u srce prirodne lepote Slovenije s jednodnevnim izletima iz Bleda u okolne planine. Tapiserija staza poziva planinare da se uronu u netaknute krajolike Julijskih Alpa.',
    },
    buttons: [
      { label: 'Find a suitable mountain', href: 'https://www.hike.uno/hiking/mountain_ranges' },
    ],
  },
]

export const suggestionContent: Record<Locale, SuggestionItem[]> = {
  en: SUGGESTIONS_RAW.map(s => ({ id: s.id, image: s.image, title: s.title.en, description: s.description.en, season: s.season, buttons: s.buttons })),
  sl: SUGGESTIONS_RAW.map(s => ({ id: s.id, image: s.image, title: s.title.sl, description: s.description.sl, season: s.season, buttons: s.buttons })),
  de: SUGGESTIONS_RAW.map(s => ({ id: s.id, image: s.image, title: s.title.de, description: s.description.de, season: s.season, buttons: s.buttons })),
  hr: SUGGESTIONS_RAW.map(s => ({ id: s.id, image: s.image, title: s.title.hr, description: s.description.hr, season: s.season, buttons: s.buttons })),
  sr: SUGGESTIONS_RAW.map(s => ({ id: s.id, image: s.image, title: s.title.sr, description: s.description.sr, season: s.season, buttons: s.buttons })),
}
