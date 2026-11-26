import type { LocalizedText } from './index'

export interface SeedRestaurant {
  websiteSlug: string
  name: string
  type: 'fineDining' | 'traditional' | 'casual'
  website: string | null
  description: LocalizedText
  active?: number
  recurring: boolean
  validFrom: string | null
  validTo: string | null
  location?: {name:string;address:string;google_maps_url:string}
  image: string // source path under public/, copied into data/uploads/restaurants/ on seed
}

export interface SeedButton { label: string | LocalizedText; href: string; target?: string }

export interface SeedSuggestion {
  websiteSlug: string
  title: LocalizedText
  description: LocalizedText
  buttons?: SeedButton[]
  image: string // source path under public/, copied into data/uploads/suggestions/ on seed
  recurring: boolean
  validFrom: string | null
  validTo: string | null
}

export interface SeedLink { label: string | LocalizedText; href: string }

export interface SeedFaq {
  recurring: boolean
  validFrom: string | null
  validTo: string | null
  title: LocalizedText
  description: LocalizedText
  links?: SeedLink[]
}

export interface SeedHowto {
  recurring: boolean
  validFrom: string | null
  validTo: string | null
  title: LocalizedText
  description: LocalizedText
  image?: string // source path under public/, copied into data/uploads/howto/ on seed
  links?: SeedLink[]
}

// Reviewed 26 November 2026. Existing installations are updated only by the explicit review script.
export const SEED_RESTAURANTS: SeedRestaurant[] = [
  {
    "name": "Old Cellar Lake View",
    "type": "fineDining",
    "website": "https://www.oldcellarbled.com/en/",
    "image": "/restaurants/oldcellarlakeview.webp",
    "description": {
      "sl": "Restavracija ob jezeru s sezonskimi jedmi in slovenskimi sestavinami. Pred obiskom preverite aktualni jedilnik in rezervirajte mizo.",
      "en": "A lakeside restaurant serving seasonal dishes with Slovenian ingredients. Check the current menu and reserve a table before visiting.",
      "de": "Restaurant am See mit saisonalen Gerichten und slowenischen Zutaten. Aktuelle Speisekarte prüfen und vorab einen Tisch reservieren.",
      "hr": "Restoran uz jezero sa sezonskim jelima i slovenskim namirnicama. Provjerite aktualni jelovnik i rezervirajte stol.",
      "sr": "Restoran uz jezero sa sezonskim jelima i slovenačkim namirnicama. Proverite aktuelni jelovnik i rezervišite sto."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Old Cellar Lake View",
      "address": "Cesta svobode 12, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Old%20Cellar%20Lake%20View%20Cesta%20svobode%2012%2C%204260%20Bled"
    },
    "websiteSlug": "old-cellar"
  },
  {
    "name": "Pri Planincu",
    "type": "traditional",
    "website": "https://www.pri-planincu.com/",
    "image": "/restaurants/planinc.webp",
    "description": {
      "sl": "Gostilna s tradicionalnimi slovenskimi jedmi na Grajski cesti. Pred obiskom preverite delovni čas in razpoložljivost miz.",
      "en": "An inn serving traditional Slovenian dishes on Grajska cesta. Check opening hours and table availability before visiting.",
      "de": "Gasthaus mit traditionellen slowenischen Gerichten an der Grajska cesta. Öffnungszeiten und Tischverfügbarkeit vorab prüfen.",
      "hr": "Gostionica s tradicionalnim slovenskim jelima u Grajskoj cesti. Prije posjeta provjerite radno vrijeme i slobodne stolove.",
      "sr": "Gostionica sa tradicionalnim slovenačkim jelima u Grajskoj cesti. Pre posete proverite radno vreme i slobodne stolove."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Pri Planincu",
      "address": "Grajska cesta 8, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Pri%20Planincu%20Grajska%20cesta%208%2C%204260%20Bled"
    },
    "websiteSlug": "planinc"
  },
  {
    "name": "Blejska Hiša",
    "type": "traditional",
    "website": "https://blejskahisa.si/",
    "image": "/restaurants/blejska-hisa.webp",
    "description": {
      "sl": "Blejska hiša ponuja slovenske jedi, jedi z žara in druge jedi po naročilu. Jedilnik, delovni čas in rezervacije preverite pri restavraciji.",
      "en": "Blejska hiša offers Slovenian dishes, grilled food and other à la carte meals. Check the menu, opening hours and reservations with the restaurant.",
      "de": "Blejska hiša bietet slowenische Gerichte, Grillspezialitäten und weitere À-la-carte-Speisen. Speisekarte, Öffnungszeiten und Reservierungen beim Restaurant prüfen.",
      "hr": "Blejska hiša nudi slovenska jela, jela s roštilja i druga jela po narudžbi. Jelovnik, radno vrijeme i rezervacije provjerite u restoranu.",
      "sr": "Blejska hiša nudi slovenačka jela, jela sa roštilja i druga jela po porudžbini. Jelovnik, radno vreme i rezervacije proverite u restoranu."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Blejska Hiša",
      "address": "Ljubljanska cesta 13a, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Blejska%20Hi%C5%A1a%20Ljubljanska%20cesta%2013a%2C%204260%20Bled"
    },
    "websiteSlug": "blejska-hisa"
  },
  {
    "name": "Al Fresco",
    "type": "casual",
    "website": "https://al-fresco.si/en/",
    "image": "/restaurants/al-fresco.webp",
    "description": {
      "sl": "Al Fresco na Ljubljanski cesti ponuja zajtrke, pice, testenine in druge jedi. Pred obiskom preverite ponudbo in delovni čas.",
      "en": "Al Fresco on Ljubljanska cesta serves breakfast, pizza, pasta and other dishes. Check the current menu and opening hours before visiting.",
      "de": "Al Fresco an der Ljubljanska cesta serviert Frühstück, Pizza, Pasta und weitere Gerichte. Aktuelles Angebot und Öffnungszeiten vorab prüfen.",
      "hr": "Al Fresco u Ljubljanskoj cesti nudi doručak, pizze, tjesteninu i druga jela. Prije posjeta provjerite ponudu i radno vrijeme.",
      "sr": "Al Fresco u Ljubljanskoj cesti nudi doručak, pice, testeninu i druga jela. Pre posete proverite ponudu i radno vreme."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Al Fresco",
      "address": "Ljubljanska cesta 26, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Al%20Fresco%20Ljubljanska%20cesta%2026%2C%204260%20Bled"
    },
    "websiteSlug": "al-fresco"
  },
  {
    "name": "Restaurant Julijana",
    "type": "fineDining",
    "website": "https://www.sava-hotels-resorts.com/en/sava-hotels-bled/services-and-experiences/gastronomy/restaurant-julijana/",
    "image": "/restaurants/julijana.webp",
    "description": {
      "sl": "Restavracija Julijana je v Grand Hotelu Toplice. Uradna stran trenutno navaja, da je zaprta; pred načrtovanjem obiska pri hotelu preverite ponovno odprtje in rezervacije.",
      "en": "Restaurant Julijana is in Grand Hotel Toplice. The official website currently lists it as closed; contact the hotel about reopening and reservations before planning a visit.",
      "de": "Das Restaurant Julijana befindet sich im Grand Hotel Toplice. Die offizielle Website nennt es derzeit geschlossen; Wiedereröffnung und Reservierungen direkt beim Hotel erfragen.",
      "hr": "Restoran Julijana nalazi se u Grand Hotelu Toplice. Službena stranica trenutačno navodi da je zatvoren; prije posjeta provjerite ponovno otvaranje i rezervacije kod hotela.",
      "sr": "Restoran Julijana je u Grand Hotelu Toplice. Zvanični sajt trenutno navodi da je zatvoren; pre posete proverite ponovno otvaranje i rezervacije kod hotela."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "active": 0,
    "location": {
      "name": "Restaurant Julijana",
      "address": "Cesta svobode 12, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Restaurant%20Julijana%20Cesta%20svobode%2012%2C%204260%20Bled"
    },
    "websiteSlug": "julijana"
  },
  {
    "name": "Restaurant Sova",
    "type": "fineDining",
    "website": "https://www.restavracija-sova.com/en/contact/",
    "image": "/restaurants/sova.webp",
    "description": {
      "sl": "Restavracija Sova je na Ljubljanski cesti 8. Ponuja sezonske jedi; pred obiskom preverite jedilnik in rezervirajte mizo.",
      "en": "Restaurant Sova is at Ljubljanska cesta 8. It serves seasonal dishes; check the menu and reserve a table before visiting.",
      "de": "Das Restaurant Sova liegt an der Ljubljanska cesta 8. Es bietet saisonale Gerichte; Speisekarte prüfen und einen Tisch reservieren.",
      "hr": "Restoran Sova nalazi se u Ljubljanskoj cesti 8. Nudi sezonska jela; prije posjeta provjerite jelovnik i rezervirajte stol.",
      "sr": "Restoran Sova je u Ljubljanskoj cesti 8. Nudi sezonska jela; pre posete proverite jelovnik i rezervišite sto."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Restaurant Sova",
      "address": "Ljubljanska cesta 8, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Restaurant%20Sova%20Ljubljanska%20cesta%208%2C%204260%20Bled"
    },
    "websiteSlug": "sova"
  },
  {
    "name": "Špica",
    "type": "casual",
    "website": "https://restavracija-spica.si/",
    "image": "/restaurants/spica.webp",
    "description": {
      "sl": "Špica na Cesti svobode ponuja pice, jedi po naročilu in pijačo. Pred obiskom preverite delovni čas kuhinje in aktualno ponudbo.",
      "en": "Špica on Cesta svobode serves pizza, à la carte dishes and drinks. Check kitchen hours and the current menu before visiting.",
      "de": "Špica an der Cesta svobode bietet Pizza, À-la-carte-Gerichte und Getränke. Küchenzeiten und aktuelles Angebot vorab prüfen.",
      "hr": "Špica u Cesti svobode nudi pizze, jela po narudžbi i pića. Prije posjeta provjerite radno vrijeme kuhinje i ponudu.",
      "sr": "Špica u Cesti svobode nudi pice, jela po porudžbini i pića. Pre posete proverite radno vreme kuhinje i ponudu."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Špica",
      "address": "Cesta svobode 9, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=%C5%A0pica%20Cesta%20svobode%209%2C%204260%20Bled"
    },
    "websiteSlug": "spica"
  },
  {
    "name": "Central Bled",
    "type": "casual",
    "website": null,
    "image": "/restaurants/central.webp",
    "description": {
      "sl": "Central Bled je naveden na naslovu Ulica narodnih herojev 3. Pred obiskom preverite, ali restavracija obratuje, in aktualni delovni čas; prejšnja spletna povezava ni potrjena.",
      "en": "Central Bled is listed at Ulica narodnih herojev 3. Confirm that the restaurant is operating and check current hours before visiting; its previous website could not be verified.",
      "de": "Central Bled ist unter Ulica narodnih herojev 3 verzeichnet. Betrieb und aktuelle Öffnungszeiten vor einem Besuch bestätigen; die bisherige Website konnte nicht bestätigt werden.",
      "hr": "Central Bled naveden je na adresi Ulica narodnih herojev 3. Prije posjeta provjerite radi li restoran i aktualno radno vrijeme; prethodna stranica nije potvrđena.",
      "sr": "Central Bled je naveden na adresi Ulica narodnih herojev 3. Pre posete proverite da li restoran radi i aktuelno radno vreme; prethodni sajt nije potvrđen."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "active": 0,
    "location": {
      "name": "Central Bled",
      "address": "Ulica narodnih herojev 3, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Central%20Bled%20Ulica%20narodnih%20herojev%203%2C%204260%20Bled"
    },
    "websiteSlug": "central"
  },
  {
    "name": "Grajska Plaža",
    "type": "casual",
    "website": "https://www.grajska-plaza.com/",
    "image": "/restaurants/grajska-plaza.webp",
    "description": {
      "sl": "Restavracija na prostem pod Blejskim gradom. Objavljena sezona je od 20. aprila do 1. novembra; pred obiskom preverite odprtost, saj je ponudba odvisna tudi od vremena.",
      "en": "An outdoor restaurant below Bled Castle. The published season runs from 20 April to 1 November; check opening before visiting, as service also depends on weather.",
      "de": "Freiluftrestaurant unterhalb der Bleder Burg. Die veröffentlichte Saison läuft vom 20. April bis 1. November; Öffnung vorab prüfen, da der Betrieb auch wetterabhängig ist.",
      "hr": "Restoran na otvorenom pod Bledskim dvorcem. Objavljena sezona traje od 20. travnja do 1. studenoga; prije posjeta provjerite otvorenost jer ovisi i o vremenu.",
      "sr": "Restoran na otvorenom ispod Bledskog zamka. Objavljena sezona traje od 20. aprila do 1. novembra; pre posete proverite otvorenost jer zavisi i od vremena."
    },
    "recurring": true,
    "validFrom": "04-20",
    "validTo": "11-01",
    "location": {
      "name": "Grajska Plaža",
      "address": "Veslaška promenada 11, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Grajska%20Pla%C5%BEa%20Vesla%C5%A1ka%20promenada%2011%2C%204260%20Bled"
    },
    "websiteSlug": "grajska-plaza"
  },
  {
    "name": "Mega Burger",
    "type": "casual",
    "website": "https://www.mega-burger.si/",
    "image": "/restaurants/mega-burger.webp",
    "description": {
      "sl": "Mega Burger pri glavni avtobusni postaji ponuja burgerje in druge hitre obroke. Aktualni jedilnik, delovni čas in morebitno dostavo preverite neposredno pri ponudniku.",
      "en": "Mega Burger near the main bus station serves burgers and other quick meals. Check the current menu, hours and delivery options directly with the provider.",
      "de": "Mega Burger am Hauptbusbahnhof bietet Burger und weitere schnelle Gerichte. Aktuelle Speisekarte, Öffnungszeiten und Liefermöglichkeiten direkt beim Anbieter prüfen.",
      "hr": "Mega Burger kod glavnog autobusnog kolodvora nudi burgere i druge brze obroke. Aktualni jelovnik, radno vrijeme i dostavu provjerite izravno kod ponuditelja.",
      "sr": "Mega Burger kod glavne autobuske stanice nudi burgere i druge brze obroke. Aktuelni jelovnik, radno vreme i dostavu proverite direktno kod prodavca."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "location": {
      "name": "Mega Burger",
      "address": "Cesta svobode 4a, 4260 Bled",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Mega%20Burger%20Cesta%20svobode%204a%2C%204260%20Bled"
    },
    "websiteSlug": "mega-burger"
  }
]

export const SEED_SUGGESTIONS: SeedSuggestion[] = [
  {
    "image": "/suggestions/pletna.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "S pletno na Blejski otok",
      "en": "Pletna boat to Bled Island",
      "de": "Mit der Pletna zur Bleder Insel",
      "hr": "Pletnom do Bledskog otoka",
      "sr": "Pletnom do Bledskog ostrva"
    },
    "description": {
      "sl": "Tradicionalna pletna vozi na Blejski otok tudi pozimi, z omejenim urnikom. Pred odhodom preverite vozni red in vreme pri čolnarju.",
      "en": "Traditional pletna boats also serve Bled Island in winter, with shorter hours. Check departures and weather with the boat operator.",
      "de": "Traditionelle Pletna-Boote fahren auch im Winter zur Insel, mit kürzeren Betriebszeiten. Abfahrten und Wetter beim Bootsführer prüfen.",
      "hr": "Tradicionalne pletne voze do otoka i zimi, uz kraće radno vrijeme. Provjerite polaske i vrijeme kod čamčara.",
      "sr": "Tradicionalne pletne plove do ostrva i zimi, uz kraće radno vreme. Proverite polaske i vremenske uslove kod čamdžije."
    },
    "buttons": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bled.si/en/what-to-see-do/attractions/38/1/"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Pletna%20Mlino%20Bled%20Slovenia"
      }
    ],
    "websiteSlug": "pletna-island"
  },
  {
    "image": "/suggestions/carriage.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Vožnja s kočijo po Bledu",
      "en": "Horse-drawn carriage rides in Bled",
      "de": "Kutschfahrt in Bled",
      "hr": "Vožnja kočijom po Bledu",
      "sr": "Vožnja kočijom po Bledu"
    },
    "description": {
      "sl": "Blejski fijakarji ponujajo vožnje s kočijo. Pozimi je ponudba omejena; za termin, ceno in pot se dogovorite neposredno s kočijažem.",
      "en": "Bled coachmen offer horse-drawn carriage rides. Winter service is limited; agree on the departure, price and route directly with the driver.",
      "de": "Bleder Kutscher bieten Kutschfahrten an. Im Winter ist das Angebot eingeschränkt; Abfahrt, Preis und Strecke direkt vereinbaren.",
      "hr": "Blejski fijakeri nude vožnje kočijom. Zimi je ponuda ograničena; termin, cijenu i rutu dogovorite izravno s kočijašem.",
      "sr": "Blejski fijakeri nude vožnje kočijom. Zimi je ponuda ograničena; termin, cenu i rutu dogovorite direktno sa kočijašem."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Fijaker%20Bled%20Festival%20Hall%20Cesta%20svobode"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bled.si/en/information/getting-around-bled/"
      }
    ],
    "websiteSlug": "horse-carriages"
  },
  {
    "image": "/suggestions/ojstrica.webp",
    "recurring": true,
    "validFrom": "04-01",
    "validTo": "10-31",
    "title": {
      "sl": "Ojstrica: razgled na Blejsko jezero",
      "en": "Ojstrica: views over Lake Bled",
      "de": "Ojstrica: Blick auf den Bleder See",
      "hr": "Ojstrica: pogled na Bledsko jezero",
      "sr": "Ojstrica: pogled na Bledsko jezero"
    },
    "description": {
      "sl": "Kratek, mestoma strm vzpon iz Velike Zake vodi do razgleda na jezero. Izberite suho vreme in primerno obutev; v snegu ali ledu obisk ni običajen sprehod.",
      "en": "A short, sometimes steep climb from Velika Zaka leads to lake views. Choose dry conditions and suitable footwear; snow and ice require a different level of preparation.",
      "de": "Ein kurzer, teils steiler Aufstieg ab Velika Zaka führt zum Seeblick. Trockene Bedingungen und passende Schuhe wählen; Schnee und Eis erfordern besondere Vorbereitung.",
      "hr": "Kratak, mjestimice strm uspon iz Velike Zake vodi do pogleda na jezero. Odaberite suho vrijeme i odgovarajuću obuću; snijeg i led zahtijevaju posebnu pripremu.",
      "sr": "Kratak, mestimično strm uspon iz Velike Zake vodi do pogleda na jezero. Birajte suvo vreme i odgovarajuću obuću; sneg i led zahtevaju posebnu pripremu."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Ojstrica%20viewpoint%20Bled%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bled.si/sl/kaj-videti-poceti/znamenitosti/4/ojstrica/"
      }
    ],
    "websiteSlug": "ojstrica"
  },
  {
    "image": "/suggestions/skiing.webp",
    "recurring": true,
    "validFrom": "12-01",
    "validTo": "03-31",
    "title": {
      "sl": "Smučanje v okolici Bleda",
      "en": "Skiing near Bled",
      "de": "Skifahren rund um Bled",
      "hr": "Skijanje u okolici Bleda",
      "sr": "Skijanje u okolini Bleda"
    },
    "description": {
      "sl": "Za smučanje preverite Kranjsko Goro, Vogel ali Krvavec. Sezona je odvisna od snega; pred odhodom preverite odprte proge in naprave pri upravljavcu.",
      "en": "For skiing, consider Kranjska Gora, Vogel or Krvavec. The season depends on snow; check open slopes and lifts with the operator before travelling.",
      "de": "Zum Skifahren kommen Kranjska Gora, Vogel oder Krvavec infrage. Die Saison hängt vom Schnee ab; offene Pisten und Lifte vor der Anreise prüfen.",
      "hr": "Za skijanje razmotrite Kranjsku Goru, Vogel ili Krvavec. Sezona ovisi o snijegu; prije polaska provjerite otvorene staze i žičare.",
      "sr": "Za skijanje razmotrite Kranjsku Goru, Vogel ili Krvavec. Sezona zavisi od snega; pre polaska proverite otvorene staze i žičare."
    },
    "buttons": [
      {
        "label": {
          "sl": "Kranjska Gora",
          "en": "Kranjska Gora",
          "de": "Kranjska Gora",
          "hr": "Kranjska Gora",
          "sr": "Kranjska Gora"
        },
        "href": "https://kranjska-gora.si/"
      },
      {
        "label": {
          "sl": "Vogel",
          "en": "Vogel",
          "de": "Vogel",
          "hr": "Vogel",
          "sr": "Vogel"
        },
        "href": "https://vogel.si/"
      },
      {
        "label": {
          "sl": "Krvavec",
          "en": "Krvavec",
          "de": "Krvavec",
          "hr": "Krvavec",
          "sr": "Krvavec"
        },
        "href": "https://www.rtc-krvavec.si/"
      }
    ],
    "websiteSlug": "skiing"
  },
  {
    "image": "/suggestions/sledding.webp",
    "recurring": true,
    "validFrom": "12-01",
    "validTo": "03-31",
    "title": {
      "sl": "Sankanje na urejenih sankališčih",
      "en": "Sledding on designated runs",
      "de": "Rodeln auf ausgewiesenen Bahnen",
      "hr": "Sanjkanje na uređenim stazama",
      "sr": "Sankanje na uređenim stazama"
    },
    "description": {
      "sl": "Za družinsko sankanje preverite ponudbo Zatrnika. Obratovanje je odvisno od snega in termina; uporabite le odprto, za sankanje namenjeno progo.",
      "en": "For family sledding, check Zatrnik. Availability depends on snow and operating dates; use only an open, designated sledding run.",
      "de": "Für Familienrodeln das Angebot in Zatrnik prüfen. Betrieb je nach Schnee und Termin; nur geöffnete, ausgewiesene Rodelbahnen nutzen.",
      "hr": "Za obiteljsko sanjkanje provjerite Zatrnik. Rad ovisi o snijegu i terminu; koristite samo otvorenu stazu namijenjenu sanjkanju.",
      "sr": "Za porodično sankanje proverite Zatrnik. Rad zavisi od snega i termina; koristite samo otvorenu stazu namenjenu sankanju."
    },
    "buttons": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.zatrnik.com/"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=RTC%20Zatrnik%20Slovenia"
      }
    ],
    "websiteSlug": "sledding"
  },
  {
    "image": "/suggestions/vintgar.webp",
    "recurring": true,
    "validFrom": "04-01",
    "validTo": "10-31",
    "title": {
      "sl": "Odkrijte sotesko Vintgar: Naravni čudež blizu Bleda",
      "en": "Discover Vintgar Gorge near Bled",
      "de": "Die Vintgar-Klamm bei Bled entdecken",
      "hr": "Otkrijte sutjesku Vintgar kod Bleda",
      "sr": "Otkrijte klisuru Vintgar kod Bleda"
    },
    "description": {
      "sl": "Sotesko je izoblikovala reka Radovna. Obisk je sezonski, praviloma od aprila do oktobra. Pred obiskom na uradni strani preverite odprtost, vstopnice in način dostopa; pozimi je soteska zaprta.",
      "en": "The Radovna River carved this gorge. Visits are seasonal, usually April to October. Check opening status, tickets and access arrangements on the official website; the gorge closes in winter.",
      "de": "Die Radovna hat diese Klamm geformt. Besuche sind saisonal, meist April bis Oktober. Öffnung, Tickets und Anreise auf der offiziellen Website prüfen; im Winter ist die Klamm geschlossen.",
      "hr": "Sutjesku je oblikovala rijeka Radovna. Posjeti su sezonski, uglavnom od travnja do listopada. Na službenoj stranici provjerite otvorenost, ulaznice i pristup; zimi je zatvorena.",
      "sr": "Klisuru je oblikovala reka Radovna. Posete su sezonske, uglavnom od aprila do oktobra. Na zvaničnom sajtu proverite otvorenost, ulaznice i pristup; zimi je zatvorena."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Vintgar%20Gorge%20entrance%20Podhom%2080%20Slovenia"
      },
      {
        "label": {
          "sl": "Preveri odprtost in vstopnice",
          "en": "Check opening and tickets",
          "de": "Öffnungszeiten und Tickets",
          "hr": "Provjeri otvorenost i ulaznice",
          "sr": "Proveri otvorenost i ulaznice"
        },
        "href": "https://www.vintgar.si/en/my-visit/opening-hours/"
      }
    ],
    "websiteSlug": "vintgar-gorge"
  },
  {
    "image": "/suggestions/pokluska-soteska.webp",
    "recurring": true,
    "validFrom": "04-01",
    "validTo": "10-31",
    "title": {
      "sl": "Sprehod skozi Pokljuško sotesko",
      "en": "A walk through Pokljuka Gorge",
      "de": "Wanderung durch die Pokljuka-Klamm",
      "hr": "Šetnja kroz Pokljušku sutjesku",
      "sr": "Šetnja kroz Pokljušku klisuru"
    },
    "description": {
      "sl": "Gozdna pot vodi med skalnimi stenami in galerijami. Pred obiskom preverite stanje poti pri Triglavskem narodnem parku. Za običajen pohod izberite kopne razmere in pohodno obutev.",
      "en": "A forest trail passes rock walls and galleries. Check trail conditions with Triglav National Park before visiting. Choose snow-free conditions and walking shoes for a regular hike.",
      "de": "Ein Waldweg führt zwischen Felswänden und Galerien hindurch. Den Wegzustand beim Nationalpark Triglav prüfen. Für eine normale Wanderung schneefreie Bedingungen und Wanderschuhe wählen.",
      "hr": "Šumska staza prolazi među stijenama i galerijama. Prije posjeta provjerite stanje staze kod Nacionalnog parka Triglav. Za običan izlet odaberite uvjete bez snijega i planinarsku obuću.",
      "sr": "Šumska staza prolazi između stena i galerija. Pre posete proverite stanje staze kod Nacionalnog parka Triglav. Za običan izlet birajte uslove bez snega i planinarsku obuću."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Pokljuka%20Gorge%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.tnp.si/en/visiting-park/activities/hiking/pokljuka-gorge/"
      }
    ],
    "websiteSlug": "pokljuka-gorge"
  },
  {
    "image": "/suggestions/radovna.webp",
    "recurring": true,
    "validFrom": "04-01",
    "validTo": "10-31",
    "title": {
      "sl": "Izlet v dolino Radovne",
      "en": "A trip to the Radovna Valley",
      "de": "Ausflug ins Radovna-Tal",
      "hr": "Izlet u dolinu Radovne",
      "sr": "Izlet u dolinu Radovne"
    },
    "description": {
      "sl": "Dolino Radovne lahko raziskujete peš ali s kolesom po primernih označenih poteh. Pred izletom preverite vreme in dostop; v hladnejšem delu leta so možni sneg, led in zapore.",
      "en": "Explore the Radovna Valley on suitable marked walking or cycling routes. Check weather and access before setting out; snow, ice and closures are possible in colder months.",
      "de": "Das Radovna-Tal lässt sich auf geeigneten markierten Wegen zu Fuß oder mit dem Fahrrad erkunden. Wetter und Zugang prüfen; in kalten Monaten sind Schnee, Eis und Sperren möglich.",
      "hr": "Dolinu Radovne istražite pješice ili biciklom po prikladnim označenim stazama. Provjerite vrijeme i pristup; u hladnijim mjesecima mogući su snijeg, led i zatvaranja.",
      "sr": "Dolinu Radovne istražite peške ili biciklom po odgovarajućim označenim stazama. Proverite vreme i pristup; u hladnijim mesecima mogući su sneg, led i zatvaranja."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Radovna%20Valley%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.tnp.si/en/"
      }
    ],
    "websiteSlug": "radovna-valley"
  },
  {
    "image": "/suggestions/soca.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Izlet v dolino Soče",
      "en": "A day trip to the Soča Valley",
      "de": "Tagesausflug ins Soča-Tal",
      "hr": "Jednodnevni izlet u dolinu Soče",
      "sr": "Jednodnevni izlet u dolinu Soče"
    },
    "description": {
      "sl": "Izberite kraj v dolini Soče in načrtujte dovolj časa za vožnjo. Pred odhodom preverite ceste; prelaz Vršič je pozimi lahko zaprt. Vodne aktivnosti rezervirajte pri ponudniku.",
      "en": "Choose a destination in the Soča Valley and allow enough driving time. Check road conditions; the Vršič pass may close in winter. Book water activities with an operator.",
      "de": "Ein Ziel im Soča-Tal auswählen und ausreichend Fahrzeit einplanen. Straßenlage prüfen; der Vršič-Pass kann im Winter geschlossen sein. Wassersport beim Anbieter buchen.",
      "hr": "Odaberite odredište u dolini Soče i planirajte dovoljno vremena za vožnju. Provjerite ceste; prijevoj Vršič zimi može biti zatvoren. Vodene aktivnosti rezervirajte kod ponuditelja.",
      "sr": "Odaberite odredište u dolini Soče i planirajte dovoljno vremena za vožnju. Proverite puteve; prevoj Vršič zimi može biti zatvoren. Vodene aktivnosti rezervišite kod organizatora."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Bovec%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.soca-valley.com/en/"
      }
    ],
    "websiteSlug": "soca-river"
  },
  {
    "image": "/suggestions/zelenci.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Naravni rezervat Zelenci",
      "en": "Zelenci Nature Reserve",
      "de": "Naturschutzgebiet Zelenci",
      "hr": "Prirodni rezervat Zelenci",
      "sr": "Prirodni rezervat Zelenci"
    },
    "description": {
      "sl": "Zelenci pri Kranjski Gori so primerni za krajši obisk po urejenih poteh. Ostanite na označenih površinah in pred odhodom preverite vreme; pozimi so poti lahko poledenele.",
      "en": "Zelenci near Kranjska Gora offers a short visit on designated paths. Stay on marked surfaces and check weather; paths may be icy in winter.",
      "de": "Zelenci bei Kranjska Gora eignet sich für einen kurzen Besuch auf ausgewiesenen Wegen. Markierte Flächen nicht verlassen; im Winter können die Wege vereist sein.",
      "hr": "Zelenci kod Kranjske Gore pogodni su za kraći posjet uređenim stazama. Ostanite na označenim površinama i provjerite vrijeme; zimi staze mogu biti zaleđene.",
      "sr": "Zelenci kod Kranjske Gore pogodni su za kraću posetu uređenim stazama. Ostanite na označenim površinama i proverite vreme; zimi staze mogu biti zaleđene."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Zelenci%20Nature%20Reserve%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://kranjska-gora.si/znamenitosti/naravni-rezervat-zelenci"
      }
    ],
    "websiteSlug": "zelenci"
  },
  {
    "image": "/suggestions/bohinj.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Izlet do Bohinjskega jezera",
      "en": "A trip to Lake Bohinj",
      "de": "Ausflug zum Bohinjer See",
      "hr": "Izlet do Bohinjskog jezera",
      "sr": "Izlet do Bohinjskog jezera"
    },
    "description": {
      "sl": "Bohinjsko jezero lahko obiščete vse leto. Izberite sprehod, primeren vremenu in letnemu času; pred vožnjo preverite parkirišča, javni prevoz in morebitne omejitve dostopa.",
      "en": "Lake Bohinj can be visited throughout the year. Choose a walk suited to the weather and season; check parking, public transport and access restrictions before travelling.",
      "de": "Der Bohinjer See ist ganzjährig ein Ausflugsziel. Spaziergänge nach Wetter und Jahreszeit wählen; Parkmöglichkeiten, öffentliche Verkehrsmittel und Zugangsbeschränkungen vorab prüfen.",
      "hr": "Bohinjsko jezero možete posjetiti tijekom cijele godine. Šetnju prilagodite vremenu i sezoni; prije polaska provjerite parkirališta, javni prijevoz i ograničenja pristupa.",
      "sr": "Bohinjsko jezero možete posetiti tokom cele godine. Šetnju prilagodite vremenu i sezoni; pre polaska proverite parking, javni prevoz i ograničenja pristupa."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Lake%20Bohinj%20Rib%C4%8Dev%20Laz%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bohinj.si/en/"
      }
    ],
    "websiteSlug": "lake-bohinj"
  },
  {
    "image": "/suggestions/radovljica.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Radovljica, Begunje in Kropa",
      "en": "Radovljica, Begunje and Kropa",
      "de": "Radovljica, Begunje und Kropa",
      "hr": "Radovljica, Begunje i Kropa",
      "sr": "Radovljica, Begunje i Kropa"
    },
    "description": {
      "sl": "Sprehodite se po starem jedru Radovljice ter obiščite Begunje ali Kropo. Kraji so zanimivi vse leto; odpiralni časi muzejev in ogledov se spreminjajo.",
      "en": "Walk through Radovljica’s old town and visit Begunje or Kropa. The towns are worth exploring year-round; museum and tour opening times vary.",
      "de": "Die Altstadt von Radovljica erkunden und Begunje oder Kropa besuchen. Die Orte sind ganzjährig interessant; Öffnungszeiten von Museen und Führungen variieren.",
      "hr": "Prošećite starom jezgrom Radovljice te posjetite Begunje ili Kropu. Mjesta su zanimljiva cijele godine; radno vrijeme muzeja i razgleda se mijenja.",
      "sr": "Prošetajte starim jezgrom Radovljice i posetite Begunje ili Kropu. Mesta su zanimljiva cele godine; radno vreme muzeja i obilazaka se menja."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Linhartov%20trg%20Radovljica%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.radolca.si/en"
      }
    ],
    "websiteSlug": "radovljica"
  },
  {
    "image": "/suggestions/predjama.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Postojnska jama in Predjamski grad",
      "en": "Postojna Cave and Predjama Castle",
      "de": "Höhle von Postojna und Burg Predjama",
      "hr": "Postojnska jama i Predjamski dvorac",
      "sr": "Postojnska jama i Predjamski zamak"
    },
    "description": {
      "sl": "Ogled jame lahko združite z obiskom Predjamskega gradu. Pred odhodom preverite termine in kupite ustrezne vstopnice. V jami je hladno, zato vzemite dodatno oblačilo.",
      "en": "Combine a cave tour with Predjama Castle. Check tour times and tickets before travelling. Bring an extra layer, as the cave is cool.",
      "de": "Eine Höhlenführung lässt sich mit der Burg Predjama verbinden. Termine und Tickets vorab prüfen. Für die kühle Höhle eine zusätzliche Kleidungsschicht mitnehmen.",
      "hr": "Obilazak jame možete spojiti s posjetom Predjamskom dvorcu. Provjerite termine i ulaznice prije polaska. U jami je hladno pa ponesite dodatnu odjeću.",
      "sr": "Obilazak jame možete spojiti sa posetom Predjamskom zamku. Proverite termine i ulaznice pre polaska. U jami je hladno pa ponesite dodatnu odeću."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Postojna%20Cave%20Jamska%20cesta%2030%20Slovenia"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Predjama%20Castle%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.postojnska-jama.eu/en/"
      }
    ],
    "websiteSlug": "postojna-cave"
  },
  {
    "image": "/suggestions/horseriding.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Blejske konjeniške pustolovščine: Jahanje v naravi",
      "en": "Horse riding near Bled",
      "de": "Reiten rund um Bled",
      "hr": "Jahanje u okolici Bleda",
      "sr": "Jahanje u okolini Bleda"
    },
    "description": {
      "sl": "Za jahanje pri Konjeniškem klubu Palomino v Koritnem se dogovorite neposredno s ponudnikom. Povejte, koliko izkušenj imate; termin in program sta odvisna od razpoložljivosti in vremena.",
      "en": "Contact Palomino Equestrian Club in Koritno directly to arrange horse riding. Explain your experience level; dates and programmes depend on availability and weather.",
      "de": "Reiten direkt mit dem Reitclub Palomino in Koritno vereinbaren. Die eigene Erfahrung angeben; Termine und Programm hängen von Verfügbarkeit und Wetter ab.",
      "hr": "Jahanje u Konjičkom klubu Palomino u Koritnom dogovorite izravno s ponuditeljem. Navedite svoje iskustvo; termin i program ovise o raspoloživosti i vremenu.",
      "sr": "Jahanje u Konjičkom klubu Palomino u Koritnom dogovorite direktno sa organizatorom. Navedite svoje iskustvo; termin i program zavise od raspoloživosti i vremena."
    },
    "buttons": [
      {
        "label": {
          "sl": "Pokliči Palomino",
          "en": "Call Palomino",
          "de": "Palomino anrufen",
          "hr": "Nazovi Palomino",
          "sr": "Pozovi Palomino"
        },
        "href": "tel:+38640887486",
        "target": "_self"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bled.si/en/what-to-see-do/activities/8/1/"
      }
    ],
    "websiteSlug": "horse-ridding"
  },
  {
    "image": "/suggestions/ljubljana.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Izlet v Ljubljano",
      "en": "A trip to Ljubljana",
      "de": "Ausflug nach Ljubljana",
      "hr": "Izlet u Ljubljanu",
      "sr": "Izlet u Ljubljanu"
    },
    "description": {
      "sl": "Ljubljano lahko raziskujete vse leto. Sprehodite se po starem mestnem jedru in ob Ljubljanici; za muzeje, grad in dogodke preverite aktualni urnik.",
      "en": "Explore Ljubljana year-round. Walk through the old town and along the Ljubljanica River; check current schedules for museums, the castle and events.",
      "de": "Ljubljana lässt sich ganzjährig erkunden. Durch die Altstadt und an der Ljubljanica spazieren; aktuelle Zeiten für Museen, Burg und Veranstaltungen prüfen.",
      "hr": "Ljubljanu možete istraživati cijele godine. Prošećite starom jezgrom i uz Ljubljanicu; za muzeje, dvorac i događanja provjerite aktualni raspored.",
      "sr": "Ljubljanu možete istraživati cele godine. Prošetajte starim jezgrom i uz Ljubljanicu; za muzeje, zamak i događaje proverite aktuelni raspored."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Pre%C5%A1eren%20Square%20Ljubljana%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.visitljubljana.com/en/visitors/"
      }
    ],
    "websiteSlug": "ljubljana"
  },
  {
    "image": "/suggestions/velikaplanina.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Obisk Velike planine",
      "en": "Visiting Velika planina",
      "de": "Besuch auf der Velika planina",
      "hr": "Posjet Velikoj planini",
      "sr": "Poseta Velikoj planini"
    },
    "description": {
      "sl": "Na Veliki planini lahko spoznate pastirsko naselje in izberete sprehod po svojih zmožnostih. Pred odhodom preverite vreme ter obratovanje nihalke in sedežnice; pozimi veljajo drugačne razmere.",
      "en": "Visit the herders’ settlement on Velika planina and choose a walk that suits your ability. Check weather, cable car and chairlift operation; winter conditions require different preparation.",
      "de": "Die Hirtensiedlung auf der Velika planina besuchen und einen passenden Spaziergang wählen. Wetter sowie Seilbahn- und Sesselliftbetrieb prüfen; Winterbedingungen erfordern andere Vorbereitung.",
      "hr": "Posjetite pastirsko naselje na Velikoj planini i odaberite šetnju prema svojim mogućnostima. Provjerite vrijeme te rad žičare i sjedežnice; zimi su uvjeti drukčiji.",
      "sr": "Posetite pastirsko naselje na Velikoj planini i izaberite šetnju prema svojim mogućnostima. Proverite vreme i rad žičare; zimi su uslovi drugačiji."
    },
    "buttons": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.velikaplanina.si/en/"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Velika%20planina%20cable%20car%20Kamni%C5%A1ka%20Bistrica%20Slovenia"
      }
    ],
    "websiteSlug": "velika-planina"
  },
  {
    "image": "/suggestions/ziplinedolinka.webp",
    "recurring": true,
    "validFrom": "03-01",
    "validTo": "11-30",
    "title": {
      "sl": "Spust po jeklenicah Zipline Dolinka",
      "en": "Zipline Dolinka",
      "de": "Zipline Dolinka",
      "hr": "Zipline Dolinka",
      "sr": "Zipline Dolinka"
    },
    "description": {
      "sl": "Voden spust po jeklenicah poteka v dolini Save Dolinke, praviloma od marca do novembra, odvisno od vremena. Rezervirajte termin in preverite navodila; zbirno mesto je Cesta svobode 1, Bled.",
      "en": "Guided zipline tours run in the Sava Dolinka valley, usually March to November, weather permitting. Book ahead and check instructions; the meeting point is Cesta svobode 1, Bled.",
      "de": "Geführte Zipline-Touren im Tal der Sava Dolinka finden meist März bis November statt, wetterabhängig. Vorab buchen und Hinweise prüfen; Treffpunkt: Cesta svobode 1, Bled.",
      "hr": "Vođeni zipline izleti u dolini Save Dolinke obično traju od ožujka do studenoga, ovisno o vremenu. Rezervirajte termin i provjerite upute; okupljanje je na Cesti svobode 1, Bled.",
      "sr": "Vođeni zipline izleti u dolini Save Dolinke obično traju od marta do novembra, zavisno od vremena. Rezervišite termin i proverite uputstva; okupljanje je na Cesti svobode 1, Bled."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Zipline%20Dolinka%20Cesta%20svobode%201%20Bled"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://zipline-dolinka.si/sl/pogosta-vprasanja/"
      }
    ],
    "websiteSlug": "zipline-dolinka"
  },
  {
    "image": "/suggestions/piran.webp",
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31",
    "title": {
      "sl": "Enodnevni izlet v Piran in Portorož",
      "en": "A day trip to Piran and Portorož",
      "de": "Tagesausflug nach Piran und Portorož",
      "hr": "Jednodnevni izlet u Piran i Portorož",
      "sr": "Jednodnevni izlet u Piran i Portorož"
    },
    "description": {
      "sl": "Piran in Portorož sta možnosti za celodnevni izlet na obalo. Pred odhodom preverite promet in parkiranje; poleti pričakujte več gneče, pozimi pa spremljajte vreme.",
      "en": "Piran and Portorož are options for a full-day coastal trip. Check traffic and parking; expect more visitors in summer and keep an eye on winter weather.",
      "de": "Piran und Portorož eignen sich für einen ganztägigen Küstenausflug. Verkehr und Parkmöglichkeiten prüfen; im Sommer mehr Besucher, im Winter die Wetterlage beachten.",
      "hr": "Piran i Portorož mogućnosti su za cjelodnevni izlet na obalu. Provjerite promet i parkiranje; ljeti očekujte veću gužvu, a zimi pratite vrijeme.",
      "sr": "Piran i Portorož su mogućnosti za celodnevni izlet na obalu. Proverite saobraćaj i parking; leti očekujte veću gužvu, a zimi pratite vreme."
    },
    "buttons": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Tartini%20Square%20Piran%20Slovenia"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Portoro%C5%BE%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.portoroz.si/en"
      }
    ],
    "websiteSlug": "sea-side"
  },
  {
    "image": "/suggestions/alpe.webp",
    "recurring": true,
    "validFrom": "06-01",
    "validTo": "09-30",
    "title": {
      "sl": "Pohodništvo v Julijskih Alpah",
      "en": "Hiking in the Julian Alps",
      "de": "Wandern in den Julischen Alpen",
      "hr": "Planinarenje u Julijskim Alpama",
      "sr": "Planinarenje u Julijskim Alpima"
    },
    "description": {
      "sl": "Izberite označeno pot, primerno svoji pripravljenosti. Za običajne visokogorske ture načrtujte poletno sezono ter preverite vreme, odprtost poti in koč. Sneg lahko ostane tudi poleti.",
      "en": "Choose a marked route that matches your fitness. Plan ordinary high-mountain hikes for summer and check weather, trail and hut status. Snow can remain even in summer.",
      "de": "Eine markierte Route passend zur Kondition wählen. Normale Hochgebirgstouren für den Sommer planen; Wetter, Wege und Hütten prüfen. Auch im Sommer kann Schnee liegen.",
      "hr": "Odaberite označenu stazu prema svojoj kondiciji. Obične visokogorske ture planirajte ljeti i provjerite vrijeme, staze i domove. Snijeg se može zadržati i ljeti.",
      "sr": "Izaberite označenu stazu prema svojoj kondiciji. Uobičajene visokogorske ture planirajte leti i proverite vreme, staze i domove. Sneg može ostati i leti."
    },
    "buttons": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.tnp.si/en/visiting-park/activities/hiking/"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://en.pzs.si/"
      }
    ],
    "websiteSlug": "mountains"
  }
]

export const SEED_FAQ: SeedFaq[] = [
  {
    "title": {
      "sl": "Zajtrk pri Bled Breakfast",
      "en": "Breakfast from Bled Breakfast",
      "de": "Frühstück von Bled Breakfast",
      "hr": "Doručak od Bled Breakfast",
      "sr": "Doručak od Bled Breakfast"
    },
    "description": {
      "sl": "Zajtrk naročite neposredno pri Bled Breakfast. Aktualno vsebino košaric, dostavo, cene in razpoložljivost preverite na njihovi spletni strani; naročila ne oddajate prek portala.",
      "en": "Order breakfast directly from Bled Breakfast. Check basket contents, delivery, prices and availability on their website; orders are not placed through this portal.",
      "de": "Frühstück direkt bei Bled Breakfast bestellen. Inhalt, Lieferung, Preise und Verfügbarkeit auf deren Website prüfen; Bestellungen erfolgen nicht über dieses Portal.",
      "hr": "Doručak naručite izravno kod Bled Breakfast. Sadržaj košarica, dostavu, cijene i dostupnost provjerite na njihovoj stranici; ne naručujete preko ovog portala.",
      "sr": "Doručak naručite direktno kod Bled Breakfast. Sadržaj korpi, dostavu, cene i dostupnost proverite na njihovom sajtu; ne naručujete preko ovog portala."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bledbreakfast.com/"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Trgovine z živili",
      "en": "Grocery shops",
      "de": "Lebensmittelgeschäfte",
      "hr": "Trgovine namirnicama",
      "sr": "Prodavnice namirnica"
    },
    "description": {
      "sl": "Za nakup živil preverite poslovalnice Mercator in SPAR na Bledu. Lokacijo in aktualni delovni čas, zlasti ob nedeljah in praznikih, preverite v uradnem iskalniku poslovalnic.",
      "en": "For groceries, check Mercator and SPAR shops in Bled. Use their official store finders for locations and current hours, especially on Sundays and public holidays.",
      "de": "Für Lebensmittel kommen Mercator und SPAR in Bled infrage. Standorte und aktuelle Zeiten, besonders sonntags und an Feiertagen, in den offiziellen Filialfindern prüfen.",
      "hr": "Za namirnice provjerite trgovine Mercator i SPAR na Bledu. Lokacije i radno vrijeme, osobito nedjeljom i blagdanima, provjerite u službenim tražilicama poslovnica.",
      "sr": "Za namirnice proverite prodavnice Mercator i SPAR na Bledu. Lokacije i radno vreme, posebno nedeljom i praznicima, proverite u zvaničnim pretragama poslovnica."
    },
    "links": [
      {
        "label": {
          "sl": "Mercator: poslovalnice",
          "en": "Mercator stores",
          "de": "Mercator-Filialen",
          "hr": "Mercator poslovnice",
          "sr": "Mercator prodavnice"
        },
        "href": "https://www.mercator.si/prodajna-mesta/"
      },
      {
        "label": {
          "sl": "SPAR: poslovalnice",
          "en": "SPAR stores",
          "de": "SPAR-Filialen",
          "hr": "SPAR poslovnice",
          "sr": "SPAR prodavnice"
        },
        "href": "https://www.spar.si/trgovine"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Peš do Blejskega jezera",
      "en": "Walking to Lake Bled",
      "de": "Zu Fuß zum Bleder See",
      "hr": "Pješice do Bledskog jezera",
      "sr": "Peške do Bledskog jezera"
    },
    "description": {
      "sl": "Do jezera se lahko odpravite peš. Del lokalne poti nima pločnika, zato bodite previdni. Povezava prikazuje lokacijo jezera, ne vnaprej določene poti iz apartmaja.",
      "en": "You can walk to the lake. Part of the local approach has no pavement, so take care. The link shows the lake location, not a preset route from the apartment.",
      "de": "Der See ist zu Fuß erreichbar. Ein Teil des örtlichen Zugangs hat keinen Gehweg; bitte vorsichtig sein. Der Link zeigt den See, keine vorgegebene Route ab der Wohnung.",
      "hr": "Do jezera možete pješice. Dio lokalnog prilaza nema pločnik pa budite oprezni. Poveznica prikazuje jezero, a ne unaprijed određenu rutu iz apartmana.",
      "sr": "Do jezera možete peške. Deo lokalnog prilaza nema trotoar pa budite oprezni. Link prikazuje jezero, a ne unapred određenu rutu iz apartmana."
    },
    "links": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Lake%20Bled%20Slovenia"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Peš do Blejskega gradu",
      "en": "Walking to Bled Castle",
      "de": "Zu Fuß zur Bleder Burg",
      "hr": "Pješice do Bledskog dvorca",
      "sr": "Peške do Bledskog zamka"
    },
    "description": {
      "sl": "Pešpoti do gradu vključujejo vzpon in stopnice. Izberite dostop glede na svoje zmožnosti, zlasti z otroškim vozičkom. Pred obiskom preverite odpiralni čas in vstopnice.",
      "en": "Walking routes to the castle include an ascent and steps. Choose access that suits your needs, especially with a pushchair. Check opening hours and tickets before visiting.",
      "de": "Fußwege zur Burg führen bergauf und über Treppen. Einen passenden Zugang wählen, besonders mit Kinderwagen. Öffnungszeiten und Tickets vorab prüfen.",
      "hr": "Pješačke staze do dvorca uključuju uspon i stepenice. Pristup prilagodite svojim mogućnostima, posebno s kolicima. Prije posjeta provjerite radno vrijeme i ulaznice.",
      "sr": "Pešačke staze do zamka uključuju uspon i stepenice. Pristup prilagodite svojim mogućnostima, posebno sa kolicima. Pre posete proverite radno vreme i ulaznice."
    },
    "links": [
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Bled%20Castle%20Grajska%20cesta%2061%20Slovenia"
      },
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.blejski-grad.si/en/"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Aktivnosti na prostem",
      "en": "Outdoor activities",
      "de": "Aktivitäten im Freien",
      "hr": "Aktivnosti na otvorenom",
      "sr": "Aktivnosti na otvorenom"
    },
    "description": {
      "sl": "Ponudbo vodenih aktivnosti preverite pri OUTdoor Capital. Razpoložljivost, zahtevnost, starostne omejitve in sezono preverite za izbrani program neposredno pri organizatorju.",
      "en": "Check guided activities with OUTdoor Capital. Ask the organiser about availability, difficulty, age limits and the season for your chosen programme.",
      "de": "Geführte Aktivitäten bei OUTdoor Capital ansehen. Verfügbarkeit, Anforderungen, Altersgrenzen und Saison für das gewünschte Programm direkt beim Veranstalter erfragen.",
      "hr": "Ponudu vođenih aktivnosti provjerite kod OUTdoor Capital. Dostupnost, zahtjevnost, dobna ograničenja i sezonu provjerite za odabrani program kod organizatora.",
      "sr": "Ponudu vođenih aktivnosti proverite kod OUTdoor Capital. Dostupnost, zahtevnost, starosna ograničenja i sezonu proverite za odabrani program kod organizatora."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://outdoor.capital/maple-pine-bled/"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Pekarne v okolici",
      "en": "Bakeries nearby",
      "de": "Bäckereien in der Umgebung",
      "hr": "Pekare u okolici",
      "sr": "Pekare u okolini"
    },
    "description": {
      "sl": "V okolici preverite ponudbo pekarn Hitri kruhek in Planika. Pred odhodom preverite lokacijo in delovni čas; nedeljski in praznični urniki se lahko razlikujejo.",
      "en": "Check Hitri kruhek and Planika bakeries in the area. Confirm the location and opening hours before setting out; Sunday and holiday hours may differ.",
      "de": "Die Bäckereien Hitri kruhek und Planika in der Umgebung prüfen. Standort und Öffnungszeiten vorab bestätigen; sonntags und an Feiertagen können andere Zeiten gelten.",
      "hr": "U okolici provjerite pekare Hitri kruhek i Planika. Prije polaska provjerite lokaciju i radno vrijeme; nedjeljom i blagdanima raspored se može razlikovati.",
      "sr": "U okolini proverite pekare Hitri kruhek i Planika. Pre polaska proverite lokaciju i radno vreme; nedeljom i praznicima raspored se može razlikovati."
    },
    "links": [
      {
        "label": {
          "sl": "Hitri kruhek",
          "en": "Hitri kruhek",
          "de": "Hitri kruhek",
          "hr": "Hitri kruhek",
          "sr": "Hitri kruhek"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Pekarna%20Hitri%20kruhek%20Ljubljanska%20cesta%2026%20Bled"
      },
      {
        "label": {
          "sl": "Planika",
          "en": "Planika",
          "de": "Planika",
          "hr": "Planika",
          "sr": "Planika"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Pekarna%20Planika%20Pre%C5%A1ernova%20cesta%2011%20Bled"
      },
      {
        "label": {
          "sl": "Pekarne Planika",
          "en": "Planika bakeries",
          "de": "Planika-Bäckereien",
          "hr": "Pekarne Planika",
          "sr": "Pekare Planika"
        },
        "href": "https://www.pekarna-planika.si/nase-pekarne"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Turistični vlakec okoli jezera",
      "en": "Tourist train around the lake",
      "de": "Touristenzug um den See",
      "hr": "Turistički vlakić oko jezera",
      "sr": "Turistički vozić oko jezera"
    },
    "description": {
      "sl": "Turistični vlakec vozi sezonsko: poleti praviloma vsak dan, maja in oktobra ob lepem vremenu predvsem ob koncih tedna. Pred vožnjo preverite aktualni vozni red in postajališča.",
      "en": "The tourist train is seasonal: usually daily in summer, and mainly weekends in May and October in good weather. Check the current timetable and stops before travelling.",
      "de": "Der Touristenzug fährt saisonal: im Sommer meist täglich, im Mai und Oktober bei gutem Wetter vor allem am Wochenende. Aktuellen Fahrplan und Haltestellen prüfen.",
      "hr": "Turistički vlakić vozi sezonski: ljeti uglavnom svakodnevno, a u svibnju i listopadu pretežno vikendom po lijepom vremenu. Provjerite aktualni vozni red i stajališta.",
      "sr": "Turistički vozić saobraća sezonski: leti uglavnom svakodnevno, a u maju i oktobru pretežno vikendom po lepom vremenu. Proverite aktuelni red vožnje i stanice."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bled.si/en/information/getting-around-bled/20190920131939/tourist-train/"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Zdravili%C5%A1ki%20park%20Bled%20Slovenia"
      }
    ],
    "recurring": true,
    "validFrom": "05-01",
    "validTo": "10-31"
  },
  {
    "title": {
      "sl": "Avtobusne povezave",
      "en": "Bus connections",
      "de": "Busverbindungen",
      "hr": "Autobusne linije",
      "sr": "Autobuske linije"
    },
    "description": {
      "sl": "Za odhode z Bleda preverite aktualne vozne rede. Sezonski in praznični urniki se lahko razlikujejo; preverite tudi izbrano postajališče.",
      "en": "Check current timetables for departures from Bled. Seasonal and holiday schedules may differ; confirm the stop for your chosen service.",
      "de": "Aktuelle Fahrpläne für Abfahrten ab Bled prüfen. Saison- und Feiertagsfahrpläne können abweichen; die passende Haltestelle bestätigen.",
      "hr": "Provjerite aktualne vozne redove za polaske s Bleda. Sezonski i blagdanski rasporedi mogu se razlikovati; provjerite i odabrano stajalište.",
      "sr": "Proverite aktuelne redove vožnje za polaske sa Bleda. Sezonski i praznični rasporedi mogu se razlikovati; proverite i izabranu stanicu."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.ap-ljubljana.si/"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Bled%20main%20bus%20station%20Cesta%20svobode%20Slovenia"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Železniške povezave",
      "en": "Train connections",
      "de": "Bahnverbindungen",
      "hr": "Željezničke veze",
      "sr": "Železničke veze"
    },
    "description": {
      "sl": "Bled Jezero je izhodišče za Bohinjsko progo, Lesce-Bled pa za povezave proti Ljubljani. Pred odhodom preverite vozni red, prestope in morebitne nadomestne prevoze.",
      "en": "Bled Jezero serves the Bohinj railway, while Lesce-Bled offers connections towards Ljubljana. Check timetables, changes and any replacement transport before travelling.",
      "de": "Bled Jezero liegt an der Wocheinerbahn; Lesce-Bled bietet Verbindungen Richtung Ljubljana. Fahrpläne, Umstiege und möglichen Ersatzverkehr vorab prüfen.",
      "hr": "Bled Jezero polazište je za Bohinjsku prugu, a Lesce-Bled za veze prema Ljubljani. Prije polaska provjerite vozni red, presjedanja i zamjenski prijevoz.",
      "sr": "Bled Jezero je polazište za Bohinjsku prugu, a Lesce-Bled za veze prema Ljubljani. Pre polaska proverite red vožnje, presedanja i zamenski prevoz."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://potniski.sz.si/"
      },
      {
        "label": {
          "sl": "Bled Jezero",
          "en": "Bled Jezero",
          "de": "Bled Jezero",
          "hr": "Bled Jezero",
          "sr": "Bled Jezero"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Bled%20Jezero%20railway%20station%20Slovenia"
      },
      {
        "label": {
          "sl": "Lesce-Bled",
          "en": "Lesce-Bled",
          "de": "Lesce-Bled",
          "hr": "Lesce-Bled",
          "sr": "Lesce-Bled"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=Lesce-Bled%20railway%20station%20Slovenia"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Taksi in transferji",
      "en": "Taxis and transfers",
      "de": "Taxi und Transfers",
      "hr": "Taksi i transferi",
      "sr": "Taksi i transferi"
    },
    "description": {
      "sl": "Prevoz rezervirajte neposredno pri Bled Transfers. Vnaprej potrdite termin, zbirno mesto, število potnikov, prtljago in ceno.",
      "en": "Book transport directly with Bled Transfers. Confirm the time, meeting point, passenger numbers, luggage and price in advance.",
      "de": "Transfer direkt bei Bled Transfers buchen. Termin, Treffpunkt, Personenzahl, Gepäck und Preis vorab bestätigen.",
      "hr": "Prijevoz rezervirajte izravno kod Bled Transfers. Unaprijed potvrdite termin, mjesto susreta, broj putnika, prtljagu i cijenu.",
      "sr": "Prevoz rezervišite direktno kod Bled Transfers. Unapred potvrdite termin, mesto susreta, broj putnika, prtljag i cenu."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://bledtransfers.si/"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Najem koles",
      "en": "Bike rental",
      "de": "Fahrradverleih",
      "hr": "Najam bicikala",
      "sr": "Iznajmljivanje bicikala"
    },
    "description": {
      "sl": "Za najem koles ali e-koles priporočamo A&B Bike. Termin in ceno uredite neposredno pri ponudniku ter vprašajte za dostavo koles do apartmaja; dostava ni samodejno zagotovljena.",
      "en": "For bikes or e-bikes, we recommend A&B Bike. Arrange dates and prices directly, and ask whether delivery to the apartment is available; delivery is not automatic.",
      "de": "Für Fahrräder und E-Bikes empfehlen wir A&B Bike. Termin und Preis direkt vereinbaren und nach Lieferung zur Wohnung fragen; sie ist nicht automatisch zugesichert.",
      "hr": "Za najam bicikala i e-bicikala preporučujemo A&B Bike. Termin i cijenu dogovorite izravno te pitajte za dostavu do apartmana; dostava nije automatski osigurana.",
      "sr": "Za iznajmljivanje bicikala i e-bicikala preporučujemo A&B Bike. Termin i cenu dogovorite direktno i pitajte za dostavu do apartmana; dostava nije automatski obezbeđena."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.ab-bike.si/en"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=A%26B%20Bike%20Cesta%20svobode%2022%20Bled"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Najem e-koles",
      "en": "E-bike rental",
      "de": "E-Bike-Verleih",
      "hr": "Najam e-bicikala",
      "sr": "Iznajmljivanje e-bicikala"
    },
    "description": {
      "sl": "Za najem koles ali e-koles priporočamo A&B Bike. Termin in ceno uredite neposredno pri ponudniku ter vprašajte za dostavo koles do apartmaja; dostava ni samodejno zagotovljena.",
      "en": "For bikes or e-bikes, we recommend A&B Bike. Arrange dates and prices directly, and ask whether delivery to the apartment is available; delivery is not automatic.",
      "de": "Für Fahrräder und E-Bikes empfehlen wir A&B Bike. Termin und Preis direkt vereinbaren und nach Lieferung zur Wohnung fragen; sie ist nicht automatisch zugesichert.",
      "hr": "Za najam bicikala i e-bicikala preporučujemo A&B Bike. Termin i cijenu dogovorite izravno te pitajte za dostavu do apartmana; dostava nije automatski osigurana.",
      "sr": "Za iznajmljivanje bicikala i e-bicikala preporučujemo A&B Bike. Termin i cenu dogovorite direktno i pitajte za dostavu do apartmana; dostava nije automatski obezbeđena."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.ab-bike.si/en"
      },
      {
        "label": {
          "sl": "Poglej lokacijo",
          "en": "View location",
          "de": "Standort ansehen",
          "hr": "Pogledaj lokaciju",
          "sr": "Pogledaj lokaciju"
        },
        "href": "https://www.google.com/maps/search/?api=1&query=A%26B%20Bike%20Cesta%20svobode%2022%20Bled"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "sl": "Kako po Bledu",
      "en": "Getting around Bled",
      "de": "Unterwegs in Bled",
      "hr": "Kretanje po Bledu",
      "sr": "Kretanje po Bledu"
    },
    "description": {
      "sl": "Za krajše razdalje izberite hojo ali kolo, za daljše poti preverite avtobus ali taksi. Pletne in turistični vlakec imajo svoje urnike; del ponudbe je sezonski.",
      "en": "Walk or cycle for shorter distances, and check buses or taxis for longer trips. Pletna boats and the tourist train follow their own schedules; some services are seasonal.",
      "de": "Kurze Strecken zu Fuß oder mit dem Rad, längere mit Bus oder Taxi planen. Pletna-Boote und Touristenzug haben eigene Fahrpläne; manches Angebot ist saisonal.",
      "hr": "Za kraće udaljenosti odaberite hodanje ili bicikl, a za dulje provjerite autobus ili taksi. Pletne i turistički vlakić imaju svoje rasporede; dio ponude je sezonski.",
      "sr": "Za kraće udaljenosti birajte šetnju ili bicikl, a za duže proverite autobus ili taksi. Pletne i turistički vozić imaju svoje rasporede; deo ponude je sezonski."
    },
    "links": [
      {
        "label": {
          "sl": "Uradna spletna stran",
          "en": "Official website",
          "de": "Offizielle Website",
          "hr": "Službena stranica",
          "sr": "Zvanični sajt"
        },
        "href": "https://www.bled.si/en/information/getting-around-bled/"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  }
]

export const SEED_HOWTO: SeedHowto[] = [
  {
    "image": "/how-to/ac.webp",
    "title": {
      "en": "Air conditioning",
      "sl": "Klimatska naprava",
      "de": "Klimaanlage",
      "hr": "Klima uređaj",
      "sr": "Klima uređaj"
    },
    "description": {
      "en": "On the upper floor there is an air conditioner with a standard remote control. Please adjust it however it suits you best.",
      "sl": "Klimatska naprava je v zgornjem nadstropju. Upravljate jo z daljinskim upravljalnikom.",
      "de": "Im Obergeschoss befindet sich eine Klimaanlage mit einer Standardfernbedienung. Stellen Sie sie nach Ihren Wünschen ein.",
      "hr": "Na gornjem katu nalazi se klima uređaj sa standardnim daljinskim upravljačem. Namjestite ga kako vam najviše odgovara.",
      "sr": "Na gornjem spratu nalazi se klima uređaj sa standardnim daljinskim upravljačem. Podesite ga kako vam najviše odgovara."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/tv.webp",
    "title": {
      "en": "TV",
      "sl": "Televizija",
      "de": "Fernseher",
      "hr": "Televizor",
      "sr": "Televizor"
    },
    "description": {
      "en": "The apartment has a TCL 55P69B 4K UHD TV with Google TV. You can use it for regular TV content, streaming apps and casting through Google TV or Chromecast. Use the large remote to switch the HDMI source and the small remote to control the TV.",
      "sl": "Apartma ima televizor TCL 55P69B 4K UHD z Google TV. Uporabite ga za redne televizijske kanale, pretočne aplikacije in predvajanje prek Google TV ali Chromecast. Z velikim daljincem preklopite HDMI vir, z malim pa upravljate televizor.",
      "de": "Die Wohnung verfügt über einen TCL 55P69B 4K UHD TV mit Google TV. Nutzen Sie ihn für reguläre TV-Inhalte, Streaming-Apps und Casting über Google TV oder Chromecast. Mit der großen Fernbedienung wechseln Sie den HDMI-Eingang, mit der kleinen steuern Sie den Fernseher.",
      "hr": "Apartman ima TCL 55P69B 4K UHD TV s Google TV-om. Koristite ga za redovne TV kanale, streaming aplikacije i prijenos putem Google TV ili Chromecast-a. Velikim daljincem mijenjate HDMI izvor, malim upravljate televizorom.",
      "sr": "Apartman ima TCL 55P69B 4K UHD TV sa Google TV-om. Koristite ga za redovne TV kanale, streaming aplikacije i prenos putem Google TV ili Chromecast-a. Velikim daljinskim menjate HDMI izvor, malim upravljate televizorom."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/kids-safety.webp",
    "title": {
      "en": "Safety gate for kids",
      "sl": "Varnostna vrata za otroke",
      "de": "Kinderschutzgitter",
      "hr": "Zaštitna vrata za djecu",
      "sr": "Zaštitna vrata za decu"
    },
    "description": {
      "en": "The stairs are protected by a child safety gate. To unlock or lock it, press and twist the button on the holder.",
      "sl": "Stopnišče je zaščiteno z varnostnimi vrati za otroke. Za odklepanje ali zaklepanje pritisnite in zavrtite gumb na držalu.",
      "de": "Die Treppe ist durch ein Kinderschutzgitter gesichert. Zum Öffnen oder Schließen den Knopf am Halter drücken und drehen.",
      "hr": "Stubište je zaštićeno sigurnosnim vratima za djecu. Za otključavanje ili zaključavanje pritisnite i zavrtite gumb na nosaču.",
      "sr": "Stepenište je zaštićeno sigurnosnim vratima za decu. Za otključavanje ili zaključavanje pritisnite i zavrtite dugme na nosaču."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/ventilation-control.webp",
    "title": {
      "en": "Automatic ventilation",
      "sl": "Samodejno prezračevanje",
      "de": "Automatische Lüftung",
      "hr": "Automatska ventilacija",
      "sr": "Automatska ventilacija"
    },
    "description": {
      "en": "The ventilation controls are located in the lower part of the apartment near the sofa. The right-side control operates ventilation with heat recovery and is the recommended setting for everyday use.",
      "sl": "Upravljalnik prezračevanja se nahaja v spodnjem delu apartmaja pri kavču. Desni upravljalnik nadzoruje prezračevanje s toplotnim rekuperatorjem in je priporočena nastavitev za vsakodnevno uporabo.",
      "de": "Die Lüftungssteuerung befindet sich im unteren Teil der Wohnung beim Sofa. Die rechte Steuerung betreibt die Lüftung mit Wärmerückgewinnung und ist die empfohlene Einstellung für den Alltag.",
      "hr": "Upravljač ventilacije nalazi se u donjem dijelu apartmana kod sofe. Desni upravljač kontrolira ventilaciju s rekuperacijom topline i preporučena je postavka za svakodnevnu upotrebu.",
      "sr": "Upravljač ventilacije nalazi se u donjem delu apartmana kod sofe. Desni upravljač kontroliše ventilaciju s rekuperacijom toplote i preporučena je postavka za svakodnevnu upotrebu."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/blinds-control.webp",
    "title": {
      "en": "Blinds",
      "sl": "Žaluzije",
      "de": "Jalousien",
      "hr": "Žaluzine",
      "sr": "Žaluzine"
    },
    "description": {
      "en": "Press and hold the up arrow for about a second to raise the blinds and the down arrow to lower them. A short press stops them.",
      "sl": "Pridržite puščico gor za sekundo, da dvignete žaluzijo, in puščico dol, da jo spustite. Kratki pritisk jo ustavi.",
      "de": "Pfeil nach oben ca. eine Sekunde gedrückt halten, um die Jalousie hochzufahren, Pfeil nach unten zum Herunterlassen. Ein kurzer Druck stoppt sie.",
      "hr": "Pritisnite i držite strelicu gore oko sekunde za podizanje žaluzine, strelicu dolje za spuštanje. Kratki pritisak zaustavlja je.",
      "sr": "Pritisnite i držite strelicu gore oko sekunde za podizanje žaluzine, strelicu dole za spuštanje. Kratak pritisak zaustavlja je."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/roof-window.webp",
    "title": {
      "en": "Roof window",
      "sl": "Strešno okno",
      "de": "Dachfenster",
      "hr": "Krovni prozor",
      "sr": "Krovni prozor"
    },
    "description": {
      "en": "Use the arrow buttons to open or close the roof window, and the middle button to stop it at any position. Please do not operate the window manually.",
      "sl": "Z gumbi s puščicami odprite ali zaprite strešno okno, srednji gumb ga ustavi na katerem koli položaju. Prosimo, ne upravljajte okna ročno.",
      "de": "Mit den Pfeiltasten das Dachfenster öffnen oder schließen, mit der mittleren Taste an jeder Position stoppen. Bitte das Fenster nicht manuell bedienen.",
      "hr": "Strelicama otvorite ili zatvorite krovni prozor, srednjim gumbom zaustavite ga na bilo kojoj poziciji. Molimo ne upravljajte prozorom ručno.",
      "sr": "Strelicama otvorite ili zatvorite krovni prozor, srednjim dugmetom zaustavite ga na bilo kojoj poziciji. Molimo ne upravljajte prozorom ručno."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/gorenje-h30mobs10hc-oven.jpg",
    "title": {
      "en": "Gorenje combination oven",
      "sl": "Kombinirana pečica Gorenje",
      "de": "Gorenje Kombi-Backofen",
      "hr": "Gorenje kombinirana pećnica",
      "sr": "Gorenje kombinovana rerna"
    },
    "description": {
      "sl": "V kuhinji je kombinirana pečica Gorenje H30MOBS10HC. Za načine delovanja in varno uporabo preberite priložena navodila.",
      "en": "The kitchen has a Gorenje H30MOBS10HC combination oven. See the attached manual for operating modes and safe use.",
      "de": "In der Küche steht ein Gorenje H30MOBS10HC Kombinationsgerät. Betriebsarten und Hinweise zur sicheren Nutzung finden Sie in der beigefügten Anleitung.",
      "hr": "U kuhinji se nalazi kombinirana pećnica Gorenje H30MOBS10HC. Za načine rada i sigurnu uporabu pročitajte priložene upute.",
      "sr": "U kuhinji je kombinovana rerna Gorenje H30MOBS10HC. Za režime rada i bezbednu upotrebu pročitajte priloženo uputstvo."
    },
    "links": [
      {
        "label": {
          "sl": "Navodila za uporabo (PDF)",
          "en": "User manual (PDF)",
          "de": "Bedienungsanleitung (PDF)",
          "hr": "Upute za uporabu (PDF)",
          "sr": "Uputstvo za upotrebu (PDF)"
        },
        "href": "/how-to/gorenje-h30mobs10hc-navodila.pdf"
      }
    ],
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "en": "Baby chair",
      "sl": "Otroški stolček",
      "de": "Babystuhl",
      "hr": "Dječja stolica",
      "sr": "Dečja stolica"
    },
    "description": {
      "en": "In the kitchen cabinet under the microwave you will find a child-seat kit that fits the kitchen chair.",
      "sl": "V kuhinjski omari pod mikrovalovno pečico najdete komplet za otroški sedež, ki se pritrdi na kuhinjski stol.",
      "de": "Im Küchenschrank unter der Mikrowelle finden Sie ein Kindersitzset, das auf den Küchenstuhl passt.",
      "hr": "U kuhinjskom ormariću ispod mikrovalne pećnice naći ćete komplet dječjeg sjedala koji odgovara kuhinjskoj stolici.",
      "sr": "U kuhinjskom ormariću ispod mikrotalasne naći ćete komplet dečjeg sedišta koji odgovara kuhinjskoj stolici."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "en": "Bed safety for kids",
      "sl": "Varnostna ograja za posteljo",
      "de": "Bettschutzgitter für Kinder",
      "hr": "Zaštitna ograda za krevet",
      "sr": "Zaštitna ograda za krevet"
    },
    "description": {
      "en": "If you need a bed safety rail, it is stored under the first single bed. Lift the mattress and place the rail on the bed where you need it.",
      "sl": "Če potrebujete varnostno ograjo za posteljo, je shranjena pod prvo enojno posteljo. Dvignite vzmetnico in namestite ograjo tja, kjer jo potrebujete.",
      "de": "Falls Sie ein Bettschutzgitter benötigen, befindet es sich unter dem ersten Einzelbett. Heben Sie die Matratze an und platzieren Sie das Gitter dort, wo Sie es brauchen.",
      "hr": "Ako vam treba zaštitna ograda za krevet, pohranjena je ispod prvog jednostrukog kreveta. Podignite madrac i postavite ogradu tamo gdje vam treba.",
      "sr": "Ako vam treba zaštitna ograda za krevet, pohranjena je ispod prvog jednostrukog kreveta. Podignite madrac i postavite ogradu tamo gde vam treba."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/outdoor.webp",
    "title": {
      "en": "Outdoor light",
      "sl": "Zunanja svetilka",
      "de": "Außenbeleuchtung",
      "hr": "Vanjska rasvjeta",
      "sr": "Spoljašnja rasveta"
    },
    "description": {
      "en": "The outdoor light switch is by the entrance. Top position: always on. Middle: off. Bottom: motion sensor.",
      "sl": "Stikalo za zunanjo svetilko je pri vhodu. Zgoraj: vedno vklopljeno. Na sredini: izklopljeno. Spodaj: senzor gibanja.",
      "de": "Der Schalter für die Außenbeleuchtung befindet sich beim Eingang. Oben: dauerhaft an. Mitte: aus. Unten: Bewegungssensor.",
      "hr": "Prekidač za vanjsku rasvjetu nalazi se kod ulaza. Gore: uvijek uključeno. Sredina: isključeno. Dolje: senzor pokreta.",
      "sr": "Prekidač za spoljašnju rasvetu nalazi se kod ulaza. Gore: uvek uključeno. Sredina: isključeno. Dole: senzor pokreta."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/kitchen.webp",
    "title": {
      "en": "Kitchen light",
      "sl": "Kuhinjska svetilka",
      "de": "Küchenbeleuchtung",
      "hr": "Kuhinjska rasvjeta",
      "sr": "Kuhinjska rasveta"
    },
    "description": {
      "en": "Under the kitchen cabinet above the stove there is a blue touch switch. Touch to turn on/off, hold to adjust brightness.",
      "sl": "Pod kuhinjsko omaro nad štedilnikom je modro tipkalno stikalo. Dotaknite se za vklop/izklop, pridržite za nastavitev svetlosti.",
      "de": "Unter dem Küchenschrank über dem Herd befindet sich ein blauer Touch-Schalter. Antippen zum Ein-/Ausschalten, gedrückt halten zum Dimmen.",
      "hr": "Ispod kuhinjskog ormara iznad štednjaka nalazi se plavi touch prekidač. Dodirnite za uključivanje/isključivanje, dugo pritisnite za podešavanje svjetline.",
      "sr": "Ispod kuhinjskog ormara iznad šporeta nalazi se plavi touch prekidač. Dodirnite za uključivanje/isključivanje, dugo pritisnite za podešavanje svetline."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "image": "/how-to/bathroom.webp",
    "title": {
      "en": "Bathroom heating",
      "sl": "Kopalniško ogrevanje",
      "de": "Badezimmerheizung",
      "hr": "Grijanje kupaonice",
      "sr": "Grejanje kupatila"
    },
    "description": {
      "en": "By the bathroom entrance there is a switch with a heating icon. Press it to activate additional bathroom heating for about 30 minutes.",
      "sl": "Pri vhodu v kopalnico je stikalo z ikono ogrevanja. Pritisnite ga za vklop dodatnega kopalničnega ogrevanja za približno 30 minut.",
      "de": "Beim Badezimmereingang gibt es einen Schalter mit einem Heizsymbol. Drücken Sie ihn, um die zusätzliche Badezimmerheizung für ca. 30 Minuten einzuschalten.",
      "hr": "Kod ulaza u kupaonicu nalazi se prekidač s ikonom grijanja. Pritisnite ga za aktiviranje dodatnog grijanja kupaonice na oko 30 minuta.",
      "sr": "Kod ulaza u kupatilo nalazi se prekidač sa ikonom grejanja. Pritisnite ga za aktiviranje dodatnog grejanja kupatila na oko 30 minuta."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  },
  {
    "title": {
      "en": "Waste handling",
      "sl": "Ločevanje odpadkov",
      "de": "Mülltrennung",
      "hr": "Razvrstavanje otpada",
      "sr": "Razvrstavanje otpada"
    },
    "description": {
      "sl": "Pod umivalnikom v kopalnici so koši za ločevanje odpadkov. Zbirni zabojniki so zunaj ob dovozu; steklo odložite v ločen zabojnik.",
      "en": "Waste-sorting bins are under the bathroom washbasin. Collection bins are outside by the driveway; use the separate container for glass.",
      "de": "Behälter zur Mülltrennung stehen unter dem Waschbecken im Bad. Sammelbehälter befinden sich draußen an der Einfahrt; Glas getrennt entsorgen.",
      "hr": "Koševi za odvajanje otpada nalaze se ispod umivaonika u kupaonici. Zbirni spremnici su vani uz prilaz; staklo odložite odvojeno.",
      "sr": "Kante za odvajanje otpada su ispod umivaonika u kupatilu. Zajednički kontejneri su napolju uz prilaz; staklo odložite odvojeno."
    },
    "recurring": true,
    "validFrom": "01-01",
    "validTo": "12-31"
  }
]

export const SEED_HOUSE_RULES: LocalizedText[] = [
  {
    "en": "No smoking inside the apartment.",
    "sl": "Kajenje v apartmaju ni dovoljeno.",
    "de": "Rauchen in der Wohnung ist nicht gestattet.",
    "hr": "Pušenje u apartmanu nije dozvoljeno.",
    "sr": "Pušenje u apartmanu nije dozvoljeno."
  },
  {
    "sl": "Prosimo, ločujte odpadke. V straniščno školjko odlagajte samo toaletni papir.",
    "en": "Please sort your waste. Only toilet paper should be flushed down the toilet.",
    "de": "Bitte den Müll trennen. Nur Toilettenpapier in der Toilette entsorgen.",
    "hr": "Molimo odvajajte otpad. U zahodsku školjku bacajte samo toaletni papir.",
    "sr": "Molimo odvajajte otpad. U WC šolju bacajte samo toaletni papir."
  },
  {
    "en": "Please do not feed the horses — unsuitable food can harm them.",
    "sl": "Prosimo, ne hranite konj — neprimerna hrana jim lahko škodi.",
    "de": "Bitte füttern Sie die Pferde nicht — ungeeignetes Futter kann ihnen schaden.",
    "hr": "Molimo ne hranite konje — neprikladna hrana može im nauditi.",
    "sr": "Molimo ne hranite konje — neprikladna hrana im može naškoditi."
  },
  {
    "sl": "Ne naslanjajte se na ograjo v zgornjem nadstropju in ne plezajte nanjo.",
    "en": "Do not lean on or climb the railing on the upper floor.",
    "de": "Bitte nicht gegen das Geländer im Obergeschoss lehnen oder darauf klettern.",
    "hr": "Ne naslanjajte se na ogradu na gornjem katu i ne penjite se na nju.",
    "sr": "Ne naslanjajte se na ogradu na gornjem spratu i ne penjite se na nju."
  },
  {
    "en": "The horse fence is electrified.",
    "sl": "Konjska ograja je elektrificirana.",
    "de": "Der Pferdezaun ist elektrifiziert.",
    "hr": "Ograda za konje je elektrificirana.",
    "sr": "Ograda za konje je elektrificirana."
  },
  {
    "en": "Tap water is safe to drink.",
    "sl": "Voda iz pipe je primerna za pitje.",
    "de": "Leitungswasser ist trinkbar.",
    "hr": "Voda iz slavine je sigurna za piće.",
    "sr": "Voda iz slavine je bezbedna za piće."
  }
]
