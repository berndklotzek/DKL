# Seelenfrieden Urnenrückführung GmbH — Website

Statische, zweisprachige Website (Deutsch / Russisch) für die
Seelenfrieden Urnenrückführung GmbH, Zug — «Friedhofszwang? Nein danke.»

Die Firma bietet **einen einzigen Service: «Zurück in die Heimat»** (das
Schweizer Modell, wie es auch Oase der Ewigkeit anbietet). Die Angehörigen
erwerben eine Grabstelle in den Schweizer Bergen; das deutsche Krematorium
übergibt die Urne an Seelenfrieden; nach Schweizer Recht gilt die Übergabe an
die Angehörigen als Beisetzung; danach kommt die Urne zur freien Verfügung
zurück zur Familie nach Hause. Abschied ohne Frist, spätere Beisetzung auf
der Grabstelle inklusive. Festpreis 490 € inkl. Schweizer MwSt. Keine
weltweite Überführung, keine anderen Dienste — alle Texte sind darauf
ausgerichtet.

Kein Build, kein Framework, keine Abhängigkeiten zu Dritten. Lokal testen:

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

## Aufbau

```
index.html               Startseite: Hero mit 3D-Urne, Rechtslage, Leistungen, Ablauf mit
                         3D-Route, Festpreis, Vorsorge, Über uns, Ratgeber, FAQ, Kontakt
friedhofszwang.html      Ratgeber: Friedhofszwang, Schweizer Praxis, Weg über die Grenze
urne-zu-hause-aufbewahren.html      Ratgeber: Urne zu Hause — DE verboten, CH erlaubt
zurueck-in-die-heimat.html          Ratgeber: das Modell Schritt für Schritt, Unterlagen, Kosten
bestattungsverfuegung.html          Ratgeber: Vorsorge zu Lebzeiten
impressum.html           Impressum
datenschutz.html         Datenschutzerklärung (DSG / DSGVO)
404.html                 Fehlerseite (beim Hoster als 404-Dokument eintragen)
ru/                      dieselben Seiten mit Russisch als Standardsprache (eigene URLs)
tools/build-pages.py     erzeugt alle Unterseiten, den Ordner ru/ und die Sitemap

assets/css/fonts.css     @font-face für die selbst gehosteten Schriften
assets/css/style.css     Gestaltungssystem; alle Farben, Schriften, Abstände oben in :root
assets/fonts/            Cormorant Garamond + Manrope (variabel, woff2, mit Kyrillisch)
assets/img/              Favicon (SVG/PNG), App-Icons, og.png für Vorschauen in Messengern
assets/js/i18n.js        Sprachumschalter DE/RU, ?lang=, Titel und Beschreibung je Sprache
assets/js/nav.js         Kopfzeile (Glas nach dem Scrollen), Menü auf schmalen Schirmen
assets/js/slogans.js     Wechselnde Hauptüberschrift
assets/js/scene.js       Dämmerung über dem Zugersee: Berge, Mond, Stadt, Spiegelung (Canvas)
assets/js/flag.js        Wehende Schweizer Fahne am Mast (Canvas)
assets/js/reveal.js      Einblenden beim Scrollen, Zähler, aktiver Menüpunkt, Inhaltsverzeichnis
assets/js/form.js        Kontaktformular: Endpunkt oder Mailprogramm
assets/js/fx.js          Lesefortschritt, Lichtkegel unter dem Zeiger, Neigung der Preiskarte
assets/js/three-scenes.js  WebGL: Partikel-Urne im Hero, Lichtroute im Ablauf
assets/vendor/three.min.js Three.js r128 (MIT), lokal — kein CDN

robots.txt, sitemap.xml, site.webmanifest
```

## Gestaltung

Der Auftritt ist bewusst **einfarbig dunkel** — Gold auf Nachtblau, warmes
Weiss statt Reinweiss — und hat keine helle Variante: Er soll auf jedem Gerät
gleich wirken. Alle Werte liegen als Variablen in `:root`:

```css
--gold:    #c9a86b;   /* Akzent: Kursive, Buttons, Kennzahlen, Zierlinien */
--paper:   #f4efe6;   /* Schriftweiss, leicht warm */
--ink-800: #0b1119;   /* Grundton der Abschnitte */
--track:   .24em;     /* Laufweite der Versalien-Kleinschrift */
--step:    clamp(5rem, 11vw, 9.5rem);   /* Abstand zwischen Abschnitten */
```

Schriften: **Cormorant Garamond** (Überschriften, Zitate, Kursive in Gold) und
**Manrope** (Fliesstext, Navigation, Versalien). Beide liegen als variable
woff2-Dateien unter `assets/fonts/`, mit lateinischem und kyrillischem Subset —
es wird keine Verbindung zu Google Fonts aufgebaut (DSGVO). Lizenz: SIL OFL,
siehe `assets/fonts/LICENSE.txt`.

Wiederkehrende Motive: die Klasse `.caps` (Versalien mit weiter Laufweite),
`.eyebrow` (Zeile mit Strich), goldene Haarlinien zwischen den Abschnitten,
ein feines Filmkorn über der ganzen Seite (`body::before`).

## Zweisprachigkeit

Beide Sprachfassungen stehen parallel im HTML:

```html
<span lang="de">Leistungen</span><span lang="ru">Услуги</span>
```

Sichtbar ist die Sprache, die `data-lang` am `<html>`-Element freigibt.
Jede Sprache hat **eine eigene Adresse**: `/` ist Deutsch, `/ru/` ist Russisch
(gleiche Dateien, russische Standardsprache, Titel, Beschreibung, Canonical).
Die Umschalter DE/RU sind echte Links mit `hreflang`, damit Suchmaschinen
beide Fassungen finden. Für Besucher schaltet `i18n.js` sofort um, ohne neu
zu laden, und merkt sich die Wahl. Ohne JavaScript steht die Sprache der
Adresse — es fehlt also nie Inhalt.

**Neuen Text ergänzen:** immer beide Sprachvarianten anlegen, danach
`python3 tools/build-pages.py` laufen lassen, damit `ru/` nachzieht.

## Unterseiten pflegen

Alle Seiten ausser der Startseite werden aus `tools/build-pages.py` erzeugt;
das Skript schreibt auch den Ordner `ru/` (inklusive `ru/index.html` aus
`index.html`) und die `sitemap.xml`:

```bash
python3 tools/build-pages.py
```

Text ändern → im Skript ändern → Skript laufen lassen → alle erzeugten
Dateien mit einchecken. Die Startseite `index.html` wird direkt gepflegt.

## Kontaktformular

Ohne Konfiguration öffnet das Formular das Mailprogramm der Besucherin mit
vorausgefülltem Text (Empfänger aus `data-mailto`). Für einen echten Versand
am `<form>` ein `data-endpoint` setzen, z. B. Formspree, eine Netlify
Function oder einen eigenen Endpunkt, der JSON per POST entgegennimmt:

```html
<form class="form" data-endpoint="https://formspree.io/f/XXXX" ...>
```

Das unsichtbare Feld `website` ist ein Honeypot gegen Bots.

## 3D-Szenen

`three-scenes.js` zeichnet mit Three.js zwei WebGL-Szenen:

- **Hero:** eine Urne aus rund 9 000 goldenen Lichtpunkten (auf Handys 4 200),
  gleichmässig auf einer Drehfläche verteilt. Sie dreht sich, neigt sich zur
  Maus und löst sich beim Scrollen in einen Strom auf, der nach oben zieht.
  Dazu zwei Lichtbahnen und aufsteigende Funken. Profil der Urne: `profile`
  oben in der Datei, Radius/Höhe von unten nach oben.
- **Ablauf:** Drahtgitter-Gelände, Lichtbogen von Deutschland nach Zug, ein
  reisender Lichtpunkt mit Schweif.

Gerendert wird nur, wenn die Szene im Bild und der Tab sichtbar ist. Ohne
WebGL, ohne Three.js oder bei `prefers-reduced-motion` bleibt die gemalte
2D-Kulisse stehen — es leuchtet nur weniger. Three.js liegt lokal unter
`assets/vendor/` (MIT, Lizenz beigelegt), es wird kein CDN angesprochen.

## Kulisse und Bewegung

`scene.js` zeichnet die Dämmerung über dem Zugersee selbst, statt ein Foto zu
laden: Himmel, Sterne, Mondsichel, vier Bergketten mit Luftperspektive, die
Lichter der Stadt am Ufer und der See mit Spiegelung und Mondstrasse. Alles
kommt aus einem festen Startwert — dieselbe Kulisse auf jedem Gerät. Gezeichnet
wird in jedes `canvas.scene`: im Hero, hinter dem Kontaktteil und im
Porträtrahmen bei «Über uns». Im Hero läuft eine sanfte Parallaxe.

`flag.js` zeichnet die Fahne in eidgenössischen Proportionen und lässt sie
spaltenweise über eine Sinuswelle wehen. `reveal.js` blendet Abschnitte beim
Scrollen ein und zählt die Kennzahl «200+» hoch.

Bei `prefers-reduced-motion` steht alles still: Fahne, Laufschrift, Nebel,
Slogan-Wechsel, Einblendungen.

## Suchmaschinen

- **Eigene URLs je Sprache** (`/`, `/ru/`) mit `hreflang` in beide Richtungen
  und `x-default`, Canonical in Punycode-Form.
- **Strukturierte Daten:** Startseite `Organization`/`LocalBusiness` mit Geo,
  Öffnungszeiten und Kontakt, `WebSite`, `WebPage`, `Service` mit `Offer`
  (490 €) und Leistungskatalog, `FAQPage` mit acht Fragen. Ratgeber-Seiten
  `Article` + `BreadcrumbList`, Impressum/Datenschutz `WebPage` + Breadcrumb.
- **Inhalt:** vier Ratgeber-Artikel zu den Suchbegriffen «Friedhofszwang»,
  «Urne zu Hause aufbewahren», «Zurück in die Heimat / Urne nach Schweizer
  Recht», «Bestattungsverfügung», untereinander verlinkt («Weiterlesen») und von der
  Startseite (#ratgeber) und der Fusszeile aus.
- **Technik:** `sitemap.xml` mit allen 14 URLs und Sprachalternativen,
  `robots.txt`, Open-Graph je Seite mit Bild (1200 × 630), `theme-color`,
  Web-Manifest, keine Fremdabrufe, Schriften vorgeladen.
- **Beim Livegang:** Sitemap in der Google Search Console einreichen,
  Google-Unternehmensprofil für «Seelenfrieden Urnenrückführung GmbH, Zug»
  anlegen und mit der Website verknüpfen.

## Noch einzutragen

| Stelle | Platzhalter | gebraucht wird |
|---|---|---|
| alle Seiten | `+41 41 000 00 00` | echte Rufnummer (auch in `tel:`-Links und im JSON-LD) |
| Impressum | `CHE-000.000.000` | UID nach Handelsregistereintrag |
| Datenschutz | «Hosting-Anbieter» | Name und Serverstandort des Hosters |
| Über uns | Porträtrahmen (Canvas) | Foto von Daniel Klotzek — `<canvas>` durch `<img>` ersetzen |
| Hero, Festpreis, FAQ, Ratgeber | `200+`, `490 €`, «inkl. Schweizer MwSt.», «1–2 Wochen», «Zahlung vorab» | Zahlen und Zusagen bestätigen — Werbeaussagen müssen stimmen |
| überall | «Grabstelle in den Schweizer Bergen — Bergwiese oder Wald» | Ort, Gemeinde und Art der Grabstelle eintragen (z. B. Wiesengrab im Kanton …) |
| Festpreis, Ratgeber | «Versand der Urne zu uns gehört zur Bestattung in Deutschland» | Wer den Versand DE→CH zahlt und wie die Rückführung erfolgt (Kurier / persönlich) bestätigen |
| Festpreis | «Nicht enthalten» | Leistungsumfang mit dem tatsächlichen Angebot abgleichen |
| Kontakt | `data-endpoint` | Formular-Endpunkt, falls kein Mailprogramm gewünscht |

Die E-Mail-Adresse ist aus der Domain abgeleitet; `mailto:`-Links verwenden die
Punycode-Form `info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch`, damit ältere
Mailprogramme sie auflösen.
