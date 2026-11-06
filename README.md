# Maple & Pine Guest Portal

Administracijski in gostinski portal za rezervacije, eKey kode, vsebine, obvestila ter prodajo dodatnih storitev. Portal je tudi vir uredniške vsebine za javno stran `maplenpine.com`.

Celoten postopek prve namestitve portala, javne strani in Windows Orchestratorja je v [INSTALLATION.md](INSTALLATION.md).

Izolirana testna objava in prevzemni seznam: [STAGING.md](STAGING.md).

## Zahteve

- Node.js 22.19 ali novejši LTS
- npm
- trajen disk za mapo `data/`
- HTTPS domena za produkcijo

## Lokalni razvoj

```bash
npm ci
cp .env.example .env
npm run dev
```

Portal je nato dostopen na `http://localhost:3000`. Skrivnosti v `.env` ne dodajaj v Git.

Pred oddajo sprememb vedno poženi:

```bash
npm run check
```

Ukaz izvede avtomatske teste, TypeScript preverjanje in produkcijski build.

## Konfiguracija

### Zaupanja vredni proxyji in prijava

Privzeto se za omejevanje prijav uporablja IP neposredne povezave; posredovane IP-glave se ignorirajo. `TRUSTED_PROXY_IPS` sprejme seznam točnih IP-naslovov proxyjev (brez CIDR), `TRUSTED_PROXY_HEADER` pa natanko `x-forwarded-for` ali `cf-connecting-ip`.

Za lokalni Nginx nastavite `TRUSTED_PROXY_IPS=127.0.0.1,::1` in `TRUSTED_PROXY_HEADER=x-forwarded-for`. Nginx mora prepisati glavo z `proxy_set_header X-Forwarded-For $remote_addr;`. Če je pred njim Cloudflare, najprej pravilno nastavite preverjanje njegovih zaupanja vrednih izvornih naslovov; brez tega ne uporabljajte klientove CF-glave. Pri Cloudflare Tunnel izberite CF-glavo le, če povezava res prihaja iz nadzorovanega lokalnega tunela in Cloudflare prepiše vrednost. Ne dodajajte javnih odjemalcev na seznam zaupanja.

PM2 konfiguracija veže Nitro na `127.0.0.1:3001`. Ob deploymentu preverite z `lsof -nP -iTCP:3001 -sTCP:LISTEN`, da ni poslušanja na `0.0.0.0` ali `::`, ter z zunanje naprave, da vrata 3001 niso dosegljiva. Požarni zid in proxy je treba preveriti v dejanskem okolju; lokalna sprememba konfiguracije ni potrditev deploymenta.

### Varno lokalno preverjanje vseh treh projektov

- Portal: `npm test`, `npm run typecheck`, `npm run build`. Testi uporabljajo SQLite v pomnilniku in nadomestne zunanje integracije. Gradnja ne zažene cron opravil.
- Javna stran: `CONTENT_EXPORT_URL= CONTENT_EXPORT_TOKEN= npm run check` v `maplenpine`; vključuje lokalni HTTP test izvoza, izpada in slikovnega predpomnilnika.
- eKey: `npm test` v `ekey-automation/orchestrator`; brez dostopa do Windows GUI ali produkcijskega portala.
- Ne uporabljajte `npm run dev` s produkcijskimi poverilnicami za izolirane teste: zagon portala aktivira strežniške vtičnike in cron.

Portal je lastnik rezervacij, vsebin, čakalnih vrst in obvestil; javna stran vsebino samo uvozi ob gradnji; Windows worker izvaja izključno naročene eKey operacije. Ob odpovedi se gostovi tokeni odstranijo, čakajoča obvestila se ne pošljejo, pozni uspešni rezultat ustvarjanja dostopa pa povzroči nalogo za izbris, ne objave PIN-a. Fizični izbris je asinhron: do uspešne izvedbe in sinhronizacije naprave lahko koda še obstaja. V nujnem primeru je potreben nadzorovan ročni preklic.

Za začetek kopiraj `.env.example` v `.env`. Najpomembnejše skupine nastavitev so:

- `NUXT_SESSION_PASSWORD`: naključna skrivnost dolžine vsaj 32 znakov;
- `NUXT_SETTINGS_ENCRYPTION_KEY`: ločena naključna skrivnost dolžine vsaj 32 znakov, s katero se občutljive nastavitve šifrirajo v bazi;
- Google OAuth client ID in secret ter produkcijski redirect URL;
- Bentral API ključ, property ID in ID enot Maple/Pine;
- SendGrid ključ ter naslovi pošiljateljev/prejemnikov;
- Twilio ali webhook nastavitve za WhatsApp;
- `NUXT_PUBLIC_BASE_URL=https://guestportal.maplenpine.com`;
- po želji GA4 in prilagojeni cron intervali.

Token Orchestratorja in token izvoza spletne strani se nastavljata v adminu portala, ne v `.env`. Orchestrator mora uporabljati isti Bearer token, ki je prikazan v **Nastavitve → Platforma → Orchestrator**.

`NUXT_SETTINGS_ENCRYPTION_KEY` varno shrani tudi zunaj strežnika. Menjava ali izguba tega ključa brez predhodne rotacije onemogoči branje šifriranih API ključev iz baze.

## Podatki in varnostne kopije

SQLite baza je v `data/portal.db`, uploadi pa so prav tako vezani na lokalno trajno shrambo. Mape `data/` med deploymentom ne briši ali prepisuj. Portal dnevno izdeluje kopije baze v `data/backups` in ohrani zadnjih 14 kopij, vendar je priporočljiva še zunanja kopija celotne mape `data/`.

Pred večjo nadgradnjo naredi ročno kopijo baze. Ker SQLite uporablja tudi WAL datoteki, je najvarneje ustaviti proces in nato kopirati celotno mapo `data/`.

## Produkcijski deployment

Portal ni primeren za Cloudflare Pages ali drugo izključno statično gostovanje. Potrebuje stalno delujoč Node proces, trajen zapisljiv disk in en sam proces zaradi SQLite baze ter cron opravil.

Primer deploymenta na Linux VPS z PM2:

```bash
git pull --ff-only
npm ci
npm run check
npm run build
npx pm2 startOrReload ecosystem.config.cjs
npx pm2 save
```

`ecosystem.config.cjs` zažene `.output/server/index.mjs` na vratih `3001`. Pred proces postavi Caddy, Nginx ali Cloudflare Tunnel, ki zagotovi HTTPS in posreduje zahteve na `127.0.0.1:3001`.

Na strežniku morajo ostati:

- produkcijski `.env`;
- trajna mapa `data/` z dovoljenjem pisanja za uporabnika procesa;
- Node.js 22.19 ali novejši in PM2;
- samo ena instanca aplikacije (`instances: 1`).

Po prvem deploymentu omogoči samodejni zagon PM2:

```bash
npx pm2 startup
npx pm2 save
```

Izvedi ukaz, ki ga izpiše `pm2 startup`. Dejanskega `.env` nikoli ne kopiraj v javne artefakte ali repozitorij.

### Preverjanje po deploymentu

1. Odpri prijavo in preveri admin nadzorno ploščo.
2. Preveri zapisovanje v `data/` ter zadnjo varnostno kopijo.
3. V adminu ročno sproži Bentral sinhronizacijo.
4. Preveri stanje Orchestratorja in integracijskega outboxa.
5. Pokliči zaščiteni `/api/content/export` s pravilnim tokenom.
6. Preveri PM2 loge: `npx pm2 logs maplenpine-portal --lines 100`.

### Povrnitev prejšnje različice

Ustavi proces, obnovi prejšnjo Git različico in po potrebi pripadajočo kopijo celotne mape `data/`, nato ponovno izvedi `npm ci`, `npm run build` in `pm2 startOrReload`. Baze iz novejše različice ne vračaj delno ali med delovanjem procesa.

## Izvoz vsebine za maplenpine.com

Zaščiten izvoz je na `GET /api/content/export` in zahteva `Authorization: Bearer <token>`.

V adminu odpri **Nastavitve → Splošno → Spletna stran maplenpine.com** ter nastavi:

- javni HTTPS URL portala;
- generiran token za izvoz;
- Cloudflare Pages Deploy Hook;
- po želji nočno objavo.

Gumb **Shrani in objavi zdaj** sproži Cloudflare build. Portal izvaža samo aktivno in trenutno veljavno vsebino v jezikih `en`, `sl`, `de`, `hr` in `sr`; javna stran trenutno izdela angleške in slovenske poti.
