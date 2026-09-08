# Daniel Klotzek — Versicherungsmakler & Finanzberater

Statische High-End-Website für die unabhängige Versicherungs- und
Finanzberatung in Wiesloch, Dielheim, Nußloch, Leimen und Heidelberg.
Kein Build, kein Framework, keine Cookies.

## Aufbau

```
index.html                 Startseite (DE/RU): Hero, Versicherer-Karussell, Leistungen, Kennzahlen,
                           Über mich, Grundsätze, Ablauf, Region, Terminbuchung, Kontakt
visitenkarte.html          QR-Code-Generator + druckfertige Visitenkarten-Vorlage (85 × 55 mm)
impressum.html             Impressum, Erstinformation § 15 VersVermV, Schlichtungsstellen
datenschutz.html           Datenschutzerklärung (Hosting, Google Kalender/Meet, Formular)

assets/js/config.js        ► Alle persönlichen Angaben: Kontakt, Buchungslink, Registernummer
assets/js/main.js          Kopfzeile, Menü, Einblenden, Zähler, Karussell, Tabs, Buchung, Formular
assets/js/i18n.js          Sprachumschalter DE/RU mit dem russischen Wörterbuch
assets/js/vendor/          QR-Code-Bibliothek (node-qrcode, MIT), für den Browser gebündelt
assets/css/style.css       Gestaltung; alle Farben und Schriften als Variablen in :root
assets/fonts/              Fraunces, Manrope, Playfair Display (kyrillisch) — SIL OFL, selbst gehostet
assets/logos/*.svg         Wortmarken der Versicherer fürs Karussell (siehe unten)
assets/img/                Porträtfotos hier ablegen (siehe assets/img/README.md)
assets/qr/                 Vorab erzeugter QR-Code (SVG, PNG) für die Visitenkarte

tools/make_qr.py           QR-Code neu erzeugen, z. B. nach Domainwechsel
tools/make_logos.py        Logo-Wortmarken neu erzeugen
.github/workflows/pages.yml  Veröffentlichung über GitHub Pages
```

Lokal testen:

```bash
python3 -m http.server 8000     # dann http://localhost:8000 öffnen
```

## Vor dem Livegang — Checkliste

Alles Persönliche steht in **`assets/js/config.js`**. Dort ausfüllen:

1. **Kontaktdaten** — Telefon, E-Mail, Adresse, Erreichbarkeit.
2. **Google-Meet-Buchung** — `booking.url` (Anleitung unten).
3. **Pflichtangaben** — Vermittlerregister-Nummer (`D-…`), IHK, ggf. USt-IdNr.
   Liegt eine Erlaubnis nach § 34f GewO (Finanzanlagen) vor, `hasFinanzanlagen34f: true` setzen.
4. **`siteUrl`** — die endgültige Domain; danach `python3 tools/make_qr.py` ausführen.
5. **Porträtfotos** nach `assets/img/` legen (Dateinamen siehe dort).
6. Impressum und Datenschutz einmal gegenlesen — die Texte sind sorgfältig
   vorbereitet, ersetzen aber keine Prüfung durch die IHK oder einen Anwalt.

## Google-Meet-Terminbuchung einrichten

Die Seite bettet den **Terminplan von Google Kalender** ein. Jede Buchung erzeugt
automatisch einen Google-Meet-Link und verschickt Bestätigung und Erinnerung.

1. [calendar.google.com](https://calendar.google.com) öffnen → **Erstellen → Terminplan**.
2. Titel „Erstgespräch“, Dauer 30 Minuten, verfügbare Zeiten eintragen,
   unter *Buchungsformular* Name, E-Mail und optional Telefon abfragen.
3. Unter **Videokonferenz** „Google Meet“ auswählen (bei Google-Workspace-Konten
   meist Standard; bei privaten Konten aktivieren).
4. Speichern → **Freigeben** → Link kopieren. Er sieht so aus:
   `https://calendar.google.com/calendar/appointments/schedules/AcZssZ…?gv=true`
5. Diesen Link in `assets/js/config.js` bei `booking.url` eintragen.

Der Kalender wird aus Datenschutzgründen erst nach einem Klick des Besuchers
geladen (Zwei-Klick-Lösung); die Datenschutzerklärung beschreibt das bereits.

## Zweisprachigkeit (Deutsch / Russisch)

Der Umschalter DE/RU sitzt in der Kopfzeile. Das HTML bleibt einsprachig
deutsch; `assets/js/i18n.js` enthält ein Wörterbuch *deutscher Text → russischer
Text* und ersetzt beim Umschalten alle Textknoten und Attribute. Die Wahl wird im
Browser gemerkt, `index.html?lang=ru` öffnet die Seite direkt auf Russisch.

Neuen Text ergänzen: deutschen Wortlaut in `index.html` schreiben, dann in
`i18n.js` denselben Wortlaut als Schlüssel mit russischer Fassung eintragen.
Fehlt ein Eintrag, bleibt der Text deutsch. Impressum und Datenschutzerklärung
bleiben bewusst deutsch (Pflichtangaben).

## Versicherer-Karussell

Die Logos liegen als `assets/logos/<name>.svg` (240 × 80 px) und werden in
`index.html` über `data-logos="allianz,axa,…"` in zwei gegenläufige Reihen
geladen. Reihenfolge ändern oder Gesellschaften ergänzen: nur die Liste
anpassen und eine passende SVG-Datei ablegen.

**Wichtig:** Die mitgelieferten Dateien sind *Wortmarken in Markenfarbe*, die
das Skript `tools/make_logos.py` erzeugt — keine Kopien der offiziellen
Bildmarken. Die Nutzung echter Logos setzt die Freigabe der jeweiligen
Gesellschaft voraus (bei bestehender Courtagezusage in der Regel über das
Maklerportal erhältlich). Offizielles Logo unter gleichem Dateinamen ablegen,
fertig.

## QR-Code für die Visitenkarte

* **`visitenkarte.html`** erzeugt den Code live im Browser: Adresse, Farbe und
  Fehlerkorrektur wählbar, Download als SVG (Druck) oder PNG (2048 px), dazu
  eine druckfertige Vorlage für Vorder- und Rückseite (Browser → Drucken → als PDF).
* **`assets/qr/`** enthält den Code für die in `config.js` hinterlegte Adresse.
  Nach einem Domainwechsel: `python3 tools/make_qr.py` (benötigt `pip install "qrcode[pil]"`).
* Druckhinweise: mindestens 15 mm Kantenlänge, 2 mm heller Rand, dunkler Code auf hellem Grund.

## Veröffentlichung

**GitHub Pages:** Repository → *Settings → Pages → Source: GitHub Actions*.
Der Workflow `.github/workflows/pages.yml` veröffentlicht bei jedem Push auf
`main`. Eigene Domain unter *Settings → Pages → Custom domain* eintragen und in
`config.js` als `siteUrl` übernehmen.

Jeder andere Webspace funktioniert ebenso: Alle Dateien per FTP hochladen.

## Datenschutz-Hinweise zur Technik

* Schriften, Skripte und Grafiken werden lokal geladen — kein Google Fonts, kein CDN.
* Keine Cookies, kein Tracking, daher kein Cookie-Banner.
* Das Kontaktformular öffnet das E-Mail-Programm des Besuchers (`mailto:`);
  es werden keine Daten auf dem Server gespeichert. Soll das Formular direkt
  versenden, bietet sich ein Dienst wie Formspree oder ein kleines PHP-Skript an.
