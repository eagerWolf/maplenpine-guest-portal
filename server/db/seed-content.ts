import type { LocalizedText } from './index'

export interface SeedRestaurant {
  name: string
  type: 'fineDining' | 'traditional' | 'casual'
  website: string
  description: LocalizedText
  image: string // source path under public/, copied into data/uploads/restaurants/ on seed
}

export interface SeedButton { label: string; href: string; target?: string }

export interface SeedSuggestion {
  title: LocalizedText
  description: LocalizedText
  buttons?: SeedButton[]
  image: string // source path under public/, copied into data/uploads/suggestions/ on seed
  recurring: boolean
  validFrom: string | null
  validTo: string | null
}

export interface SeedLink { label: string; href: string }

export interface SeedFaq {
  title: LocalizedText
  description: LocalizedText
  links?: SeedLink[]
}

export interface SeedHowto {
  title: LocalizedText
  description: LocalizedText
  image?: string // source path under public/, copied into data/uploads/howto/ on seed
  links?: SeedLink[]
}

export const SEED_RESTAURANTS: SeedRestaurant[] = [
  {
    name: 'Old Cellar Lake View', type: 'fineDining', website: 'https://www.oldcellarbled.com/en/', image: '/restaurants/oldcellarlakeview.webp',
    description: {
      en: 'A polished choice for a special meal in Bled, with seasonal Slovenian dishes, local ingredients, a good wine list and lake views.',
      sl: 'Uglajena izbira za posebno kosilo ali večerjo v Bledu, s sezonskimi slovenskimi jedmi, lokalnimi sestavinami, dobro vinsko karto in razgledom na jezero.',
      de: 'Eine stilvolle Wahl für ein besonderes Essen in Bled, mit saisonaler slowenischer Küche, lokalen Zutaten, guter Weinauswahl und Blick auf den See.',
      hr: 'Uređen izbor za poseban ručak ili večeru u Bledu, sa sezonskim slovenskim jelima, lokalnim namirnicama, dobrom vinskom kartom i pogledom na jezero.',
      sr: 'Uređen izbor za poseban ručak ili večeru u Bledu, sa sezonskim slovenačkim jelima, lokalnim namirnicama, dobrom vinskom kartom i pogledom na jezero.',
    },
  },
  {
    name: 'Pri Planincu', type: 'traditional', website: 'https://www.pri-planincu.com/', image: '/restaurants/planinc.webp',
    description: {
      en: 'A family-run restaurant in a restored 19th-century building, known for traditional local dishes and a long Bled history.',
      sl: 'Družinska restavracija v prenovljeni stavbi iz 19. stoletja, znana po tradicionalnih lokalnih jedeh in dolgi blejski zgodbi.',
      de: 'Ein familiengeführtes Restaurant in einem restaurierten Gebäude aus dem 19. Jahrhundert, bekannt für traditionelle lokale Gerichte und eine lange Geschichte in Bled.',
      hr: 'Obiteljski restoran u obnovljenoj zgradi iz 19. stoljeća, poznat po tradicionalnim lokalnim jelima i dugoj blejskoj povijesti.',
      sr: 'Porodični restoran u obnovljenoj zgradi iz 19. veka, poznat po tradicionalnim lokalnim jelima i dugoj blejskoj istoriji.',
    },
  },
  {
    name: 'Blejska Hiša', type: 'traditional', website: 'https://blejskahisa.si', image: '/restaurants/blejska-hisa.webp',
    description: {
      en: 'A popular restaurant in Bled known for traditional Slovenian cuisine and generous portions of homemade dishes. The menu features meat specialties and Slovenian classics prepared with a modern touch in a cozy alpine atmosphere.',
      sl: 'Priljubljena restavracija v Bledu, znana po tradicionalni slovenski kuhinji in izdatnih obrokih domače hrane. Jedilnik ponuja mesne specialitete in slovensko klasiko s sodobnim pridihom v prijetnem alpskem vzdušju.',
      de: 'Ein beliebtes Restaurant in Bled, bekannt für traditionelle slowenische Küche und großzügige Portionen hausgemachter Gerichte. Die Speisekarte bietet Fleischspezialitäten und slowenische Klassiker mit modernem Touch in gemütlicher Alpenatmosphäre.',
      hr: 'Popularan restoran u Bledu poznat po tradicionalnoj slovenačkoj kuhinji i izdašnim obrocima domaće hrane. Jelovnik nudi mesne specijalitete i slovenačke klasike s modernim prizvukom u ugodnoj alpskoj atmosferi.',
      sr: 'Popularan restoran u Bledu poznat po tradicionalnoj slovenačkoj kuhinji i izdašnim obrocima domaće hrane. Jelovnik nudi mesne specijalitete i slovenačke klasike sa modernim prizvukom u ugodnoj alpskoj atmosferi.',
    },
  },
  {
    name: 'Al Fresco', type: 'casual', website: 'https://al-fresco.si', image: '/restaurants/al-fresco.webp',
    description: {
      en: 'A modern restaurant serving breakfast, lunch and dinner in a relaxed atmosphere. The kitchen focuses on fresh ingredients and a contemporary European approach. Guests can enjoy meals on the pleasant outdoor terrace during warmer months.',
      sl: 'Moderna restavracija, ki v sproščenem vzdušju streže zajtrk, kosilo in večerjo. Kuhinja se osredotoča na sveže sestavine in sodobni evropski pristop. V toplejših mesecih je na voljo prijetna zunanja terasa.',
      de: 'Ein modernes Restaurant, das in entspannter Atmosphäre Frühstück, Mittagessen und Abendessen serviert. Die Küche setzt auf frische Zutaten und einen zeitgemäßen europäischen Ansatz. In wärmeren Monaten ist eine angenehme Außenterrasse verfügbar.',
      hr: 'Moderan restoran koji u opuštenom ozračju poslužuje doručak, ručak i večeru. Kuhinja se fokusira na svježe namirnice i suvremeni europski pristup. U toplijim mjesecima dostupna je ugodna vanjska terasa.',
      sr: 'Moderan restoran koji u opuštenoj atmosferi poslužuje doručak, ručak i večeru. Kuhinja se fokusira na sveže namirnice i savremeni evropski pristup. U toplijim mesecima dostupna je ugodna spoljna terasa.',
    },
  },
  {
    name: 'Restaurant Julijana', type: 'fineDining', website: 'https://www.sava-hotels-resorts.com/en/sava-hotels-bled/services-and-experiences/gastronomy/restaurant-julijana/', image: '/restaurants/julijana.webp',
    description: {
      en: 'Located in Grand Hotel Toplice, Julijana is one of Bled\'s refined dining options, with seasonal tasting menus, local ingredients and lake views.',
      sl: 'V Grand Hotelu Toplice je to ena najprestižnejših restavracij v Bledu. Ponuja sezonske degustacijske menije z močnim poudarkom na lokalnih sestavinah in čudovit razgled na Blejsko jezero.',
      de: 'Im Grand Hotel Toplice gelegen, ist dies eine der renommiertesten Gaststätten in Bled. Es bietet saisonale Degustationsmenüs mit Fokus auf lokale Zutaten und einen schönen Blick auf den Bleder See.',
      hr: 'Smješten u Grand Hotelu Toplice, ovo je jedno od najprestižnijih mjesta za objedovanje u Bledu. Nudi sezonske degustacijske menije s naglaskom na lokalne namirnice i prekrasan pogled na Blejsko jezero.',
      sr: 'Smešten u Grand Hotelu Toplice, ovo je jedno od najprestižnijih mesta za obedovanje u Bledu. Nudi sezonske degustacijske menije s naglaskom na lokalne namirnice i prekrasan pogled na Blejsko jezero.',
    },
  },
  {
    name: 'Restaurant Sova', type: 'fineDining', website: 'https://www.restavracija-sova-bled.si/', image: '/restaurants/sova.webp',
    description: {
      en: 'A well-known lakeside restaurant suitable for a special dinner or a relaxed lunch by the water. The menu combines Slovenian and international influences, with fish, meat and seasonal dishes in a polished but welcoming atmosphere.',
      sl: 'Znana restavracija ob jezeru, primerna za posebno večerjo ali sproščeno kosilo ob vodi. Jedilnik združuje slovensko in mednarodno kuhinjo z ribami, mesom in sezonskimi jedmi v uglajeni a domači atmosferi.',
      de: 'Ein bekanntes Restaurant am Seeufer, geeignet für ein besonderes Abendessen oder ein entspanntes Mittagessen am Wasser. Die Speisekarte kombiniert slowenische und internationale Einflüsse mit Fisch, Fleisch und saisonalen Gerichten.',
      hr: 'Poznati restoran na obali jezera, prikladan za posebnu večeru ili opušteni ručak uz vodu. Jelovnik kombinira slovenačke i međunarodne utjecaje s ribom, mesom i sezonskim jelima u uglednoj, ali ugodnoj atmosferi.',
      sr: 'Poznat restoran na obali jezera, prikladan za posebnu večeru ili opušteni ručak uz vodu. Jelovnik kombinuje slovenačke i međunarodne uticaje sa ribom, mesom i sezonskim jelima u uglednoj, ali ugodnoj atmosferi.',
    },
  },
  {
    name: 'Špica', type: 'casual', website: 'https://www.spica-bled.si/', image: '/restaurants/spica.webp',
    description: {
      en: 'A relaxed restaurant close to the lake and the centre of Bled. A practical choice for families, casual lunches and easy evening meals after a day outdoors, with a broad menu and a lively local atmosphere.',
      sl: 'Sproščena restavracija blizu jezera in centra Bleda. Praktična izbira za družine, priložnostna kosila in preprosto večerjo po dnevu v naravi, s pestrim jedilnikom in živahno lokalno vzdušje.',
      de: 'Ein entspanntes Restaurant nahe dem See und dem Zentrum von Bled. Eine praktische Wahl für Familien, ungezwungene Mittagessen und unkomplizierte Abendessen nach einem Tag draußen, mit breitem Angebot.',
      hr: 'Opušteni restoran blizu jezera i centra Bleda. Praktičan izbor za obitelji, neformalne ručkove i jednostavne večere nakon dana u prirodi, s raznolikom ponudom i živahnom lokalnom atmosferom.',
      sr: 'Opušten restoran blizu jezera i centra Bleda. Praktičan izbor za porodice, neformalne ručkove i jednostavne večere nakon dana u prirodi, s raznovrsnom ponudom i živahnom lokalnom atmosferom.',
    },
  },
  {
    name: 'Central Bled', type: 'casual', website: 'https://central-bled.com/', image: '/restaurants/central.webp',
    description: {
      en: 'A convenient casual stop in the centre of Bled for coffee, brunch, lunch or a simple dinner. Works well for guests who want an easy, central option before or after exploring the lake, shops and town centre.',
      sl: 'Priročna priložnostna postaja v centru Bleda za kavo, brunch, kosilo ali preprosto večerjo. Dobro deluje za goste, ki iščejo enostavno in centralno možnost pred ali po ogledu jezera in mesta.',
      de: 'Eine praktische Anlaufstelle im Zentrum von Bled für Kaffee, Brunch, Mittagessen oder ein einfaches Abendessen. Gut geeignet für Gäste, die eine unkomplizierte, zentrale Option vor oder nach dem Erkunden des Sees wünschen.',
      hr: 'Praktična neformalna postaja u centru Bleda za kavu, brunch, ručak ili jednostavnu večeru. Dobro funkcionira za goste koji žele laganu, centralnu opciju prije ili nakon istraživanja jezera i centra.',
      sr: 'Praktična neformalna stanica u centru Bleda za kafu, brunch, ručak ili jednostavnu večeru. Dobro funkcioniše za goste koji žele laganu, centralnu opciju pre ili posle istraživanja jezera i centra.',
    },
  },
  {
    name: 'Grajska Plaža', type: 'casual', website: 'https://www.grajska-plaza.com/', image: '/restaurants/grajska-plaza.webp',
    description: {
      en: 'A seasonal outdoor restaurant and lakeside spot by the castle bathing area, best suited for warm-weather lunches and drinks by the water. Open only during the season — check opening times before your visit.',
      sl: 'Sezonska zunanja restavracija in točka ob jezeru pri gradu, primerna za kosilo in pijačo ob vodi v toplem vremenu. Odprta samo v sezoni — pred obiskom preverite delovni čas.',
      de: 'Ein saisonales Außenrestaurant am Seeufer beim Burgebadebereich, ideal für Mittagessen und Getränke am Wasser bei warmem Wetter. Nur in der Saison geöffnet — Öffnungszeiten vor dem Besuch prüfen.',
      hr: 'Sezonski vanjski restoran i točka uz jezero kod kupališta dvorca, najprikladniji za ručak i piće uz vodu po lijepom vremenu. Otvoren samo sezonski — provjerite radno vrijeme prije posjeta.',
      sr: 'Sezonski spoljni restoran i tačka uz jezero kod kupačkog mesta dvorca, najprikladniji za ručak i piće uz vodu po lepom vremenu. Otvoren samo sezonski — proverite radno vreme pre posete.',
    },
  },
  {
    name: 'Mega Burger', type: 'casual', website: 'https://www.mega-burger.si/', image: '/restaurants/mega-burger.webp',
    description: {
      en: 'A casual choice for burgers, quick lunches and relaxed meals after a day at the lake or outdoors. A practical option for families who want something simple, filling and informal.',
      sl: 'Priložnostna izbira v Bledu za hamburgerje, hitra kosila in sproščene obroke po dnevu ob jezeru ali v naravi. Praktična možnost za družine, ki iščejo preprosto, sito in neformalno.',
      de: 'Eine legere Wahl in Bled für Burger, schnelle Mittagessen und entspannte Mahlzeiten nach einem Tag am See oder in der Natur. Praktisch für Familien, die etwas Einfaches und Sättigendes suchen.',
      hr: 'Neformalan izbor u Bledu za burgere, brze ručkove i opuštene obroke nakon dana uz jezero ili u prirodi. Praktična opcija za obitelji koje žele nešto jednostavno, hranjivo i neformalno.',
      sr: 'Neformalan izbor u Bledu za burgere, brze ručkove i opuštene obroke nakon dana uz jezero ili u prirodi. Praktična opcija za porodice koje žele nešto jednostavno, hranjivo i neformalno.',
    },
  },
]

export const SEED_SUGGESTIONS: SeedSuggestion[] = [
  {
    image: '/suggestions/pletna.webp', recurring: true, validFrom: '04-01', validTo: '10-31',
    title: { en: 'Pletna boat to Bled Island', sl: 'Vožnja s \'Pletno\' na Blejski otok', de: '"Pletna" Fahrt zur Insel Bled', hr: '"Pletna" putovanje na Blejski otok', sr: '"Pletna" putovanje na Blejsko ostrvo' },
    description: {
      en: 'A traditional Pletna boat is a relaxed way to reach Bled Island. You will find the wooden boats at several points along the lakeshore.',
      sl: 'Tradicionalna pletna je sproščen način za obisk Blejskega otoka. Lesene čolne najdete na več mestih ob obali jezera.',
      de: 'Ein traditionelles Pletna-Boot ist eine entspannte Art, die Insel Bled zu erreichen. Die Holzboote finden Sie an mehreren Stellen am Seeufer.',
      hr: 'Tradicionalna pletna opušten je način za odlazak na Blejski otok. Drvene čamce naći ćete na nekoliko mjesta uz obalu jezera.',
      sr: 'Tradicionalna pletna je opušten način da stignete do Blejskog ostrva. Drvene čamce naći ćete na nekoliko mesta uz obalu jezera.',
    },
  },
  {
    image: '/suggestions/carriage.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Horse-drawn carriages in Bled', sl: 'Spoznajte center Bleda z vožnjo s kočijo', de: 'Bled-Zentrum mit Pferdekutschen erkunden', hr: 'Istražite centar Bleda u konjskim kočijama', sr: 'Istražite centar Bleda u konjskim kočijama' },
    description: {
      en: 'Horse-drawn carriages are usually available in the centre of Bled and offer an easy, traditional ride around town or by the lake.',
      sl: 'Kočije so običajno na voljo v središču Bleda in so prijeten, tradicionalen način za krajšo vožnjo po mestu ali ob jezeru.',
      de: 'Pferdekutschen stehen meist im Zentrum von Bled bereit und bieten eine einfache, traditionelle Fahrt durch den Ort oder am See entlang.',
      hr: 'Kočije su obično dostupne u centru Bleda i nude jednostavnu, tradicionalnu vožnju po mjestu ili uz jezero.',
      sr: 'Kočije su obično dostupne u centru Bleda i nude jednostavnu, tradicionalnu vožnju kroz mesto ili pored jezera.',
    },
    buttons: [{ label: 'See location', href: 'https://goo.gl/maps/YBuBG9FsBG3fTn8k6' }],
  },
  {
    image: '/suggestions/ojstrica.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Ojstrica viewpoint', sl: 'Ojstrica: Obvezno za lepe razglede na Bled', de: 'Ojstrica: Ein Muss für atemberaubende Bled-Aussichten', hr: 'Ojstrica: Obavezna destinacija za zadivljujuće poglede na Bled', sr: 'Ojstrica: Obavezna destinacija za zadivljujuće poglede na Bled' },
    description: {
      en: 'Ojstrica is one of the classic viewpoints above Lake Bled. The walk is short but steep in places, and the light is often especially good early in the morning.',
      sl: 'Ojstrica je ena klasičnih razglednih točk nad Blejskim jezerom. Pot je kratka, a ponekod strma; zgodaj zjutraj je svetloba pogosto najlepša.',
      de: 'Ojstrica ist einer der klassischen Aussichtspunkte über dem Bleder See. Der Weg ist kurz, stellenweise aber steil; früh am Morgen ist das Licht oft besonders schön.',
      hr: 'Ojstrica je jedan od klasičnih vidikovaca iznad Blejskog jezera. Staza je kratka, ali mjestimice strma; rano ujutro svjetlo je često najljepše.',
      sr: 'Ojstrica je jedan od klasičnih vidikovaca iznad Blejskog jezera. Staza je kratka, ali mestimično strma; rano ujutru svetlo je često najlepše.',
    },
    buttons: [{ label: 'See location', href: 'https://goo.gl/maps/eZ2eKdY8VvwFyCtMA' }],
  },
  {
    image: '/suggestions/skiing.webp', recurring: true, validFrom: '11-01', validTo: '03-31',
    title: { en: 'Skiing near Bled', sl: 'Smučarske avanture v alpski veličini okoli Bleda', de: 'Skiabenteuer im alpinen Glanz rund um Bled', hr: 'Skijaške avanture u alpskom sjaju oko Bleda', sr: 'Skijaške avanture u alpskom sjaju oko Bleda' },
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
    image: '/suggestions/sledding.webp', recurring: true, validFrom: '11-01', validTo: '03-31',
    title: { en: 'Sledding near Bled', sl: 'Sankaška sreča v zimski pravljici Bleda', de: 'Schlittenspaß im Winterwunderland Bled', hr: 'Sanjkanje u zimskoj bajci Bleda', sr: 'Sanjkanje u zimskoj bajci Bleda' },
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
    image: '/suggestions/vintgar.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Vintgar Gorge', sl: 'Odkrijte Vintgarsko sotesko: Naravni čudež blizu Bleda', de: 'Entdecken Sie die Vintgar-Schlucht: Ein Naturwunder bei Bled', hr: 'Otkrijte Vintgarsku klanac: Prirodno čudo Bleda', sr: 'Otkrijte Vintgarsku klisuru: Prirodno čudo Bleda' },
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
    image: '/suggestions/pokluska-soteska.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Pokljuka Gorge', sl: 'Odkrijte Pokljuško sotesko: Ledeniški čudež', de: 'Entdecken Sie die Pokljuka-Schlucht: Ein Gletscherwunder', hr: 'Otkrijte Pokljušku klanac: Ledenjačko čudo', sr: 'Otkrijte Pokljušku klisuru: Lednjačko čudo' },
    description: {
      en: 'Pokljuka Gorge is a quieter nature trip with impressive rock formations and forest paths. You can reach it by car, taxi or bike if you are comfortable with the distance.',
      sl: 'Pokljuška soteska je mirnejši izlet v naravo z zanimivimi skalnimi oblikami in gozdnimi potmi. Do nje lahko pridete z avtomobilom, taksijem ali kolesom, če vam razdalja ustreza.',
      de: 'Entdecken Sie die Wunder der Pokljuka-Schlucht, ein Zeugnis der Naturkunst, geformt durch den beständigen Fluss von Gletscherwässern. Erreichbar mit Fahrrad, Auto oder Taxi.',
      hr: 'Otkrijte čuda Pokljuške klisure, prekrasnog svjedočanstva prirodne umjetnosti oblikovanog stalnim tokom ledenjačkih voda. Dostupna biciklom, automobilom ili taksijem.',
      sr: 'Otkrijte čuda Pokljuške klisure, prelekog svedočanstva prirodne umetnosti oblikovanog stalnim tokom lednjačkih voda. Dostupna biciklom, automobilom ili taksijem.',
    },
    buttons: [{ label: 'See location', href: 'https://goo.gl/maps/7XM67f7YJF4PEQfB7' }],
  },
  {
    image: '/suggestions/radovna.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Radovna Valley', sl: 'Dolina Radovne: Hladen poletni pobeg', de: 'Radovna-Tal: Eine kühle Sommerauszeit', hr: 'Dolina Radovne: Hladan ljetni bijeg', sr: 'Dolina Radovne: Hladan letnji odmor' },
    description: {
      en: 'Radovna Valley is a peaceful drive from Bled and a good choice on warm days, with cooler air, quiet roads and mountain scenery.',
      sl: 'V srcu poletja Dolina Radovne nudi mirno zatočišče, kjer se lahko prepustite neokrnjeni naravi in uživate v osvežujočem gorskem zraku. Prijetna vožnja z avtomobilom vas bo pripeljala do tega idiličnega umika.',
      de: 'Im Herzen des Sommers bietet das Radovna-Tal eine ruhige Zuflucht, wo Sie die unberührte Natur genießen können. Eine bequeme Fahrt mit dem Auto führt Sie zu diesem stillen Versteck.',
      hr: 'Usred ljeta, Dolina Radovne nudi mirno utočište gdje možete uživati u neokrnjenoj prirodi i osvježavajućem planinskom zraku. Ugodna vožnja automobilom odvest će vas do ovog tihog skrovišta.',
      sr: 'Usred leta, Dolina Radovne nudi mirno utočište gde možete uživati u neokrnjenoj prirodi i osvežavajućem planinskom vazduhu. Ugodna vožnja automobilom odvešće vas do ovog tihog skrovišta.',
    },
    buttons: [{ label: 'See location', href: 'https://goo.gl/maps/vFJ5mQt98UzTsYyV7' }],
  },
  {
    image: '/suggestions/soca.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Soča River day trip', sl: 'Reka Soča: Potovanje skozi lepoto in zgodovino', de: 'Soča-Fluss: Eine Reise durch Schönheit und Geschichte', hr: 'Rijeka Soča: Putovanje kroz ljepotu i povijest', sr: 'Reka Soča: Putovanje kroz lepotu i istoriju' },
    description: {
      en: 'The Soča Valley is a longer but rewarding day trip, known for emerald water, mountain views and stops around Trenta, Bovec and Kobarid.',
      sl: 'Odpravite se na očarljivo potovanje vzdolž reke Soče, alpskega dragulja, ki ga je proslavila pojavitev v Narniji: Princ Kaspian. Reka, ki se razteza 137 km, izvira iz skrivnostnega kraškega vira v Trenti in je znana po osupljivih smaragdnih vodah.',
      de: 'Begeben Sie sich auf eine faszinierende Reise entlang der Soča, einem alpinen Juwel, das durch seine Erscheinung in \'Narnia: Prinz Kaspian\' berühmt wurde. Der 137 km lange Fluss ist für seine smaragdgrünen Gewässer bekannt.',
      hr: 'Krenite na zadivljujuće putovanje uz rijeku Soču, alpinski dragulj poznat po pojavi u \'Narniji: Princ Kaspian.\' Rijeka dugačka 137 km poznata je po svom upadljivom smaragdnom vodi.',
      sr: 'Krenite na zadivljujuće putovanje uz reku Soču, alpinski dragulj poznat po pojavi u \'Narniji: Princ Kaspian.\' Reka dugačka 137 km poznata je po svom upadljivom smaragdnom vodi.',
    },
    buttons: [{ label: 'Open roadmap', href: 'https://maps.app.goo.gl/wF97AUE6c4DLzQft8' }],
  },
  {
    image: '/suggestions/zelenci.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Zelenci Springs', sl: 'Zelenci', de: 'Zelenci: Natures aquatisches Meisterwerk', hr: 'Zelenci: Prirodno vodeno remek-djelo', sr: 'Zelenci: Prirodno vodno remek-delo' },
    description: {
      en: 'Zelenci Springs are an easy stop near Kranjska Gora. The short walk leads to clear green water and views toward the mountains.',
      sl: 'Zelenški izviri, skriti v očarljivi pokrajini Slovenije, so lep prikaz naravne umetnosti. Izviri blizu Kranjske Gore ustvarjajo osupljiv vizualni spektakel z živahnimi odtenki turkizne in smaragdne barve.',
      de: 'Die Zelenci-Quellen, eingebettet in die angenehmen Landschaften Sloweniens, sind ein fesselndes Zeugnis der Naturkunst. In der Nähe von Kranjska Gora gelegen, erzeugen diese Quellen ein atemberaubendes visuelles Spektakel.',
      hr: 'Zelenački izviri, smješteni u lijepim predjelima Slovenije, zadivljujući su prikaz prirodne umjetnosti. Blizu Kranjske Gore, ovi izviri stvaraju zapanjujući vizualni spektakl sa živim nijansama tirkizne i smaragdne.',
      sr: 'Zelenački izvori, smešteni u lepim predelima Slovenije, zadivljujući su prikaz prirodne umetnosti. Blizu Kranjske Gore, ovi izvori stvaraju zapanjujući vizualni spektakl sa živim nijansama tirkizne i smaragdne.',
    },
    buttons: [{ label: 'See location', href: 'https://goo.gl/maps/D3qZ2gi2jhoq4APAA' }],
  },
  {
    image: '/suggestions/bohinj.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Lake Bohinj', sl: 'Bohinjsko jezero: Slovensko naravno čudo', de: 'Wocheiner See: Sloweniens Naturwunder', hr: 'Bohinjsko jezero: Slovensko prirodno čudo', sr: 'Bohinjsko jezero: Slovensko prirodno čudo' },
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
    image: '/suggestions/radovljica.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Radovljica, Begunje and Kropa', sl: 'Radovljica, Begunje & Kropa: Potovanje skozi čas', de: 'Radovljica, Begunje & Kropa: Zeitreise durch charmante Städtchen', hr: 'Radovljica, Begunje & Kropa: Putovanje kroz šarmantne gradiće', sr: 'Radovljica, Begunje & Kropa: Putovanje kroz šarmantne gradiće' },
    description: {
      en: 'These nearby towns are good for a slower half-day trip, with old centres, local museums, craft heritage and places for coffee or lunch.',
      sl: 'Odpravite se na potovanje skozi čas v majhnih mestecih Radovljica, Begunje in Kropa, kjer preteklost oživi v lepem srečanju.',
      de: 'Begeben Sie sich auf eine Zeitreise durch die kleinen Städte Radovljica, Begunje und Kropa, wo die Vergangenheit lebendig wird.',
      hr: 'Krenite na putovanje kroz vrijeme u malim gradićima Radovljica, Begunje i Kropa, gdje prošlost oživi u čarobnom susretu.',
      sr: 'Krenite na putovanje kroz vreme u malim gradićima Radovljica, Begunje i Kropa, gde prošlost oživljava u čarobnom susretu.',
    },
    buttons: [{ label: 'Read more', href: 'https://www.radolca.si/en' }],
  },
  {
    image: '/suggestions/predjama.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Postojna Cave and Predjama Castle', sl: 'Postojnska jama & Predjamski grad: Potovanje v čudežno deželo', de: 'Höhle von Postojna & Burg Predjama: Eine Reise ins Wunderland', hr: 'Postojnska jama & Predjamski dvorac: Putovanje u čudesnu zemlju', sr: 'Postojnska jama & Predjamski dvorac: Putovanje u čudesnu zemlju' },
    description: {
      en: 'Postojna Cave and Predjama Castle make a full and easy day trip by car. The cave visit includes an underground train, so booking ahead is recommended in busy periods.',
      sl: 'Začnite dan s lepim obiskom Postojnske jame, ki velja za \'kraljico podzemnega sveta.\' Po eni uri vožnje boste prispeli do jame in se podali na nepozabno vožnjo s podzemnim vlakom skozi lepe komore.',
      de: 'Beginnen Sie Ihren Tag mit einem wunderbaren Ausflug in die Höhle von Postojna, die als "Königin der Unterwelt" gilt. Nach einer malerischen Stunde Fahrt erwartet Sie eine unvergessliche Fahrt mit dem Höhlenzug.',
      hr: 'Počnite dan čudesnim posjetom Postojnskoj jami, nazvanoj "Kraljicom podzemnog svijeta." Nakon sat vremena vožnje, polazite na nezaboravnu vožnju podzemnim vlakom kroz prekrasne dvorane.',
      sr: 'Počnite dan čudesnom posetom Postojnskoj jami, nazvanoj "Kraljicom podzemnog sveta." Nakon sat vremena vožnje, polazite na nezaboravnu vožnju podzemnim vozom kroz prelepe dvorane.',
    },
    buttons: [{ label: 'See location', href: 'https://goo.gl/maps/jRkjNKLfF5ZA94jR9' }],
  },
  {
    image: '/suggestions/horseriding.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Horseback riding near Bled', sl: 'Blejske konjeniške pustolovščine: Vožnja skozi naravno lepoto', de: 'Bled Reitabenteuer: Eine Reise durch die Naturschönheit', hr: 'Blejske konjičke avanture: Jahanje kroz prirodnu ljepotu', sr: 'Blejske konjičke avanture: Jahanje kroz prirodnu lepotu' },
    description: {
      en: 'Local horseback rides are available near Bled and can suit different experience levels. Contact the provider directly for timing, availability and route details.',
      sl: 'Doživite osupljivo pokrajino Bleda med jahalno pustolovščino, primerno za turiste vseh ravni jahanja. Naši angleško govoreči vodniki vas bodo peljali skozi nekatere od najslikovitejših lokacij.',
      de: 'Erleben Sie das wunderschöne Gelände von Bled auf einem Reiterabenteuer, geeignet für Touristen aller Reitstufen. Englischsprachige Guides führen Sie durch malerische Orte.',
      hr: 'Doživite prekrasan teren Bleda na konjičkoj avanturi, pogodnoj za turiste svih razina jahanja. Naši vodiči govore engleski i provest će vas kroz slikovite lokacije.',
      sr: 'Doživite predivan teren Bleda na konjičkoj avanturi, pogodnoj za turiste svih nivoa jahanja. Naši vodiči govore engleski i provešće vas kroz slikovite lokacije.',
    },
    buttons: [{ label: '+386 40 887 486', href: 'tel:0038640887486', target: '_self' }],
  },
  {
    image: '/suggestions/ljubljana.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Ljubljana day trip', sl: 'Odkrijte Ljubljano: Prestolnica zgodovine in lepote', de: 'Entdecken Sie Ljubljana: Eine Hauptstadt der Geschichte und Schönheit', hr: 'Otkrijte Ljubljanu: Prijestolnica povijesti i ljepote', sr: 'Otkrijte Ljubljanu: Prestonica istorije i lepote' },
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
    image: '/suggestions/velikaplanina.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Velika Planina', sl: 'Velika Planina: Visokogorski raj v Evropi', de: 'Velika Planina: Ein Hochgebirgsparadies in Europa', hr: 'Velika Planina: Visokoplaninska oaza u Europi', sr: 'Velika Planina: Visokoplaninska oaza u Evropi' },
    description: {
      en: 'Velika Planina is known for its high-mountain pasture, herdsmen\'s huts and wide views. Check cable car times and weather before setting off.',
      sl: 'Gnezdena v visokogorju Evrope, je Velika Planina slikovita pastirska vasica, kjer tradicija in narava soobstajata v harmoniji.',
      de: 'Eingebettet in die Hochgebirge Europas, ist Velika Planina ein malerisches Hirtendorf, in dem Tradition und Natur in Harmonie nebeneinander existieren.',
      hr: 'Smještena u visokim planinama Europe, Velika Planina je slikovito pastirsko selo u kojemu tradicija i priroda koegzistiraju u harmoniji.',
      sr: 'Smeštena u visokim planinama Evrope, Velika Planina je slikovito pastirsko selo u kome tradicija i priroda koegzistiraju u harmoniji.',
    },
    buttons: [{ label: 'See location', href: 'https://www.velikaplanina.si/en/' }],
  },
  {
    image: '/suggestions/ziplinedolinka.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Zipline Dolinka', sl: 'Zipline Dolinka: Letite skozi adrenalinska doživetja', de: 'Zipline Dolinka: Gleiten Sie durch malerische Nervenkitzel', hr: 'Zipline Dolinka: Letite kroz uzbudljive prizore', sr: 'Zipline Dolinka: Letite kroz uzbudljive prizore' },
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
    image: '/suggestions/piran.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Piran and the Slovenian coast', sl: 'Od Bleda do Portorož in Piran: Slikovit pobeg ob slovenski obali', de: 'Von Bled nach Portorož und Piran: Ein malerischer slowenischer Ausflug', hr: 'Od Bleda do Portorož i Piran: Slikovit slovenački bijeg', sr: 'Od Bleda do Portorož i Piran: Slikovit slovenački odmor' },
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
    image: '/suggestions/alpe.webp', recurring: false, validFrom: null, validTo: null,
    title: { en: 'Mountain day trips', sl: 'Gorski pobegi iz Bleda: Veličastje narave vas čaka', de: 'Bled Bergausflüge: Natures Majestät erwartet Sie', hr: 'Planinski izleti iz Bleda: Veličanstvo prirode čeka', sr: 'Planinski izleti iz Bleda: Veličanstvo prirode čeka' },
    description: {
      en: 'Bled is a good base for mountain walks and hikes in the Julian Alps and Triglav National Park. Choose a route that matches your fitness, equipment and the weather.',
      sl: 'Pripravite se na potovanje v srce lepe naravne lepote Slovenije z enodnevnimi izleti iz Bleda v okoliške gore. Pred vami se razvija tapiserija poti, ki vabi pohodnike v pristne pokrajine Julijanskih Alp in Triglavskega narodnega parka.',
      de: 'Begeben Sie sich auf eine Reise ins Herz der Naturschönheit Sloweniens mit Tagesausflügen von Bled in die umliegenden Berge. Ein Teppich von Wanderwegen lädt Sie ein, die unberührten Landschaften der Julischen Alpen zu erkunden.',
      hr: 'Pripremite se za putovanje u srce prirodne ljepote Slovenije s jednodnevnim izletima iz Bleda u okolne planine. Tapiserija staza poziva planinate da se uronu u netaknute krajolike Julijskih Alpa.',
      sr: 'Pripremite se za putovanje u srce prirodne lepote Slovenije s jednodnevnim izletima iz Bleda u okolne planine. Tapiserija staza poziva planinare da se uronu u netaknute krajolike Julijskih Alpa.',
    },
    buttons: [{ label: 'Find a suitable mountain', href: 'https://www.hike.uno/hiking/mountain_ranges' }],
  },
]

export const SEED_FAQ: SeedFaq[] = [
  {
    title: { en: 'Breakfast delivery', sl: 'Dostava zajtrka', de: 'Frühstückslieferung', hr: 'Dostava doručka', sr: 'Dostava doručka' },
    description: {
      en: 'You can order a Bled Breakfast Basket for delivery to the apartment. It usually includes local bread and pastries, milk, yoghurt, butter, cheese, free-range eggs, homemade salami, honey, jam, seasonal fruit, granola and apple juice.',
      sl: 'Naročite lahko Bled Breakfast Basket z dostavo v apartma. Običajno vključuje lokalni kruh in pecivo, mleko, jogurt, maslo, sir, jajca s proste reje, domačo salamo, med, marmelado, sezonsko sadje, granolo in jabolčni sok.',
      de: 'Bestellen Sie einen Bled Breakfast Basket und lassen Sie ihn direkt in die Wohnung liefern. Er enthält Produkte von lokalen Bauernhöfen und Bäckereien: frisches Brot, Croissants, Milch, Joghurt, Butter, Käse, Freilandeier, hausgemachte Salami, Honig, Marmeladen, saisonale Früchte, Granola und Apfelsaft.',
      hr: 'Naručite Bled Breakfast Basket i primite ga direktno u apartman. Uključuje proizvode s lokalnih farmi i pekara: svježi kruh, kroasane, mlijeko, jogurte, maslac, sir, jaja iz slobodnog uzgoja, domaću salamu, med, džemove, sezonsko voće, granolu i sok od jabuke.',
      sr: 'Naručite Bled Breakfast Basket i primite ga direktno u apartman. Uključuje proizvode sa lokalnih farmi i pekara: svež hleb, kroasane, mleko, jogurte, puter, sir, jaja iz slobodnog uzgoja, domaću salamu, med, džemove, sezonsko voće, granolu i sok od jabuke.',
    },
    links: [{ label: 'Order breakfast / Naroči zajtrk', href: '/guest/breakfast' }],
  },
  {
    title: { en: 'Groceries nearby', sl: 'Bližnje trgovine', de: 'Einkaufsmöglichkeiten in der Nähe', hr: 'Obližnje trgovine', sr: 'Obližnje prodavnice' },
    description: {
      en: 'On the way to the lake you will find a smaller Mercator shop for quick essentials. Two larger grocery stores, Mercator and Spar, are also nearby.',
      sl: 'Na poti do jezera je manjša trgovina Mercator za hiter nakup osnovnih stvari. V bližini sta tudi večji trgovini Mercator in Spar.',
      de: 'Auf dem Weg zum See finden Sie einen kleineren Mercator-Laden für schnelle Besorgungen. Zwei größere Supermärkte, Mercator und Spar, sind ebenfalls in der Nähe.',
      hr: 'Na putu prema jezeru naći ćete manji Mercator za brzu kupovinu. Dva veća supermarketa, Mercator i Spar, također su u blizini.',
      sr: 'Na putu prema jezeru naći ćete manji Mercator za brzu kupovinu. Dva veća supermarketa, Mercator i Spar, takođe su u blizini.',
    },
    links: [
      { label: 'Small Mercator', href: 'https://goo.gl/maps/Sk76eFdxdwDwPFWW9' },
      { label: 'Mercator', href: 'https://goo.gl/maps/z7P9Laq8R9ZtFcc36' },
      { label: 'Spar', href: 'https://goo.gl/maps/YvM5AbGeoeWnqNDy5' },
    ],
  },
  {
    title: { en: 'Nearest path to Lake Bled', sl: 'Najkrajša pot do Blejskega jezera', de: 'Kürzester Weg zum Bleder See', hr: 'Najbliži put do Blejskog jezera', sr: 'Najbliži put do Blejskog jezera' },
    description: {
      en: 'The shortest path to the lake is about 800 metres. It starts along a local road without a pavement, so take a little care at the beginning. It is a commonly used route.',
      sl: 'Najkrajša pot do jezera je dolga približno 800 metrov. Začne se po lokalni cesti brez pločnika, zato bodite na začetku nekoliko previdni. Pot domačini in gostje pogosto uporabljajo.',
      de: 'Der kürzeste Weg zum See ist etwa 800 Meter lang und beginnt auf einer Nebenstraße ohne Gehsteig. Er wirkt anfangs vielleicht ungewöhnlich, wird aber häufig genutzt und ist ungefährlich.',
      hr: 'Najkraći put do jezera dugačak je oko 800 metara i počinje lokalnom cestom bez pločnika. Isprva može izgledati neobično, ali se često koristi i nije opasan.',
      sr: 'Najkraći put do jezera dugačak je oko 800 metara i počinje lokalnim putem bez trotoara. Isprva može izgledati neobično, ali se često koristi i nije opasan.',
    },
    links: [
      { label: 'Nearest path', href: 'https://goo.gl/maps/eEqwY1ne6pniw2rB6' },
      { label: 'Alternative quieter route', href: 'https://goo.gl/maps/EZmGyMntWcTCx31d6' },
    ],
  },
  {
    title: { en: 'Path to Bled Castle', sl: 'Pot do Blejskega gradu', de: 'Weg zur Burg Bled', hr: 'Put do Blejskog dvorca', sr: 'Put do Blejskog dvorca' },
    description: {
      en: 'You can walk from the apartment to Bled Castle in about 15 minutes. The route includes stairs, so it is worth planning ahead if you have a stroller.',
      sl: 'Do Blejskega gradu lahko iz apartmaja pridete peš v približno 15 minutah. Pot vključuje stopnice, zato je pri otroškem vozičku dobro pot načrtovati vnaprej.',
      de: 'Sie können in etwa 15 Minuten zu Fuß direkt von der Wohnung zur Burg Bled gelangen. Der Weg beinhaltet Treppen, daher möchten Familien mit Kleinkind oder Kinderwagen die Route im Voraus planen.',
      hr: 'Do Blejskog dvorca možete hodati pješice izravno iz apartmana za oko 15 minuta. Ruta uključuje stepenice, pa obitelji s bebom ili kolicima možda žele unaprijed planirati put.',
      sr: 'Do Blejskog dvorca možete hodati pešice direktno iz apartmana za oko 15 minuta. Ruta uključuje stepenice, pa porodice sa bebom ili kolicima možda žele unapred planirati put.',
    },
    links: [{ label: 'Path to the castle', href: 'https://goo.gl/maps/SuBNG7hF5tMgexL77' }],
  },
  {
    title: { en: 'Outdoor activities', sl: 'Aktivnosti na prostem', de: 'Sportliche Aktivitäten', hr: 'Sportske aktivnosti', sr: 'Sportske aktivnosti' },
    description: {
      en: 'For hiking, cycling, water activities and guided trips around Bled or elsewhere in Slovenia, OUTdoor Capital is a useful starting point.',
      sl: 'Za pohodništvo, kolesarjenje, vodne aktivnosti in vodene izlete na Bledu ali drugod po Sloveniji je OUTdoor Capital uporabno izhodišče.',
      de: 'Wenn Sie Outdoor-Aktivitäten in Bled oder anderswo in Slowenien suchen, ist die OUTdoor Capital Website ein guter Ausgangspunkt. Sie finden Ideen für Wandern, Radfahren, Wasseraktivitäten und geführte Abenteuer.',
      hr: 'Ako tražite aktivnosti u prirodi u Bledu ili drugdje u Sloveniji, web stranica OUTdoor Capital odlično je polazište. Naći ćete ideje za planinarenje, biciklizam, vodene aktivnosti i vođene avanture.',
      sr: 'Ako tražite aktivnosti u prirodi u Bledu ili drugde u Sloveniji, sajt OUTdoor Capital je odlično polazište. Naći ćete ideje za planinarenje, biciklizam, vodene aktivnosti i vođene avanture.',
    },
    links: [{ label: 'Explore activities', href: 'https://outdoor.capital/maple-pine-bled/' }],
  },
  {
    title: { en: 'Bakeries', sl: 'Pekarne', de: 'Bäckereien', hr: 'Pekare', sr: 'Pekare' },
    description: {
      en: 'There are two bakeries close to the apartment. The map links are useful for opening hours and Sunday availability.',
      sl: 'V bližini apartmaja sta dve pekarni. Na spodnjih povezavah lahko preverite odpiralni čas in ali sta odprti ob nedeljah.',
      de: 'In der Nähe der Wohnung gibt es zwei Bäckereien. Über die Kartenlinks unten können Sie auch die Öffnungszeiten und die Sonntagsöffnung prüfen.',
      hr: 'U blizini apartmana nalaze se dvije pekare. Na linkovima ispod možete provjeriti radno vrijeme i jesu li otvorene nedjeljom.',
      sr: 'U blizini apartmana nalaze se dve pekare. Na linkovima ispod možete proveriti radno vreme i da li su otvorene nedeljom.',
    },
    links: [
      { label: 'Bakery Hitri kruhek', href: 'https://goo.gl/maps/LHxF5x1CktHACWxp9' },
      { label: 'Bakery Planika', href: 'https://goo.gl/maps/36eWoM7fLWAqHvGd7' },
    ],
  },
  {
    title: { en: 'Tourist train around the lake', sl: 'Turistični vlak okoli jezera', de: 'Touristenzug um den See', hr: 'Turistički vlak oko jezera', sr: 'Turistički voz oko jezera' },
    description: {
      en: 'The tourist train circles Lake Bled. The nearest stop for you is Zdraviliški park.',
      sl: 'Turistični vlak kroži okoli Blejskega jezera. Najbližja postaja je Zdraviliški park.',
      de: 'Der Touristenzug fährt um den Bleder See. Die nächste Haltestelle für Sie ist Zdraviliški park.',
      hr: 'Turistički vlak kruži oko Blejskog jezera. Najbliža postaja za vas je Zdraviliški park.',
      sr: 'Turistički voz kruži oko Blejskog jezera. Najbliža stanica za vas je Zdraviliški park.',
    },
    links: [
      { label: 'Tourist train timetable', href: 'https://www.bled.si/en/information/getting-around-bled/20190920131939/tourist-train/' },
      { label: 'Nearest station', href: 'https://goo.gl/maps/MrymrQrLoYBSzzzM8' },
    ],
  },
  {
    title: { en: 'Buses', sl: 'Avtobusi', de: 'Busse', hr: 'Autobusi', sr: 'Autobusi' },
    description: {
      en: 'There is a nearby bus stop for local and regional transport. For departures and current timetables, please check the official Ljubljana bus station website.',
      sl: 'V bližini je avtobusna postaja za lokalni in medkrajevni promet. Za odhode in aktualne vozne rede preverite uradno spletno stran avtobusne postaje Ljubljana.',
      de: 'In der Nähe gibt es eine Bushaltestelle für lokalen und regionalen Verkehr. Abfahrten und aktuelle Fahrpläne finden Sie auf der offiziellen Website des Busbahnhofs Ljubljana.',
      hr: 'U blizini se nalazi autobusna stanica za lokalni i regionalni prijevoz. Odlaske i aktualne vozne redove provjerite na službenoj stranici autobusnog kolodvora Ljubljana.',
      sr: 'U blizini se nalazi autobuska stanica za lokalni i regionalni prevoz. Polaske i aktuelne vozne redove proverite na zvaničnom sajtu autobuske stanice Ljubljana.',
    },
    links: [{ label: 'Bus timetable', href: 'https://www.ap-ljubljana.si/' }],
  },
  {
    title: { en: 'Trains', sl: 'Vlaki', de: 'Züge', hr: 'Vlakovi', sr: 'Vozovi' },
    description: {
      en: 'Bled Jezero station is convenient for trips toward Bohinjska Bistrica, Most na Soči and Nova Gorica. If you are travelling toward Ljubljana or other major destinations, Lesce-Bled station is usually the more practical choice.',
      sl: 'Postaja Bled Jezero je priročna za potovanja proti Bohinjski Bistrici, Mostu na Soči in Novi Gorici. Za Ljubljana in druge večje destinacije je Lesce-Bled postaja navadno praktičnejša izbira.',
      de: 'Der Bahnhof Bled Jezero eignet sich für Fahrten nach Bohinjska Bistrica, Most na Soči und Nova Gorica. Für Ljubljana und andere größere Ziele ist der Bahnhof Lesce-Bled meist praktischer.',
      hr: 'Postaja Bled Jezero pogodna je za putovanja prema Bohinjskoj Bistrici, Mostu na Soči i Novoj Gorici. Za Ljubljana i druge veće destinacije, postaja Lesce-Bled obično je praktičniji izbor.',
      sr: 'Stanica Bled Jezero pogodna je za putovanja prema Bohinjskoj Bistrici, Mostu na Soči i Novoj Gorici. Za Ljubljanu i druge veće destinacije, stanica Lesce-Bled obično je praktičniji izbor.',
    },
    links: [
      { label: 'Slovenian railways', href: 'https://potniski.sz.si/' },
      { label: 'Bled Jezero station', href: 'https://goo.gl/maps/vWPYX1CBgq1ZfND3A' },
      { label: 'Lesce-Bled station', href: 'https://goo.gl/maps/a553P2DtEtb3aEvQA' },
    ],
  },
  {
    title: { en: 'Taxi & transfers', sl: 'Taksi in transferji', de: 'Taxi & Transfers', hr: 'Taxi i transferi', sr: 'Taxi i transferi' },
    description: {
      en: 'For airport transfers or longer trips in the region, we recommend Bled Transfers. Private transfers can be booked in advance through their website.',
      sl: 'Za prevoz z letališča ali daljše vožnje po regiji priporočamo Bled Transfers. Zasebne transferje lahko rezervirate vnaprej na njihovi spletni strani.',
      de: 'Für komfortable Transfers zum Flughafen Ljubljana oder andere Ziele in der Region empfehlen wir Bled Transfers. Sie bieten Privattransfers mit Vorabreservierung an.',
      hr: 'Za udobne transfere do aerodroma Ljubljana ili bilo gdje u regiji preporučujemo Bled Transfers. Nude privatne transfere s prethodnom rezervacijom.',
      sr: 'Za udobne transfere do aerodroma Ljubljana ili bilo gde u regiji preporučujemo Bled Transfers. Nude privatne transfere s prethodnom rezervacijom.',
    },
    links: [{ label: 'Bled Transfers', href: 'https://bledtransfers.si/' }],
  },
  {
    title: { en: 'Rent a bike', sl: 'Izposoja kolesa', de: 'Fahrrad mieten', hr: 'Iznajmljivanje bicikla', sr: 'Iznajmljivanje bicikla' },
    description: {
      en: 'Bled has several bike rental options. The official Bled website keeps an updated overview of standard bicycle rental providers.',
      sl: 'Bled ima več možnosti izposoje koles. Na uradni spletni strani Bleda najdete aktualen pregled ponudnikov.',
      de: 'Bled bietet mehrere Fahrradverleihoptionen. Die offizielle Bled-Website führt eine aktuelle Übersicht der Anbieter.',
      hr: 'Bled ima nekoliko opcija iznajmljivanja bicikala. Službena web stranica Bleda održava ažurirani pregled pružatelja usluga.',
      sr: 'Bled ima nekoliko opcija iznajmljivanja bicikala. Zvanični sajt Bleda održava ažurirani pregled pružaoca usluga.',
    },
    links: [{ label: 'Bike rental options', href: 'https://www.bled.si/en/information/getting-around-bled/2019100917061847/bike-and-ebike-rental/' }],
  },
  {
    title: { en: 'Rent an eBike', sl: 'Izposoja e-kolesa', de: 'E-Bike mieten', hr: 'Iznajmljivanje e-bicikla', sr: 'Iznajmljivanje e-bicikla' },
    description: {
      en: 'For eBike rental or organised eBike tours, we recommend checking local providers. You can also ask whether delivery to the apartment and later pick-up are available.',
      sl: 'Za izposojo e-kolesa ali organizirane e-kolesarske ture priporočamo lokalne ponudnike. Vprašajte, ali nudijo dostavo in prevzem pri apartmaju.',
      de: 'Für E-Bike-Verleih oder geführte E-Bike-Touren empfehlen wir lokale Anbieter. Fragen Sie, ob Lieferung zur Wohnung und spätere Abholung möglich sind.',
      hr: 'Za iznajmljivanje e-bicikla ili organizirane e-biciklističke ture preporučujemo lokalne pružatelje usluga. Možete pitati je li dostupna dostava do apartmana i kasniji preuzim.',
      sr: 'Za iznajmljivanje e-bicikla ili organizovane e-biciklističke ture preporučujemo lokalne pružaoce usluga. Možete pitati da li je dostupna dostava do apartmana i kasniji preuzet.',
    },
    links: [{ label: 'eBike rental', href: 'https://www.ab-bike.si/en' }],
  },
  {
    title: { en: 'Getting around Bled', sl: 'Gibanje po Bledu', de: 'Fortbewegung in Bled', hr: 'Kretanje po Bledu', sr: 'Kretanje po Bledu' },
    description: {
      en: 'Bled is easy to explore on foot, by bike, by bus, by taxi or by the traditional Pletna boat. The official Bled website has a good overview of transport options and practical tips for moving around the area.',
      sl: 'Bled je enostaven za raziskovanje peš, s kolesom, z avtobusom, s taksijem ali s tradicionalno pletno. Na uradni spletni strani Bleda najdete dober pregled prevoznih možnosti in praktičnih nasvetov.',
      de: 'Bled lässt sich leicht zu Fuß, mit dem Fahrrad, dem Bus, dem Taxi oder dem traditionellen Pletna-Boot erkunden. Die offizielle Bled-Website bietet einen guten Überblick über Transportmöglichkeiten.',
      hr: 'Bled je lako istraživati pješice, biciklom, autobusom, taksijem ili tradicionalnim čamcem Pletna. Službena web stranica Bleda nudi dobar pregled prijevoznih opcija i praktičnih savjeta.',
      sr: 'Bled je lako istraživati pešice, biciklom, autobusom, taksijem ili tradicionalnim čamcem Pletna. Zvanični sajt Bleda nudi dobar pregled prevoznih opcija i praktičnih saveta.',
    },
    links: [{ label: 'Getting around Bled', href: 'https://www.bled.si/en/information/getting-around-bled/' }],
  },
]

export const SEED_HOWTO: SeedHowto[] = [
  {
    image: '/how-to/ac.webp',
    title: { en: 'Air conditioning', sl: 'Klimatska naprava', de: 'Klimaanlage', hr: 'Klima uređaj', sr: 'Klima uređaj' },
    description: {
      en: 'On the upper floor there is an air conditioner with a standard remote control. Please adjust it however it suits you best.',
      sl: 'Na zgornjem nadstropju je klimatska naprava s standardnim daljinskim upravljalnikom. Nastavite jo po svojih željah.',
      de: 'Im Obergeschoss befindet sich eine Klimaanlage mit einer Standardfernbedienung. Stellen Sie sie nach Ihren Wünschen ein.',
      hr: 'Na gornjem katu nalazi se klima uređaj sa standardnim daljinskim upravljačem. Namjestite ga kako vam najviše odgovara.',
      sr: 'Na gornjem spratu nalazi se klima uređaj sa standardnim daljinskim upravljačem. Podesite ga kako vam najviše odgovara.',
    },
  },
  {
    image: '/how-to/tv.webp',
    title: { en: 'TV', sl: 'Televizija', de: 'Fernseher', hr: 'Televizor', sr: 'Televizor' },
    description: {
      en: 'The apartment has a TCL 55P69B 4K UHD TV with Google TV. You can use it for regular TV content, streaming apps and casting through Google TV or Chromecast. Use the large remote to switch the HDMI source and the small remote to control the TV.',
      sl: 'Apartma ima televizor TCL 55P69B 4K UHD z Google TV. Uporabite ga za redne televizijske kanale, pretočne aplikacije in predvajanje prek Google TV ali Chromecast. Z velikim daljincem preklopite HDMI vir, z malim pa upravljate televizor.',
      de: 'Die Wohnung verfügt über einen TCL 55P69B 4K UHD TV mit Google TV. Nutzen Sie ihn für reguläre TV-Inhalte, Streaming-Apps und Casting über Google TV oder Chromecast. Mit der großen Fernbedienung wechseln Sie den HDMI-Eingang, mit der kleinen steuern Sie den Fernseher.',
      hr: 'Apartman ima TCL 55P69B 4K UHD TV s Google TV-om. Koristite ga za redovne TV kanale, streaming aplikacije i prijenos putem Google TV ili Chromecast-a. Velikim daljincem mijenjate HDMI izvor, malim upravljate televizorom.',
      sr: 'Apartman ima TCL 55P69B 4K UHD TV sa Google TV-om. Koristite ga za redovne TV kanale, streaming aplikacije i prenos putem Google TV ili Chromecast-a. Velikim daljinskim menjate HDMI izvor, malim upravljate televizorom.',
    },
  },
  {
    image: '/how-to/kids-safety.webp',
    title: { en: 'Safety gate for kids', sl: 'Varnostna vrata za otroke', de: 'Kinderschutzgitter', hr: 'Zaštitna vrata za djecu', sr: 'Zaštitna vrata za decu' },
    description: {
      en: 'The stairs are protected by a child safety gate. To unlock or lock it, press and twist the button on the holder.',
      sl: 'Stopnišče je zaščiteno z varnostnimi vrati za otroke. Za odklepanje ali zaklepanje pritisnite in zavrtite gumb na držalu.',
      de: 'Die Treppe ist durch ein Kinderschutzgitter gesichert. Zum Öffnen oder Schließen den Knopf am Halter drücken und drehen.',
      hr: 'Stubište je zaštićeno sigurnosnim vratima za djecu. Za otključavanje ili zaključavanje pritisnite i zavrtite gumb na nosaču.',
      sr: 'Stepenište je zaštićeno sigurnosnim vratima za decu. Za otključavanje ili zaključavanje pritisnite i zavrtite dugme na nosaču.',
    },
  },
  {
    image: '/how-to/ventilation-control.webp',
    title: { en: 'Automatic ventilation', sl: 'Samodejno prezračevanje', de: 'Automatische Lüftung', hr: 'Automatska ventilacija', sr: 'Automatska ventilacija' },
    description: {
      en: 'The ventilation controls are located in the lower part of the apartment near the sofa. The right-side control operates ventilation with heat recovery and is the recommended setting for everyday use.',
      sl: 'Upravljalnik prezračevanja se nahaja v spodnjem delu apartmaja pri kavču. Desni upravljalnik nadzoruje prezračevanje s toplotnim rekuperatorjem in je priporočena nastavitev za vsakodnevno uporabo.',
      de: 'Die Lüftungssteuerung befindet sich im unteren Teil der Wohnung beim Sofa. Die rechte Steuerung betreibt die Lüftung mit Wärmerückgewinnung und ist die empfohlene Einstellung für den Alltag.',
      hr: 'Upravljač ventilacije nalazi se u donjem dijelu apartmana kod sofe. Desni upravljač kontrolira ventilaciju s rekuperacijom topline i preporučena je postavka za svakodnevnu upotrebu.',
      sr: 'Upravljač ventilacije nalazi se u donjem delu apartmana kod sofe. Desni upravljač kontroliše ventilaciju s rekuperacijom toplote i preporučena je postavka za svakodnevnu upotrebu.',
    },
  },
  {
    image: '/how-to/blinds-control.webp',
    title: { en: 'Blinds', sl: 'Žaluzije', de: 'Jalousien', hr: 'Žaluzine', sr: 'Žaluzine' },
    description: {
      en: 'Press and hold the up arrow for about a second to raise the blinds and the down arrow to lower them. A short press stops them.',
      sl: 'Pridržite puščico gor za sekundo, da dvignete žaluzijo, in puščico dol, da jo spustite. Kratki pritisk jo ustavi.',
      de: 'Pfeil nach oben ca. eine Sekunde gedrückt halten, um die Jalousie hochzufahren, Pfeil nach unten zum Herunterlassen. Ein kurzer Druck stoppt sie.',
      hr: 'Pritisnite i držite strelicu gore oko sekunde za podizanje žaluzine, strelicu dolje za spuštanje. Kratki pritisak zaustavlja je.',
      sr: 'Pritisnite i držite strelicu gore oko sekunde za podizanje žaluzine, strelicu dole za spuštanje. Kratak pritisak zaustavlja je.',
    },
  },
  {
    image: '/how-to/roof-window.webp',
    title: { en: 'Roof window', sl: 'Strešno okno', de: 'Dachfenster', hr: 'Krovni prozor', sr: 'Krovni prozor' },
    description: {
      en: 'Use the arrow buttons to open or close the roof window, and the middle button to stop it at any position. Please do not operate the window manually.',
      sl: 'Z gumbi s puščicami odprite ali zaprite strešno okno, srednji gumb ga ustavi na katerem koli položaju. Prosimo, ne upravljajte okna ročno.',
      de: 'Mit den Pfeiltasten das Dachfenster öffnen oder schließen, mit der mittleren Taste an jeder Position stoppen. Bitte das Fenster nicht manuell bedienen.',
      hr: 'Strelicama otvorite ili zatvorite krovni prozor, srednjim gumbom zaustavite ga na bilo kojoj poziciji. Molimo ne upravljajte prozorom ručno.',
      sr: 'Strelicama otvorite ili zatvorite krovni prozor, srednjim dugmetom zaustavite ga na bilo kojoj poziciji. Molimo ne upravljajte prozorom ručno.',
    },
  },
  {
    image: '/how-to/gorenje-h30mobs10hc-oven.jpg',
    title: { en: 'Gorenje combination oven', sl: 'Kombinirana pečica Gorenje', de: 'Gorenje Kombi-Backofen', hr: 'Gorenje kombinirana pećnica', sr: 'Gorenje kombinovana rerna' },
    description: {
      en: 'The kitchen has a Gorenje H30MOBS10HC combination oven. It can be used as a microwave, convection oven, grill and air-fry oven. Detailed instructions are available in the PDF below.',
      sl: 'V kuhinji je kombinirana pečica Gorenje H30MOBS10HC. Deluje kot mikrovalovna, konvekcijska pečica, žar in pečica za airfry. Podrobna navodila so na voljo v PDF-ju spodaj.',
      de: 'In der Küche steht ein Gorenje H30MOBS10HC Kombinationsgerät. Es kann als Mikrowelle, Heißluftbackofen, Grill und Air-Fryer genutzt werden. Eine ausführliche Anleitung steht als PDF bereit.',
      hr: 'U kuhinji se nalazi Gorenje H30MOBS10HC kombinirana pećnica. Može se koristiti kao mikrovalna, konvekcijska pećnica, roštilj i air-fry pećnica. Detaljne upute dostupne su u PDF-u ispod.',
      sr: 'U kuhinji se nalazi Gorenje H30MOBS10HC kombinovana rerna. Može se koristiti kao mikrotalasna, konvekcijska rerna, roštilj i air-fry rerna. Detaljna uputstva dostupna su u PDF-u ispod.',
    },
    links: [{ label: 'Open PDF manual', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }],
  },
  {
    title: { en: 'Baby chair', sl: 'Otroški stolček', de: 'Babystuhl', hr: 'Dječja stolica', sr: 'Dečja stolica' },
    description: {
      en: 'In the kitchen cabinet under the microwave you will find a child-seat kit that fits the kitchen chair.',
      sl: 'V kuhinjski omari pod mikrovalovno pečico najdete komplet za otroški sedež, ki se pritrdi na kuhinjski stol.',
      de: 'Im Küchenschrank unter der Mikrowelle finden Sie ein Kindersitzset, das auf den Küchenstuhl passt.',
      hr: 'U kuhinjskom ormariću ispod mikrovalne pećnice naći ćete komplet dječjeg sjedala koji odgovara kuhinjskoj stolici.',
      sr: 'U kuhinjskom ormariću ispod mikrotalasne naći ćete komplet dečjeg sedišta koji odgovara kuhinjskoj stolici.',
    },
  },
  {
    title: { en: 'Bed safety for kids', sl: 'Varnostna ograja za posteljo', de: 'Bettschutzgitter für Kinder', hr: 'Zaštitna ograda za krevet', sr: 'Zaštitna ograda za krevet' },
    description: {
      en: 'If you need a bed safety rail, it is stored under the first single bed. Lift the mattress and place the rail on the bed where you need it.',
      sl: 'Če potrebujete varnostno ograjo za posteljo, je shranjena pod prvo enojno posteljo. Dvignite vzmetnico in namestite ograjo tja, kjer jo potrebujete.',
      de: 'Falls Sie ein Bettschutzgitter benötigen, befindet es sich unter dem ersten Einzelbett. Heben Sie die Matratze an und platzieren Sie das Gitter dort, wo Sie es brauchen.',
      hr: 'Ako vam treba zaštitna ograda za krevet, pohranjena je ispod prvog jednostrukog kreveta. Podignite madrac i postavite ogradu tamo gdje vam treba.',
      sr: 'Ako vam treba zaštitna ograda za krevet, pohranjena je ispod prvog jednostrukog kreveta. Podignite madrac i postavite ogradu tamo gde vam treba.',
    },
  },
  {
    image: '/how-to/outdoor.webp',
    title: { en: 'Outdoor light', sl: 'Zunanja svetilka', de: 'Außenbeleuchtung', hr: 'Vanjska rasvjeta', sr: 'Spoljašnja rasveta' },
    description: {
      en: 'The outdoor light switch is by the entrance. Top position: always on. Middle: off. Bottom: motion sensor.',
      sl: 'Stikalo za zunanjo svetilko je pri vhodu. Zgoraj: vedno vklopljeno. Na sredini: izklopljeno. Spodaj: senzor gibanja.',
      de: 'Der Schalter für die Außenbeleuchtung befindet sich beim Eingang. Oben: dauerhaft an. Mitte: aus. Unten: Bewegungssensor.',
      hr: 'Prekidač za vanjsku rasvjetu nalazi se kod ulaza. Gore: uvijek uključeno. Sredina: isključeno. Dolje: senzor pokreta.',
      sr: 'Prekidač za spoljašnju rasvetu nalazi se kod ulaza. Gore: uvek uključeno. Sredina: isključeno. Dole: senzor pokreta.',
    },
  },
  {
    image: '/how-to/kitchen.webp',
    title: { en: 'Kitchen light', sl: 'Kuhinjska svetilka', de: 'Küchenbeleuchtung', hr: 'Kuhinjska rasvjeta', sr: 'Kuhinjska rasveta' },
    description: {
      en: 'Under the kitchen cabinet above the stove there is a blue touch switch. Touch to turn on/off, hold to adjust brightness.',
      sl: 'Pod kuhinjsko omaro nad štedilnikom je modro tipkalno stikalo. Dotaknite se za vklop/izklop, pridržite za nastavitev svetlosti.',
      de: 'Unter dem Küchenschrank über dem Herd befindet sich ein blauer Touch-Schalter. Antippen zum Ein-/Ausschalten, gedrückt halten zum Dimmen.',
      hr: 'Ispod kuhinjskog ormara iznad štednjaka nalazi se plavi touch prekidač. Dodirnite za uključivanje/isključivanje, dugo pritisnite za podešavanje svjetline.',
      sr: 'Ispod kuhinjskog ormara iznad šporeta nalazi se plavi touch prekidač. Dodirnite za uključivanje/isključivanje, dugo pritisnite za podešavanje svetline.',
    },
  },
  {
    image: '/how-to/bathroom.webp',
    title: { en: 'Bathroom heating', sl: 'Kopalniško ogrevanje', de: 'Badezimmerheizung', hr: 'Grijanje kupaonice', sr: 'Grejanje kupatila' },
    description: {
      en: 'By the bathroom entrance there is a switch with a heating icon. Press it to activate additional bathroom heating for about 30 minutes.',
      sl: 'Pri vhodu v kopalnico je stikalo z ikono ogrevanja. Pritisnite ga za vklop dodatnega kopalničnega ogrevanja za približno 30 minut.',
      de: 'Beim Badezimmereingang gibt es einen Schalter mit einem Heizsymbol. Drücken Sie ihn, um die zusätzliche Badezimmerheizung für ca. 30 Minuten einzuschalten.',
      hr: 'Kod ulaza u kupaonicu nalazi se prekidač s ikonom grijanja. Pritisnite ga za aktiviranje dodatnog grijanja kupaonice na oko 30 minuta.',
      sr: 'Kod ulaza u kupatilo nalazi se prekidač sa ikonom grejanja. Pritisnite ga za aktiviranje dodatnog grejanja kupatila na oko 30 minuta.',
    },
  },
  {
    title: { en: 'Waste handling', sl: 'Ločevanje odpadkov', de: 'Mülltrennung', hr: 'Razvrstavanje otpada', sr: 'Razvrstavanje otpada' },
    description: {
      en: 'Under the sink you will find separate bins for waste sorting. Outside by the driveway there are collection bins, including a separate glass container.',
      sl: 'Pod kopalničkim umivalnikom najdete ločene koše za odpadke. Zunaj pri dovozu so zbiralni kontejnerji, vključno z ločenim za steklo.',
      de: 'Unter dem Waschbecken finden Sie separate Behälter für die Mülltrennung. Draußen an der Einfahrt stehen Sammelcontainer, darunter ein separater für Glas.',
      hr: 'Ispod sudopera naći ćete odvojene kante za razvrstavanje otpada. Vani kod ulaza nalaze se zbirni kontejneri, uključujući odvojeni za staklo.',
      sr: 'Ispod sudopere naći ćete odvojene kante za razvrstavanje otpada. Napolju kod ulaza nalaze se zbirni kontejneri, uključujući odvojeni za staklo.',
    },
  },
]

export const SEED_HOUSE_RULES: LocalizedText[] = [
  { en: 'No smoking inside the apartment.', sl: 'Kajenje v apartmaju ni dovoljeno.', de: 'Rauchen in der Wohnung ist nicht gestattet.', hr: 'Pušenje u apartmanu nije dozvoljeno.', sr: 'Pušenje u apartmanu nije dozvoljeno.' },
  { en: 'Please separate waste and flush toilet paper only.', sl: 'Prosimo, ločujte odpadke in splakujte samo toaletni papir.', de: 'Bitte Abfall trennen und nur Toilettenpapier spülen.', hr: 'Molimo odvajajte otpad i bacajte samo toaletni papir.', sr: 'Molimo odvajajte otpad i bacajte samo toaletni papir.' },
  { en: 'Please do not feed the horses — unsuitable food can harm them.', sl: 'Prosimo, ne hranite konj — neprimerna hrana jim lahko škodi.', de: 'Bitte füttern Sie die Pferde nicht — ungeeignetes Futter kann ihnen schaden.', hr: 'Molimo ne hranite konje — neprikladna hrana može im nauditi.', sr: 'Molimo ne hranite konje — neprikladna hrana im može naškoditi.' },
  { en: 'Do not lean on or climb the upper-floor fence.', sl: 'Ne naslanjajte se na ograjo zgornjega nadstropja in ne plezajte nanjo.', de: 'Bitte nicht auf den Zaun im Obergeschoss lehnen oder ihn besteigen.', hr: 'Ne naslanjajte se na ogradu gornjeg kata niti se penjite na nju.', sr: 'Ne naslanjajte se na ogradu gornjeg sprata niti se penjite na nju.' },
  { en: 'The horse fence is electrified.', sl: 'Konjska ograja je elektrificirana.', de: 'Der Pferdezaun ist elektrifiziert.', hr: 'Ograda za konje je elektrificirana.', sr: 'Ograda za konje je elektrificirana.' },
  { en: 'Tap water is safe to drink.', sl: 'Voda iz pipe je primerna za pitje.', de: 'Leitungswasser ist trinkbar.', hr: 'Voda iz slavine je sigurna za piće.', sr: 'Voda iz slavine je bezbedna za piće.' },
]
