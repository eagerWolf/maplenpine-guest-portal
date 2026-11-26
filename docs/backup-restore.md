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
