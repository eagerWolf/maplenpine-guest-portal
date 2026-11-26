# Pregled vsebin – 26. november 2026

Obseg: 19 predlogov, 10 restavracij, 13 FAQ, 13 navodil in 6 pravil. Novic v pregledani testni bazi ni. Pregled je namenjen testnemu okolju; produkcijske vsebine se ne spreminjajo samodejno.

## Spremembe

- Naravni naslovi in opisi v slovenščini, angleščini, nemščini, hrvaščini in srbščini; slike in vrstni red ostanejo ohranjeni.
- Google Maps povezave so lokacijska iskanja z imenom in preverjenim naslovom, brez prednastavljene poti. Koordinate oziroma Google Place ID niso izmišljeni.
- Popravljene zamaknjene URL oznake vseh 19 predlogov. Staro dodeljevanje po `sort_order` je odstranjeno. Napačno dodeljeni video Life Adventure pri pletni je odstranjen.
- Julijana: skrita zaradi prenove hotela (uradna stran predvideva ponovno odprtje jeseni 2027).
- Central Bled: skrit do potrditve obratovanja; stara domena ne deluje. Podatki iz starega jedilnika niso dokaz sedanjega obratovanja.
- Zajtrk vodi neposredno na Bled Breakfast; kolesa in e-kolesa na A&B Bike, z vprašanjem za dostavo do apartmaja.
- Navodila za apartma ohranjajo gostiteljeve podatke. Opreme, postopkov in odpiralnih časov ne ugibamo.

## Sezonskost

Datumi so ponavljajoča se obdobja prikaza priporočil. Niso obljuba odprtosti. Celoletni zapisi imajo 01-01–12-31. Smučanje in sankanje imata zimsko uredniško obdobje; nezahtevni pohodi priporočeno kopno obdobje; visokogorske ture poletno obdobje. Točni termini so odvisni od vremena, snega in ponudnika. Vintgar in drugi sezonski zapisi vključujejo povezavo za aktualno odprtost; datum odprtja za prihodnje leto ni izmišljen.

## Preverjene povezave

Samodejno preverjenih 42 zunanjih spletnih povezav: 40 uspešnih; SŽ in SPAR zavrneta avtomatski HTTP odjemalec s 403, njuni uradni strani sta posebej preverjeni z bralnikom spletnih strani. Zemljevidi so preverjeni kot lokacijske povezave, ne kot navigacijske poti. Interni PDF pečice se preveri na portalu.

## Varna uporaba

`node scripts/apply-content-review.mjs` iz imenika portala opravi suhi pregled. `--apply` najprej izdela SQLite varnostno kopijo v `data/content-review-backups/`, nato spremembe uporabi v transakciji. Če se je spremenilo pregledano polje ali ročno dodeljena lokacija, se postopek ustavi. Nespremenjena polja, rezervacije, PIN-i, prejemniki in nastavitve integracij niso vključeni. Ponovni zagon je idempotenten.

## Viri po zapisih

- **suggestions 1: S pletno na Blejski otok**
  - https://www.bled.si/en/what-to-see-do/attractions/38/1/
- **suggestions 2: Vožnja s kočijo po Bledu**
  - https://www.bled.si/en/information/business-pages/news/2024080508560599/visit-and-explore-bled-under-the-sign-of-sustainable-mobility/
- **suggestions 3: Ojstrica: razgled na Blejsko jezero**
  - https://www.bled.si/sl/kaj-videti-poceti/znamenitosti/4/ojstrica/
- **suggestions 4: Smučanje v okolici Bleda**
  - https://www.bled.si/sl/kaj-videti-poceti/aktivnosti/30/alpsko-smucanje-in-deskanje/
- **suggestions 5: Sankanje na urejenih sankališčih**
  - https://www.zatrnik.com/
- **suggestions 6: Odkrijte sotesko Vintgar: Naravni čudež blizu Bleda**
  - https://www.vintgar.si/en/my-visit/opening-hours/
  - https://www.bled.si/en/what-to-see-do/attractions/6/1/
- **suggestions 7: Sprehod skozi Pokljuško sotesko**
  - https://www.tnp.si/en/visiting-park/activities/hiking/pokljuka-gorge/
- **suggestions 8: Izlet v dolino Radovne**
  - https://www.tnp.si/en/
- **suggestions 9: Izlet v dolino Soče**
  - https://www.soca-valley.com/en/
- **suggestions 10: Naravni rezervat Zelenci**
  - https://kranjska-gora.si/znamenitosti/naravni-rezervat-zelenci
- **suggestions 11: Izlet do Bohinjskega jezera**
  - https://www.bohinj.si/en/
- **suggestions 12: Radovljica, Begunje in Kropa**
  - https://www.radolca.si/en
- **suggestions 13: Postojnska jama in Predjamski grad**
  - https://www.postojnska-jama.eu/en/
- **suggestions 14: Blejske konjeniške pustolovščine: Jahanje v naravi**
  - https://www.bled.si/en/what-to-see-do/activities/8/1/
- **suggestions 15: Izlet v Ljubljano**
  - https://www.visitljubljana.com/en/visitors/
- **suggestions 16: Obisk Velike planine**
  - https://www.velikaplanina.si/en/
- **suggestions 17: Spust po jeklenicah Zipline Dolinka**
  - https://zipline-dolinka.si/sl/pogosta-vprasanja/
- **suggestions 18: Enodnevni izlet v Piran in Portorož**
  - https://www.portoroz.si/en
- **suggestions 19: Pohodništvo v Julijskih Alpah**
  - https://www.tnp.si/en/visiting-park/activities/hiking/
- **restaurants 1: Restavracija 1**
  - https://www.oldcellarbled.com/en/
- **restaurants 2: Restavracija 2**
  - https://www.pri-planincu.com/
- **restaurants 3: Restavracija 3**
  - https://blejskahisa.si/
  - https://blejskahisa.si/rezervacije-degustacije/
- **restaurants 4: Restavracija 4**
  - https://al-fresco.si/en/
  - https://al-fresco.si/en/about-us/
- **restaurants 5: Restavracija 5**
  - https://www.sava-hotels-resorts.com/en/sava-hotels-bled/services-and-experiences/gastronomy/restaurant-julijana/
- **restaurants 6: Restavracija 6**
  - https://www.restavracija-sova.com/en/contact/
- **restaurants 7: Restavracija 7**
  - https://restavracija-spica.si/
- **restaurants 8: Restavracija 8**
  - https://centralburgerhouse.si/wp-content/uploads/2024/05/Central-Burger-House-Meni.pdf
- **restaurants 9: Restavracija 9**
  - https://www.grajska-plaza.com/
  - https://www.bled.si/sl/kaj-videti-poceti/kulinarika/gostinski-obrati/2026041609031960/restavracija-grajska-plaza/
- **restaurants 10: Restavracija 10**
  - https://www.mega-burger.si/
- **faq_items 1: Zajtrk pri Bled Breakfast**
  - https://www.bledbreakfast.com/
- **faq_items 2: Trgovine z živili**
  - https://www.mercator.si/prodajna-mesta/
  - https://www.spar.si/trgovine
- **faq_items 4: Peš do Blejskega gradu**
  - https://www.blejski-grad.si/en/
- **faq_items 5: Aktivnosti na prostem**
  - https://outdoor.capital/maple-pine-bled/
- **faq_items 6: Pekarne v okolici**
  - https://www.pekarna-planika.si/nase-pekarne
  - https://www.blejskisir.si/sl/okusite-blejski-sir
- **faq_items 7: Turistični vlakec okoli jezera**
  - https://www.bled.si/en/information/getting-around-bled/20190920131939/tourist-train/
- **faq_items 8: Avtobusne povezave**
  - https://www.ap-ljubljana.si/
- **faq_items 9: Železniške povezave**
  - https://potniski.sz.si/
- **faq_items 10: Taksi in transferji**
  - https://bledtransfers.si/
- **faq_items 11: Najem koles**
  - https://www.ab-bike.si/en
- **faq_items 12: Najem e-koles**
  - https://www.ab-bike.si/en
- **faq_items 13: Kako po Bledu**
  - https://www.bled.si/en/information/getting-around-bled/
