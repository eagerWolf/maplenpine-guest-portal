# Skupna WhatsApp predloga – 26. november 2026

Vsa WhatsApp obvestila in ročni testi uporabljajo izključno nastavitev `twilio_staff_content_sid` za `maplenpine_staff_notice_v2` (Content SID `HXa858f0f648e8f32b0ece06b10b6f490e`). Spremenljivke so 1 = naslov, 2 = podrobnosti, 3 = povezava. Besedila posameznih obvestil ostajajo nastavljiva.

Stari ključi `twilio_content_sid_<event>` se pri pošiljanju ne berejo in jih ni več mogoče urejati. Ob manjkajoči skupni predlogi pošiljanje javi napako; ne uporabi stare predloge ali prostega besedila.

Dvanajst ločenih predlog pri Twiliu ni več potrebnih in jih portal ne uporablja. Operaterska skripta in definicije za njihovo oddajo so odstranjene. Na izrecno zahtevo uporabnika je bilo vseh 12 ločenih predlog odstranjenih s Twilio Content API (`deleteInWaba=true`). Ponovni pregled seznama je potrdil, da je ostala samo `maplenpine_staff_notice_v2`.

Meta je skupno predlogo razvrstila v Marketing; 26. novembra je bila uspešno oddana zahteva za pregled kategorije Utility. Odobritev še ni potrjena. Ta sprememba kode ne vklopi pošiljanja ali produkcijskih avtomatizacij.

Ročni testi se še vedno pošiljajo samo trenutno prijavljenemu administratorju z veljavno WhatsApp številko.

Sprememba `6de0215` je nameščena na testnem portalu po uspešnem ARM buildu. PM2 proces je online in `/login` vrne HTTP 200. Prejšnji build je shranjen za povrnitev. Lokalno: 153 testov in TypeScript uspešno. Produkcijska namestitev in zastavice pošiljanja niso bile spremenjene.

Na nadaljnjo izrecno zahtevo je isti ARM build `6de0215` nameščen tudi na produkciji (PM2 online, `/login` HTTP 200). Skupni SID je nastavljen tudi v produkcijski bazi. Pred namestitvijo so shranjeni prejšnji build, konfiguracija in SQLite kopija v `~/backups/prod-shared-template-6de0215/`. WhatsApp ostaja `false`, opravila v ozadju onemogočena in Bentral sporočila `false`. Neposreden pregled Mete potrjuje samo eno predlogo (1 od 250): staff_notice_v2, Marketing, In review.
