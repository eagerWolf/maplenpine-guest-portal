# Obnova gesla

Prijava vsebuje »Pozabil sem geslo«. Zahteva pošlje enkratno povezavo samo na shranjeni e-poštni naslov aktivnega računa; ne razkriva obstoja računa. Dostava uporablja obstoječo konfiguracijo e-pošte (SendGrid) in spoštuje PORTAL_EMAIL_ENABLED. Če je pošiljanje izklopljeno ali ni nastavljeno, obrazec pojasni, da je potrebna pomoč administratorja. Funkcionalnost sama ne vklopi pošiljanja.

Token vsebuje 32 naključnih bajtov; baza hrani samo SHA-256. Povezava velja 30 minut, nova zahteva prekliče prejšnjo. Token je v fragmentu URL in se po odprtju odstrani iz naslovne vrstice. POST ga posreduje za enkratno uporabo; ob uspehu se izbrišejo vsi obnovitveni in aktivacijski tokeni računa. Geslo se ne spremeni ob zahtevi. Geslo mora imeti vsaj 10 znakov in največ 72 UTF-8 bajtov (omejitev bcrypt). Poveča se password_version; stare seje se zavrnejo ob naslednjem API zahtevku. Uporabnik se prijavi na novo.

Za obnovo ob nedostopni e-pošti lahko po potrjeni zahtevi lastnika na ustreznem strežniku kot deploy izvedemo:

    node --env-file=.env scripts/create-password-reset.mjs info@maplenpine.com

Izpisana povezava omogoča spremembo gesla: delimo jo samo lastniku prek zaupanja vrednega kanala. Skripta ne spreminja gesla in ne izpiše obstoječih skrivnosti. Produkcijskega računa ne spreminjamo pri obnovi testnega računa.
