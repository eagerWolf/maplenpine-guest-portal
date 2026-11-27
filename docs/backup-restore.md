# Varnostne kopije in obnova

Nameščeno 26. novembra 2026 kot uporabnik `deploy`.

- Urnik: `30 1 * * *` v strežniškem UTC, torej 02:30 pozimi / 03:30 poleti v Sloveniji.
- Zagon: `/home/deploy/backup-portals.sh`, neodvisen od izklopljenih aplikacijskih avtomatizacij; `flock` preprečuje sočasne zagone.
- Shramba: `/home/deploy/portal-backups/automatic/{staging,production}/`, zadnjih 30 dokončanih kopij na okolje.
- Vsebina: konsistentna SQLite kopija (tudi WAL), točna `.env` z obstoječimi šifrirnimi ključi, `data/uploads`, `data/contracts`, kontrolne vsote in število zapisov v tabelah.
- Vsak zagon obnovi kopijo v podmapo `restore-check` ter preveri integriteto baze, število zapisov, kontrolne vsote konfiguracije in vseh datotek.
- Dostop do korena kopij je 0700, do kopije baze in konfiguracije 0600. Gesel in vsebin pogodb ne izpisujemo.
- Dnevnik: `/home/deploy/portal-backups/automatic/backup.log`. Napaka vrne neničelno izhodno kodo; samodejno WhatsApp opozarjanje iz tega zunanjega opravila še ni vključeno.

Preizkus 26. novembra 2026: obe kopiji sta bili zagnani z ustrezno obstoječo `.output`, izključno na `127.0.0.1:3099`, in prijava je vrnila HTTP 200. Vse zunanje integracije in ozadna opravila so bila izklopljena. Ločena procesa sta bila po preizkusu ustavljena. Potrdilo je v `application-restore-verified.json` pri vsaki preizkušeni kopiji.

Pri dejanski obnovi najprej ustavimo ustrezen PM2 proces, ohranimo poškodovano stanje za pregled ter obnovimo bazo, datoteke in točno pripadajočo konfiguracijo. `.env` ne generiramo znova, saj bi izgubili možnost dešifriranja nastavitev. Uporabimo združljivo ohranjeno izdajo iz `/home/deploy/releases/`, preverimo portal in šele nato vključimo worker ter integracije. Preverimo tudi čakajoče rezultate workerja, da se fizična opravila ne ponovijo.

Te kopije so na istem VPS-ju. Niso nadomestilo za ločeno, preverjeno zunanjo kopijo oziroma ponudnikove varnostne kopije.

Hetzner Console je bila 26.11.2026 preverjena: ponudnikove samodejne varnostne kopije so vključene (gumb »Disable Backups«), na voljo je šest kopij z dne 20.–25.11.2026; zadnja 25.11. ob 14:57:14 UTC. Obnova celotnega VPS-ja iz Hetzner kopije ni bila izvedena; zgornji dejanski preizkus se nanaša na aplikacijski kopiji.

## Ponovljena obnova 27. 11. 2026

Skripta `scripts/verify-portal-restore.mjs` je na ARM VPS obnovila in zagnala obe aplikaciji iz svežih kopij. Potrjeno: integriteta SQLite, vse kontrolne vsote in števila zapisov, dešifriranje treh testnih nastavitev z ohranjenim ključem, prijava HTTP 200 ter zavrnitev neavtenticiranega watchdog klica HTTP 401. Vse zunanje dostave in watchdog so med preverjanjem izključeni. Produkcijska kopija še nima integracijskih skrivnosti, ker jih lastnik vnese pred preklopom.

```sh
node scripts/verify-portal-restore.mjs --snapshot /private/snapshot --release /compatible/.output --port 3099
```

`scripts/ops/export-private-recovery.sh` po uspešnem dnevnem backupu pripravi zasebni arhiv v `/home/deploy/portal-backups/export`. Vključuje obe kopiji z izvirnima `.env`, datoteke, združljivi ARM izdaji, Caddy in cron. Arhiv vsebuje skrivnosti; ne sme v Git ali javno spletno mapo. `SHA256SUMS` znotraj arhiva omogoča preverjanje vsake datoteke. Za QNAP je pripravljena mapa `ManualBackup/MapleAndPine-Recovery`, z dovoljenji samo lastnika. Dne 27. 11. 2026 je bil arhiv `maplenpine-private-20261127T110343Z.tar.gz` dejansko prenesen na QNAP in ponovno prenesen nazaj; SHA-256 je enak izvirniku na VPS: `e86a7fa1957f42586c09e19837c12bf74953d5f7a705f965746f088ba4cb4c3c`. Avtomatski prenos na QNAP še ni nastavljen.

## Ponovna postavitev po izgubi VPS

1. Obnovi Ubuntu 24.04 ARM64 ali uporabi Hetzner kopijo. Pripravi uporabnika `deploy`, SSH ključ in sudo, Node 22, PM2 ter Caddy. SSH in administratorske poti omeji na VPN javni IP; HTTP/HTTPS ostaneta dostopna gostom. DNS za guest/guesttest usmeri na obnovljeni VPS.
2. Najprej obnovi private recovery arhiv v zasebno začasno mapo in preveri `sha256sum -c SHA256SUMS`. Nobenega programa ali cron opravila še ne zaganjaj.
3. Produkcijski root je `/home/deploy/apps/maplenpine-production` (3001), testni `/opt/maplenpine-staging` (3002). Iz ustreznega snapshot obnovi `portal.db` v `data/portal.db`, `files` v `data/`, izvirni `.env` v root in pripadajočo `.output`. Konfiguracija 0600, data in zasebne kopije 0700. Ključev ne generiraj na novo.
4. V `.env` začasno izključi background tasks, Bentral sync, integration outbox, Bentral guest messages, WhatsApp, watchdog in worker alerts. Sledi dokazni obnovi zgoraj. Namesti natančno izvorno revizijo (`npm ci`; native SQLite se namesti na ARM), če potrebuješ orodja ali novo gradnjo.
5. PM2 zaženi z `PM2_APP_NAME=maplenpine-production PORT=3001 pm2 start ecosystem.config.cjs`, za test z ustreznima imenom in portom. Oba uporabljata fork/1 in 127.0.0.1. Nato `pm2 save`; preko `pm2 startup` registriraj systemd z dejansko potjo Node in uporabnikom deploy. Obnovi Caddy konfiguracijo iz zasebne kopije, validiraj jo pred zagonom.
6. Namesti `scripts/ops/backup-portals.sh` kot `/home/deploy/backup-portals.sh`, obnovi dnevni cron 01:30 UTC in preveri svežo kopijo. Zunanjo kopijo na QNAP potrdi z dejanskim prenosom in kontrolnimi vsotami.
7. Pred vključitvijo integracij uskladi rezervacije, fizične eKey uporabnike ter worker pending/results. Navodila workerja so v njegovem `docs/production-cutover.md`. Najprej nadzorovan primer, nato dostave in avtomatizacije.

Javna stran je ločen repozitorij `maplenpine-v2` in Cloudflare Pages projekt. Za obnovo potrebuje še dostop do Cloudflare računa, DNS in projektnih nastavitev. Git ne hrani računa, zasebnih integracijskih ključev ali VM/eKey baze in licenc. Popolna izguba QNAP zahteva še drugo fizično lokacijo za NAS/VM kopijo.
