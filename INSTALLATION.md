# Namestitev celotnega sistema Maple & Pine

Ta vodič opisuje postavitev vseh treh delov:

1. **Guest Portal** – osrednja baza, administracija, Bentral, plačila in vsebine;
2. **maplenpine.com** – statično generirana javna stran na Cloudflare Pages;
3. **eKey Orchestrator** – Windows proces, ki prek AutoHotkey upravlja ekey net admin.

Priporočen vrstni red je portal → javna stran → Orchestrator. Ukaze izvajaj v posameznem repozitoriju.

Za izolirano testno objavo najprej sledi [STAGING.md](STAGING.md).

## 1. Predpogoji

Pripravi:

- Linux strežnik z zapisljivim trajnim diskom za Guest Portal;
- Node.js **22.19 ali novejši** in npm;
- domeno, na primer `guestportal.maplenpine.com`, usmerjeno na portal;
- Cloudflare Pages projekt za `maplenpine.com`;
- Windows VM na QNAP-u z ekey net admin, AutoHotkey v2 in Node.js;
- Bentral API ključ ter ID-je objekta in enot Maple/Pine;
- Twilio WhatsApp podatke za obvestila osebju; SendGrid in SumUp za trenutno obliko portala nista potrebna.

Za skrivnosti lahko na Linuxu ustvariš naključne vrednosti:

```bash
openssl rand -hex 32
```

Za `NUXT_SESSION_PASSWORD`, `NUXT_SETTINGS_ENCRYPTION_KEY`, Orchestrator token in token izvoza uporabi štiri različne vrednosti. Shrani jih v upravljalnik gesel. `.env` datotek nikoli ne dodajaj v Git.

## 2. Namestitev Guest Portala

### 2.1 Prenos in konfiguracija

```bash
git clone <URL-repozitorija-portala> /opt/maplenpine-guest-portal
cd /opt/maplenpine-guest-portal
npm ci
cp .env.example .env
mkdir -p data
```

V `.env` obvezno nastavi vsaj:

```env
NUXT_SESSION_PASSWORD=<naključna-vrednost-vsaj-32-znakov>
NUXT_SETTINGS_ENCRYPTION_KEY=<druga-naključna-vrednost-vsaj-32-znakov>
NUXT_PUBLIC_BASE_URL=https://guestportal.maplenpine.com

BENTRAL_API_KEY=<bentral-api-kljuc>
BENTRAL_PROPERTY_ID=<id-objekta>
BENTRAL_UNIT_ID_MAPLE=<id-enote-maple>
BENTRAL_UNIT_ID_PINE=<id-enote-pine>
```

Ostale integracije lahko najprej pustiš prazne in jih pozneje vneseš v adminu. Šifrirnega ključa po začetku uporabe ne spreminjaj: z njim so šifrirane skrivnosti v SQLite bazi.

Preveri projekt in izdelaj produkcijski build:

```bash
npm run check
npm run build
```

### 2.2 Prvi zagon in prvi administrator

Portal najprej enkrat zaženi, da ustvari shemo baze:

```bash
node --env-file=.env .output/server/index.mjs
```

Ko v izpisu vidiš `[db] Schema ready`, proces ustavi s `Ctrl+C`. Nato ustvari enkratno aktivacijsko povezavo prvega administratorja:

```bash
npm run admin:activate -- tvoj@email.si
```

Odpri izpisano povezavo in v 24 urah nastavi geslo. Poznejše uporabnike dodajaš v adminu pod **Nastavitve → Osebje**; dobili bodo svojo aktivacijsko povezavo.

### 2.3 Stalni zagon s PM2

```bash
npm install -g pm2
pm2 startOrReload ecosystem.config.cjs
pm2 save
pm2 startup
```

Izvedi še ukaz, ki ga izpiše `pm2 startup`. Portal mora teči kot **ena sama instanca**, ker uporablja SQLite in lastna cron opravila.

Preveri:

```bash
pm2 status
pm2 logs maplenpine-portal --lines 100
curl http://127.0.0.1:3001/login
```

### 2.4 HTTPS proxy

Pred portal postavi Caddy, Nginx ali Cloudflare Tunnel. Primer Caddy konfiguracije:

```caddyfile
guestportal.maplenpine.com {
    reverse_proxy 127.0.0.1:3001
}
```

Portal mora biti od zunaj dostopen prek HTTPS. Vrata `3001` naj ne bodo neposredno javno odprta.

### 2.5 Začetna konfiguracija v adminu

Po prijavi nastavi v tem vrstnem redu:

1. **Nastavitve → Splošno/Bentral** – API ključ, objekt, enote in časi dostopa;
2. ročno sproži sinhronizacijo in preveri rezervacije v koledarju;
3. **Nastavitve → WhatsApp** – Twilio ter prejemniki obvestil za osebje/administratorje; SendGrid je izključen;
4. **Nastavitve → Zajtrk / Najem koles** – preveri zunanja priporočila, opise in povezave; naročanje in plačila ne potekajo v portalu;
5. **Nastavitve → Platforma → Orchestrator** – generiraj oziroma vnesi Bearer token;
6. **Nastavitve → Spletna stran maplenpine.com** – generiraj token izvoza;
7. dodaj lokacije, restavracije, predloge, novice in drugo uredniško vsebino.

### 2.6 Zunanji webhooki

Če Bentral omogoči webhook, kot cilj uporabi:

```text
POST https://guestportal.maplenpine.com/api/webhook/bentral
```

Bentral webhook nima podpisa. Portal zato njegovim podatkom ne zaupa neposredno, ampak rezervacijo ponovno pridobi prek avtenticiranega Bentral API-ja. Omejitev samo na glavo `Origin` ali domeno ni varnostni mehanizem.

Za SumUp nastavi:

```text
POST https://guestportal.maplenpine.com/api/webhook/sumup
```

V adminu mora biti nastavljen tudi SumUp webhook secret; brez pravilnega podpisa portal webhook zavrne.

## 3. Namestitev javne strani maplenpine.com

### 3.1 Lokalni preizkus

```bash
git clone <URL-repozitorija-spletne-strani> maplenpine
cd maplenpine
npm ci
cp .env.example .env
```

V `.env` nastavi isti izvozni token, ki si ga ustvaril v portalu:

```env
CONTENT_EXPORT_URL=https://guestportal.maplenpine.com/api/content/export
CONTENT_EXPORT_TOKEN=<token-iz-portala>
```

Nato preveri celoten statični build in SEO:

```bash
npm run check
```

Končni statični izhod je v `.output/public`.

### 3.2 Cloudflare Pages

V Cloudflare Pages poveži repozitorij in nastavi:

| Nastavitev | Vrednost |
|---|---|
| Production branch | produkcijska veja repozitorija |
| Build command | `npm run generate` |
| Build output directory | `.output/public` |
| Node.js | `22.19` ali novejši |
| `CONTENT_EXPORT_URL` | `https://guestportal.maplenpine.com/api/content/export` |
| `CONTENT_EXPORT_TOKEN` | isti token kot v portalu |

Dodaj domeno `maplenpine.com`, HTTPS in preusmeritev `www` na kanonično domeno. Nato v Cloudflare ustvari **Deploy Hook** in njegov URL shrani v adminu portala. Gumb **Objavi zdaj** mora sprožiti nov Pages build.

Po objavi preveri `/en`, `/sl`, `sitemap.xml`, canonical/hreflang oznake, slike in preusmeritve. Sitemap oddaj tudi v Google Search Console.

## 4. Namestitev eKey Orchestratorja na Windows VM

### 4.1 Programi in datoteke

Na Windows namesti:

- ekey net admin in preveri ročno prijavo;
- AutoHotkey v2;
- Node.js LTS;
- kodo v stalno mapo `C:\ekey-automation`.

V Command Promptu:

```cmd
cd C:\ekey-automation\orchestrator
npm ci
copy .env.example .env
npm test
```

### 4.2 Konfiguracija

V `C:\ekey-automation\orchestrator\.env` nastavi:

```env
PORTAL_BASE_URL=https://guestportal-staging.example.com
PORTAL_API_KEY=<isti-token-kot-v-adminu-Orchestratorja>

AHK_EXE=C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe
AHK_SCRIPT=C:\ekey-automation\insert-ekey-job.ahk
AHK_JOB_FILE=C:\ekey-automation\job.json
AHK_RESULT_FILE=C:\ekey-automation\result.json
PENDING_RESULTS_FILE=C:\ekey-automation\pending-results.json
PENDING_JOBS_FILE=C:\ekey-automation\pending-jobs.json
STATE_FILE=C:\ekey-automation\state.json
EVENT_LOG_FILE=C:\ekey-automation\events.jsonl
LOCK_FILE=C:\ekey-automation\orchestrator.lock
MAX_EVENT_LOG_BYTES=5000000

EKEY_PASSWORD=<geslo-za-ekey-net-admin>
POLL_INTERVAL_MINUTES=5
PORTAL_TIMEOUT_MS=30000
AHK_RETRIES=3
RETRY_DELAY_MS=10000
DRY_RUN=true
```

`PORTAL_API_KEY` in token v portalu morata biti popolnoma enaka. `EKEY_PASSWORD` ostane samo na Windows VM in se ne vnaša v portal.

### 4.3 Prvi test

Ta korak izvedi samo proti **ločenemu testnemu portalu**, z njegovo prazno bazo, testnim tokenom in testnimi rezervacijami. Ne uporabi produkcijskega URL-ja ali pending datotek. `DRY_RUN=true` še vedno prevzema naloge in portalu vrača simulirane PIN-e.

Najprej pusti `DRY_RUN=true`:

```cmd
cd C:\ekey-automation\orchestrator
node index.js
```

Preveri:

- da portal na strani Orchestrator kaže zadnjo povezavo;
- `state.json` in zadnje vrstice `events.jsonl`;
- da testna naloga preide iz `pending` v `in_progress` in se rezultat vrne;
- da ni nastal dvojni rezultat ali izgubljena pending datoteka.

Proces nato ustavi, v `.env` nastavi `DRY_RUN=false` in z eno testno rezervacijo preveri dejanski eKey vnos.

### 4.4 Task Scheduler

Ker AHK potrebuje interaktivno namizje, Orchestratorja ne nameščaj kot Windows Service. V Task Schedulerju ustvari opravilo:

- Trigger: **At log on** namenskega uporabnika;
- **Run only when user is logged on**;
- **Run with highest privileges**;
- Program: polna pot do `node.exe`;
- Arguments: `C:\ekey-automation\orchestrator\index.js`;
- Start in: `C:\ekey-automation\orchestrator`;
- ob napaki ponovi po eni minuti, najmanj trikrat;
- če že teče, ne zaženi nove instance.

Windows uporabnik mora ostati prijavljen, seja odklenjena, spanje in hibernacija izklopljena, ločljivost ter DPI pa nespremenjena. QNAP naj VM samodejno zažene po rebootu.

## 5. Končni preizkus celote

Uporabi testno rezervacijo in preveri naslednji tok:

1. rezervacija se po Bentral sinhronizaciji pokaže v koledarju;
2. portal ustvari Orchestrator nalogo;
3. Windows VM jo prevzame in eKey ustvari uporabnika `MPAUTO:...`;
4. rezultat s štirimestnim PIN-om se vrne portalu;
5. portal zapiše kodo v Bentral in pošlje obvestilo gostu;
6. gostova povezava odpre pravilen apartma in vsebine;
7. priporočili odpreta zunanji strani Bled Breakfast in A&B Bike; portal ne zahteva plačila;
8. objava vsebine sproži Cloudflare Pages in osveži javno stran.

## 6. Varnostne kopije in posodobitve

Pred posodobitvijo portala ustavi PM2 in kopiraj celotno mapo `data/`, ne samo `portal.db`, saj SQLite lahko uporablja tudi WAL datoteke. Ohrani `.env` in predvsem `NUXT_SETTINGS_ENCRYPTION_KEY`.

Posodobitev portala:

```bash
pm2 stop maplenpine-portal
git pull --ff-only
npm ci
npm run check
npm run build
pm2 startOrReload ecosystem.config.cjs
pm2 save
```

Pri posodobitvi Orchestratorja ohrani `.env`, `pending-jobs.json`, `pending-results.json`, `state.json` in `events.jsonl`. Pending datotek ne prepisuj s starejšo kopijo, ker bi lahko ponovno izvedel že zaključeno opravilo.

## 7. Hitra diagnostika

- Portal ne deluje: `pm2 logs maplenpine-portal --lines 100`.
- Admin ne more shraniti skrivnosti: preveri `NUXT_SETTINGS_ENCRYPTION_KEY`.
- Orchestrator dobi 401: tokena v portalu in Windows `.env` nista enaka.
- Orchestrator je offline: preveri HTTPS dostop, `state.json`, `events.jsonl` in odklenjeno Windows sejo.
- Javna stran ne dobi vsebine: preveri `CONTENT_EXPORT_URL`, token in Cloudflare build log.
- SumUp webhook dobi 401: manjka ali se ne ujema webhook secret/podpis.
- Bentral webhook odpove: preveri Bentral API ključ, saj portal vsako rezervacijo ponovno preveri prek API-ja.

### Neposredno pošiljanje Bentral sporočil iz Windows workerja

Za Windows pošiljatelja nastavi v portalu `BENTRAL_MESSAGE_SENDER=windows` in `BENTRAL_GUEST_MESSAGES_ENABLED=true`. V Windows `.env` nastavi `BENTRAL_MESSAGES_ENABLED=true`, lokalni `BENTRAL_API_KEY` ter ločeno datoteko `BENTRAL_MESSAGE_STATE_FILE`. Portal še vedno pripravi vsebino in preveri aktivnost rezervacije, PIN, veljavnost povezave ter predhodno objavo PIN-a v Bentral. Windows prevzame največ eno sporočilo, neposredno pokliče Bentral in potrdi rezultat portalu. Sočasno strežniško pošiljanje istih sporočil je izključeno.

Pošiljanje brez potrjenega odgovora (timeout/5xx ali ponovni zagon med POST) se ne ponavlja samodejno. Pred ročnim ponovnim poskusom preveri pogovor v Bentralu. Če Windows prejme uspeh, vendar portal ni dosegljiv, ponovi samo potrditev rezultata. Pri preizkusu uporabi novo aktivno testno rezervacijo z lastnim e-poštnim naslovom; podatki preklicane rezervacije niso primerni za pošiljanje PIN-a.
