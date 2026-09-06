# Fuhrparkkompass — Website

Statische Website für **www.fuhrparkkompass.de**: unabhängige Flottenversicherung
für Speditionen, Transport- und Logistikunternehmen sowie gewerbliche Fuhrparks.
Gründer: Daniel Klotzek (Geschäftsführer, Logistik) und Kevin Kelsch (Versicherung).

Kein Build, kein Framework, keine externen Dienste. Lokal testen:

```bash
cd fuhrparkkompass
python3 -m http.server 8000     # dann http://localhost:8000 öffnen
```

Zum Livegang den Inhalt dieses Ordners ins Webroot hochladen (per FTP/SFTP oder
Git-Deploy). `.htaccess` gilt für Apache-Hoster (Strato, IONOS, all-inkl …),
`_headers` für Netlify und Cloudflare Pages.

## Aufbau

```
index.html                  Startseite: Hero mit 3D-Lkw, Kennzahlen, Leistungen, Rechner,
                            Ablauf, Team, Vergleich, FAQ, Terminbuchung, Kontakt
flottenversicherung.html    Ratgeber (SEO-Landingpage): Bausteine, Prämienlogik, 7 Hebel, Fristen
speditionen.html            Branchenseite: Lkw-Flotte, Verkehrshaftung HGB/CMR, Stillstand
impressum.html              Pflichtangaben inkl. § 34d GewO (Platzhalter gelb markiert)
datenschutz.html            Datenschutzerklärung (Platzhalter gelb markiert)
404.html                    Fehlerseite
robots.txt, sitemap.xml     Suchmaschinen
site.webmanifest            App-Icon, Farben
.htaccess, _headers         HTTPS/www-Umleitung, Caching, Sicherheits-Header, CSP

assets/css/style.css        Designsystem; alle Farben/Schriften als Variablen in :root
assets/js/config.js         ZENTRALE EINSTELLUNGEN: Kontakt, Buchung, Öffnungszeiten, Rechner
assets/js/site.js           Kopfzeile, Menü, Einblendungen, Zähler, Inhaltsverzeichnis
assets/js/truck.js          3D-Sattelzug im Hero (eingebaut oder als glTF-Modell)
assets/js/calc.js           Ersparnis-Rechner
assets/js/booking.js        Terminbuchung (4 Schritte, Kalender, Slots, Formular, .ics)
assets/vendor/three.min.js  Three.js r128, selbst gehostet (kein CDN, DSGVO)
assets/vendor/GLTFLoader.js Lader für echte 3D-Modelle (.glb/.gltf)
assets/fonts/               Sora (Headlines) und Manrope (Text), selbst gehostet
assets/img/                 Porträt, Logo-Icons, OG-Bild, Favicon
```

## Vor dem Livegang eintragen

| Stelle | Platzhalter | Gebraucht wird |
|---|---|---|
| `assets/js/config.js` | `phone`, `phoneDisplay` | echte Rufnummer (wird auf allen Seiten eingesetzt) |
| `assets/js/config.js` | `email` | Postfach `termin@fuhrparkkompass.de` einrichten oder ändern |
| `assets/js/config.js` | `bookingEndpoint` | siehe „Terminbuchung“ unten |
| `impressum.html` | gelbe `.todo`-Felder | Rechtsform, Anschrift, Registergericht, USt-ID, **IHK-Erlaubnis § 34d GewO, Vermittlerregister-Nr.** |
| `datenschutz.html` | gelbe `.todo`-Felder | Hoster, Log-Löschfrist, Aufsichtsbehörde, Stand |
| `index.html` Hero/Stats | „400+ Kunden“, „Ab 3 Fahrzeugen“, „0 €“ | Werbeaussagen bestätigen – sie müssen belegbar sein |
| `assets/js/config.js` | `calc.saving` | Ersparnis-Spannen des Rechners mit echten Erfahrungswerten abgleichen |
| `assets/js/config.js` | `holidays` | Feiertage jährlich ergänzen |
| `assets/js/config.js` | `truckModel` | optional: lizenziertes 3D-Modell eines echten Lkw, siehe „3D-Lkw“ |

Alle Vorkommen der Platzhalter findet `grep -rn "todo\|000 000" *.html assets/js/config.js`.

## Terminbuchung

Das Buchungstool läuft komplett im Browser: Terminart → Kalender (Werktage,
Feiertage, Vorlauf und Mittagspause aus `config.js`) → Kontaktformular →
Zusammenfassung. Der Versand hat zwei Wege:

1. **`bookingEndpoint` gesetzt** – die Anfrage geht als JSON per `POST` an diese
   URL. Geeignet: [Formspree](https://formspree.io), ein Make/Zapier-Webhook,
   ein eigener Endpunkt. Felder: `type, typeName, minutes, date, time, name,
   company, email, phone, vehicles, branch, message, page, sentAt`.
   Wichtig: Bei externem Dienst die `connect-src`-Regel in `.htaccess`/`_headers`
   um dessen Domain erweitern und die Datenschutzerklärung (Abschnitt 4 und 6) anpassen.
2. **Leer** (Auslieferungszustand) – der Browser öffnet das Mailprogramm mit
   fertiger Anfrage an `email`. Funktioniert ohne Server, ist aber vom Kunden
   abhängig; für den Live-Betrieb Weg 1 wählen.

Zusätzlich lädt der Kunde eine `.ics`-Datei für seinen Kalender. Ein
Cal.com-/Calendly-Link kann als Alternative unter `calendarLink` eingetragen werden.

## 3D-Lkw

`truck.js` zeigt einen europäischen Sattelzug in einer Studio-Beleuchtung
(Environment-Map für Reflexionen auf Lack, Chrom und Glas, Schlüssellicht mit
weichen Schatten). Der Zug fährt beim Laden ins Bild, die Räder drehen, die
Fahrbahnmarkierung läuft; die Maus neigt die Kamera, Scrollen dreht den Zug.

**Eingebautes Modell.** Ohne weitere Konfiguration wird der Zug aus gerundeten
Profilen und Drehkörpern aufgebaut: Frontlenker-Kabine mit geneigter
Windschutzscheibe, Sonnenblende, Dachspoiler, Spiegelarmen, Einstieg, Grill mit
Emblem, LED-Scheinwerfern, Kennzeichen; Reifen mit Profil und Alufelgen;
Koffer mit Türen, Verschlussstangen, Schürzen, Umriss- und Rückleuchten. Die
Beschriftung auf dem Auflieger wird aus einem Canvas gezeichnet.

**Echtes Modell einbinden.** Für ein fotorealistisches Fahrzeug (z. B. ein
lizenziertes Actros-/TGX-Modell von Sketchfab, CGTrader oder TurboSquid) die
Datei als `.glb` unter `assets/models/` ablegen und in `config.js` eintragen:

```js
truckModel: "assets/models/lkw.glb",
truckLength: 16.5,      // Zuglänge in Metern, das Modell wird darauf skaliert
truckRotationY: 0       // Math.PI, falls die Front nach hinten zeigt
```

Das Modell wird geladen (`assets/vendor/GLTFLoader.js`), auf die Straße
gestellt und zentriert. Räder drehen sich, wenn ihre Objekte im Modell
„wheel“, „rad“, „tire“ oder „tyre“ im Namen tragen. Empfehlung: glTF mit
PBR-Materialien, unter 15 MB, Texturen bis 2048 px; Draco-komprimierte Dateien
brauchen zusätzlich den Draco-Decoder. Schlägt das Laden fehl, erscheint das
eingebaute Modell.

- Rendering pausiert, wenn der Hero nicht sichtbar ist oder der Tab im Hintergrund liegt.
- Bei `prefers-reduced-motion` steht ein einzelnes Standbild.
- Ohne WebGL erscheint eine SVG-Silhouette (`.truck-fallback`).
- Materialien stehen in `truck.js` unter `M`, Kamera in `camBase`/`camTarget`, Blickwinkel in `baseYaw`.

## SEO

- Eigene `title`/`description`, Canonical, hreflang, Open-Graph und Twitter-Card je Seite
- Strukturierte Daten (JSON-LD): `InsuranceAgency`/`Organization` mit Gründern als `Person`,
  `WebSite`, `WebPage`, `FAQPage` (Start), `Article` + `FAQPage` + `BreadcrumbList` (Ratgeber),
  `Service` + `BreadcrumbList` (Speditionen)
- Semantik: eine H1 je Seite, Abschnitte mit `aria-labelledby`, Skip-Link, Alt-Texte
- Performance: Schriften vorgeladen und selbst gehostet, Skripte `defer`, Bilder `lazy`,
  WebP mit JPEG-Fallback, feste Bildmaße gegen Layoutsprünge, keine externen Requests
- `robots.txt`, `sitemap.xml` (mit Bild-Sitemap), `404.html`, `theme-color`, Web-Manifest
- Nach dem Livegang: Domain in der Google Search Console anlegen, Sitemap einreichen,
  Google-Unternehmensprofil erstellen; Impressum/Datenschutz sind bewusst `noindex`

## Datenschutz

Keine Cookies, kein Tracking, keine Google Fonts, kein CDN. Die Seite verbindet
sich mit keinem Drittanbieter — ein Cookie-Banner ist deshalb nicht nötig. Die
Content-Security-Policy in `.htaccess`/`_headers` erzwingt das.

## Gestaltung

Dunkles Navy (`--navy-*`) mit Signal-Amber (`--amber`) als Akzent — Lkw-Warnfarbe
und Kompassnadel zugleich. Helle Abschnitte auf `--paper` für Lesetexte. Headlines
in **Sora**, Text in **Manrope**. Alle Werte in `:root` von `style.css`.
