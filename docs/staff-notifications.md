# Obvestila osebju in potrditev čiščenja

## Dogovorjeni prejemniki

- Sprejem: na dan prihoda ob 9:00; pomembna sprememba datumov, apartmaja ali števila gostov; odpoved; potrjeno čiščenje.
- Čistilke: dan pred odhodom ob 10:00, s podatkom o naslednjem prihodu in namensko povezavo.
- Lastnik: tehnična opozorila in odprava napak ter potrjeno čiščenje. Brez rutinskih obvestil o uspešnih PIN-ih ali novih rezervacijah.
- Potrditev čiščenja ne ustvari sporočila gostu in ne spremeni eKey PIN-a.

Urniki uporabljajo Europe/Ljubljana. Preverjajo se vsakih pet minut (po začetni uri), dostava čakalne vrste vsako minuto. Ponoven uvoz ali preverjanje ne ustvari dodatnega istega opomnika. Po zamujenem dnevu se opomnik ne pošilja naknadno.

Prejemnike uredimo v Nastavitvah / Uporabnikih: vsaka oseba svojo WhatsApp številko. Sprejem: vklop »Opomnik za sprejem«; čistilke: »Opomnik za čiščenje«. Lastnik mora biti aktiven administrator z ravnijo »Napake« ali »Vsa obvestila«. Globalna številka sprejema ostaja ena številka, saj jo vidi tudi gost. Podvojene številke se normalizirajo in združijo.

## Potrditev čiščenja

Povezava `/cleaning/<naključni-256-bitni-token>` velja za en apartma, odhajajočo rezervacijo in datum čiščenja. Pri Maple in Pine sta povezavi ločeni. GET samo prikaže stran: pregled povezave v WhatsAppu ne potrdi čiščenja. POST zahteva izrecen gumb. Potrditev je dovoljena na dan odhoda po slovenskem času; po tem dnevu, preklicu ali prestavitvi odhoda povezava ne velja. Stran ne pokaže PIN-a, imen gostov ali kontaktov in ne vključuje analitike.

Potrditev in vpis obvestil se shranita v isti transakciji. Večkratna potrditev ne podvoji obvestil. WhatsApp vsebuje čas potrditve ter apartma; gost ni prejemnik. Dostava se beleži v dnevniku obvestil. »Poslano« pomeni sprejem pri ponudniku, ne potrditve branja na telefonu.

## PIN in early check-in

Nova in ponovno izračunana eKey opravila uporabljajo 13:00 na dan prihoda. Odhodni zamik ostaja nastavljiv. Gostovo sporočilo in zapis kode v Bentralu uporabljata dejansko veljavnost kode. Uradni prihod lahko ostane 15:00; predčasen prihod odobri sprejem po potrditvi čiščenja. Potrditev ne aktivira ali generira PIN-a. Obstoječih kod na napravah ta izdaja ne spreminja brez eKey opravila in preverjene sinhronizacije.

## WhatsApp in aktivacija

Pošiljanje zahteva `PORTAL_WHATSAPP_ENABLED=true`, konfiguriranega ponudnika in veljavne prejemnike. Redni opomniki zahtevajo omogočene background naloge. Test z izklopljenimi background nalogami ne ustvarja rednih opomnikov; izrecno omogočen integration outbox lahko dostavi že pripravljena obvestila. Testna sporočila imajo `[TEST]`.

Za Twilio je potreben WhatsApp-odobren Content SID (`HX…`) v Nastavitve / Integracije / WhatsApp. Predlogo pripravimo z besedilom:

    Maple & Pine — obvestilo: {{1}}
    Podrobnosti: {{2}}
    Povezava: {{3}}

Spremenljivke so naslov, podrobnosti v eni vrstici in povezava. Pri čiščenju je tretja spremenljivka namenska povezava za potrditev. Odobritev predloge ureja ponudnik. Brez predloge se ne poskuša pošiljati prostega besedila izven dovoljenega pogovornega okna. Skupine niso podprte; uporabimo več kontaktov.

Nejasen izid dostave ali prekinitev med pošiljanjem se označi kot neuspeh za ročni pregled. Pred ponovnim pošiljanjem preverimo ponudnikov dnevnik, da se izognemo dvojnikom. Napaka dostave opozori lastnika, če njegov WhatsApp kanal deluje. Popoln izpad WhatsAppa ne more biti sporočen po istem nedelujočem kanalu. Zunanji nadzor celotnega izpada VPS je ločena, še nenastavljena storitev.

Schema migration 2 doda cleaning_tasks, staff_notifications in notification_incidents. Obstoječi podatki ostanejo. Pred namestitvijo naredimo varnostno kopijo baze. Pošiljanje ostane izklopljeno, dokler ne preverimo predloge in prejemnikov.

## Urejanje predlog in ročni preizkusi

V Nastavitve → Integracije → WhatsApp uredimo vseh 12 vrst internih obvestil. Svojo WhatsApp številko v mednarodnem formatu izpolnimo pri svojem računu v nastavitvah osebja. Predloga mora obdržati `{title}`, `{details}` in `{link}`. Besedilo se uporabi za nova obvestila; že pripravljena sporočila v čakalni vrsti se ne prepisujejo. Twilio odobrena zunanja predloga ostaja nespremenjena; urejamo vsebino njenih spremenljivk. Twilio podrobnosti združi v eno vrstico.

Gumb za posamezni test uporabi izmišljene primere, oznako `[TEST]` in izključno WhatsApp številko prijavljenega administratorja. Vhodni zahtevek ne more določiti drugega prejemnika. Test čiščenja vsebuje neveljavno demonstracijsko povezavo; ne ustvari ali potrdi čiščenja. Ne prevzema eKey opravil, ne spreminja rezervacij in ne kliče Bentrala. Dostava je zapisana v dnevnik. Pošiljanje ostaja omejeno z `PORTAL_WHATSAPP_ENABLED`; ne obide izklopljenega kanala. Potrebna sta potrjen pošiljatelj in odobren Content SID. Dostava se ne ponavlja samodejno.

Ročni test se pošlje izključno na veljavno WhatsApp številko trenutno prijavljenega aktivnega administratorja v tabeli uporabnikov. Manjkajoča številka prepreči pošiljanje; skupna testna številka in prejemnik iz zahtevka se ne uporabljata. Redni opomniki še vedno sledijo nastavitvam prejemnikov. Pred vklopom rednega pošiljanja preverimo vse prejemnike posebej.
