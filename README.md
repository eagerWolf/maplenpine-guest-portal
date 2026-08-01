# Maple & Pine Guest Portal

## Statična spletna stran maplenpine.com

Portal je vir uredniške vsebine za restavracije, predloge, novice, FAQ, navodila in hišni red. Zaščiten izvoz je na `GET /api/content/export` in zahteva `Authorization: Bearer <token>`.

V adminu odpri **Nastavitve → Splošno → Spletna stran maplenpine.com** ter nastavi:

- javni HTTPS URL portala;
- generiran token za izvoz;
- Cloudflare Pages Deploy Hook;
- po želji nočno objavo (vsak dan ob 01:15 po času strežnika).

Gumb **Shrani in objavi zdaj** sproži Cloudflare build. Poskus se zabeleži v revizijski dnevnik. Portal izvaža samo aktivno in trenutno veljavno vsebino ter vseh pet jezikov (`en`, `sl`, `de`, `hr`, `sr`). Spletna stran trenutno izdela angleške in slovenske poti.
