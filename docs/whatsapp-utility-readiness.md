# WhatsApp predloge – 26. november 2026

Splošna predloga `maplenpine_staff_notice_v2` je še v pregledu in razvrščena kot Marketing. Za operativna obvestila je bilo oddanih 12 ločenih predlog Utility, vsaka s stalnim opisom namena (prihod, sprememba, odpoved, čiščenje ali konkretna tehnična napaka).

Definicije in izmišljeni vzorci: `scripts/whatsapp-utility-templates.json`.

Operaterska skripta `register-whatsapp-utility-templates.mjs` iz imenika portala:

- Brez argumentov: samo izpis priprave, brez uporabe poverilnic.
- `node --env-file=.env scripts/register-whatsapp-utility-templates.mjs --status`: bralni pregled.
- `--submit`: ustvari manjkajoče predloge in jih odda v odobritev. Obstoječih predlog z drugačnim besedilom ne prepisuje.

Skript uporablja obstoječe poverilnice na VPS-ju, izključno za uradni Twilio Content API. Poverilnic, zasebnih podatkov gostov in PIN-ov ne izpisuje. Skript ne pošilja WhatsApp sporočil in ne spreminja produkcijskih nastavitev. Rezultat shrani v zaščiteno datoteko `data/whatsapp-utility-template-registry.json`.

Po oddaji je bil enkrat preverjen status vseh 12 predlog: `pending`, kategorija `UTILITY`. To še ni odobritev. Meta lahko kategorijo naknadno spremeni.

Portal podpira `twilio_content_sid_<event>` za vsako vrsto obvestila. Če ločen SID ni nastavljen, se ohrani skupna predloga. Ročni preizkus ostaja omejen na trenutno prijavljenega administratorja z veljavno številko. Pred dejanskimi preizkusi se nastavi odobrene SID-je in omogoči pošiljanje samo na testnem portalu; produkcija ostane izklopljena.

Viri: https://www.twilio.com/docs/content/content-api-resources in https://www.twilio.com/docs/whatsapp/tutorial/message-template-approvals-statuses
