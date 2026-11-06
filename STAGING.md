# Izolirana testna objava (še ni izvedena)

Koda je pripravljena za lokalno preverjanje. Spodnji koraki se izvedejo šele ob dogovorjeni testni objavi. Dejanski Windows/eKey prevzemni preizkus ostaja ločen korak.

## 1. Ločena namestitev portala

- Uporabi ločeno domeno, npr. `guestportal-staging.<tvoja-domena>`, Linux mapo `/opt/maplenpine-staging` in prazno mapo `data/`. Ne kopiraj produkcijske baze, uploadov ali `.env`.
- Namesti Node po `.nvmrc` (22.19.0) in PM2. Pred namestitvijo zabeleži Git revizijo vseh treh projektov. Vključi tudi pregledane nove datoteke, ki še niso v Gitu.
- Omeji dostop do testne domene (npr. Cloudflare Access). Dostop za testni Orchestrator in izvoz vsebine mora biti izrecno omogočen. Testnih gostovih povezav ne objavljaj javno.
- Kopiraj `.env.staging.example` v `.env`, ustvari dve različni naključni skrivnosti (`openssl rand -hex 32`) in nastavi dejanski staging URL. Vse integracijske ključe pusti prazne; uporabi samo ločene testne račune in testne prejemnike, ko boš preverjal integracije.
- `PORTAL_DISABLE_BACKGROUND_TASKS=true` izključi vsa cron opravila in njihove zagonske klice (tudi sync, outbox in čiščenje). Ročni gumbi še vedno izvajajo dejanja, zato ne vnašaj produkcijskih poverilnic. Tudi dnevni backup je izključen; testne podatke po potrebi kopiraj pri ustavljenem procesu.

Na Linux strežniku v ločeni mapi:

```bash
npm ci
npm run check
node --env-file=.env .output/server/index.mjs
```

Po inicializaciji sheme proces ustavi in ustvari administratorja:

```bash
npm run admin:activate -- tvoj-testni-email@example.com
PM2_APP_NAME=maplenpine-staging PORT=3002 pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

PM2 nalaga `.env` iz mape aplikacije in uporablja časovni pas Europe/Ljubljana. Za prvi ročni zagon lahko uporabiš `PORT=3002 node --env-file=.env .output/server/index.mjs`.

V ločenem Caddy bloku nastavi dejansko testno domeno in `reverse_proxy 127.0.0.1:3002`. Vrata 3002 ne smejo biti javno dostopna. Za lokalni proxy nastavi zaupanja vredne IP-je skladno z README. Testna domena in produkcijska domena potrebujeta vsak svoj blok/proces/mapo.

## 2. Javna stran – Cloudflare Preview

V ločeni Preview veji ali testnem Pages projektu uporabi Node iz `.nvmrc`, ukaz `npm run generate` in izhod `.output/public`. Za prvi predogled pusti `CONTENT_EXPORT_URL` in `CONTENT_EXPORT_TOKEN` prazna (repozitorijski snapshot). Za preizkus povezave uporabi izključno staging portal in njegov nov izvozni token. Deploy Hook naj kaže samo na testni projekt/vejo. Dostop omeji z Access; za Preview dodaj `X-Robots-Tag: noindex, nofollow` in preveri dejanski odziv. Produkcijska canonical/sitemap domena v statični vsebini je pričakovana; testne domene ne oddajaj v Search Console.

Lokalno preverjanje brez produkcijskih klicev:

```bash
CONTENT_EXPORT_URL= CONTENT_EXPORT_TOKEN= npm run check
```

## 3. Orchestrator – za zdaj samo izolirani testi

V `ekey-automation/orchestrator` izvedi `npm ci` in `npm test`. Na Macu je Windows/AHK test preskočen. Ne zaganjaj `node index.js` ali Task Schedulerja proti produkciji.

Poznejši dry-run zahteva ločen testni portal, token in ločeno mapo vseh job/result/pending/state/log/lock datotek. Simulirani PIN-i se shranijo v testni portal; to ni dokaz delovanja eKey. Dejanski ustvarjanje → sprememba → izpad/ponovitev → preklic → preverjanje naprave se izvede z dogovorjeno testno identiteto pod nadzorom na Windowsih, po postopku v eKey README. Do takrat ostane prava avtomatizacija izključena.

## 4. Prevzemni seznam po testni objavi

- Prijava/aktivacija administratorja, vloge, zavrnitev nepooblaščenih API klicev.
- Log potrjuje izključena background opravila; v bazi ni pravih gostov ali produkcijskih skrivnosti.
- Testna rezervacija in gostova povezava: pravi apartma, jezik, mobilni prikaz, vsebine/slike/vreme.
- Izvoz brez tokena zavrnjen, s staging tokenom uspešen; testni Pages build uporabi slike in vsebine.
- Ponovni zagon ohrani podatke; backup in obnova preverjena na kopiji testne baze.
- Po potrebi testni SendGrid/Bentral/SumUp račun: brez pravih obvestil, plačil ali rezervacij. Za background integracijski preizkus šele nato nastavi `PORTAL_DISABLE_BACKGROUND_TASKS=false` in ponovno zaženi proces.
- eKey/Windows fizični preizkus ostaja odprt; rezultatov simulacije ne označi kot fizično preverjenih.

## 5. Prenos že zgrajenega portala (neobvezno)

Priporočen je build na strežniku zgoraj. `scripts/deploy.sh` je alternativa za Linux build iste arhitekture kot strežnik zaradi native SQLite modula. Ne prenašaj Mac builda na Linux. `DEPLOY_SERVER` in `DEPLOY_DIR` sta obvezna; ciljna mapa mora že obstajati in imeti svoj `.env` ter trajno `data/`.

Privzeto skripta izvede samo rsync preview (še vedno potrebuje SSH dostop):

```bash
DEPLOY_SERVER=deploy@staging-host DEPLOY_DIR=/opt/maplenpine-staging bash scripts/deploy.sh --preview
```

`--apply` prenese build in konfiguracijo ter ponovno zažene PM2; uporabi ga šele ob odobreni objavi. Ob `--apply` sta obvezna tudi `DEPLOY_APP_NAME=maplenpine-staging` in `DEPLOY_PORT=3002`; skripta ju izrecno posreduje oddaljenemu PM2. Skripta ne prenaša `.env` ali `data/` in briše stare datoteke samo znotraj ciljne `.output/`. Pred nadgradnjo ustavi proces in varnostno kopiraj `data/`; prenos ni atomski in zahteva vzdrževalno okno.
