# Seelenfrieden Urnenrückführung GmbH — Website

Statische, zweisprachige Website (Deutsch / Russisch) für die
Seelenfrieden Urnenrückführung GmbH, Zug: Überführung von Urnen aus
Deutschland in die Schweiz — «Friedhofszwang? Nein danke.»

Kein Build, kein Framework, keine Abhängigkeiten zu Dritten. Lokal testen:

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

## Aufbau

```
index.html               Startseite: Hero, Rechtslage, Leistungen, Ablauf, Festpreis,
                         Vorsorge, Über uns, Versprechen, FAQ, Kontakt mit Formular
friedhofszwang.html      Ratgeber: Friedhofszwang, Schweizer Praxis, Weg über die Grenze
impressum.html           Impressum
datenschutz.html         Datenschutzerklärung (DSG / DSGVO)
404.html                 Fehlerseite (beim Hoster als 404-Dokument eintragen)
tools/build-pages.py     erzeugt die vier Unterseiten aus einem gemeinsamen Rahmen

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
`i18n.js` setzt das Attribut — Reihenfolge: `?lang=ru` in der Adresse,
gemerkte Wahl (`localStorage`), Browsersprache, sonst Deutsch. Titel und
Meta-Beschreibung wechseln mit (`data-title-*`, `data-desc-*` am `<html>`).
Ohne JavaScript bleibt Deutsch stehen — es fehlt also nie Inhalt.

**Neuen Text ergänzen:** immer beide Sprachvarianten anlegen.

## Unterseiten pflegen

Ratgeber, Impressum, Datenschutz und 404 teilen sich Kopf- und Fusszeile.
Sie werden aus `tools/build-pages.py` erzeugt:

```bash
python3 tools/build-pages.py
```

Text ändern → im Skript ändern → Skript laufen lassen → die HTML-Dateien
mit einchecken. Die Startseite `index.html` wird direkt gepflegt.

## Kontaktformular

Ohne Konfiguration öffnet das Formular das Mailprogramm der Besucherin mit
vorausgefülltem Text (Empfänger aus `data-mailto`). Für einen echten Versand
am `<form>` ein `data-endpoint` setzen, z. B. Formspree, eine Netlify
Function oder einen eigenen Endpunkt, der JSON per POST entgegennimmt:

```html
<form class="form" data-endpoint="https://formspree.io/f/XXXX" ...>
```

Das unsichtbare Feld `website` ist ein Honeypot gegen Bots.

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

## Suchmaschinen und Vorschauen

JSON-LD (`LocalBusiness`, `FAQPage`) im Kopf der Startseite, Open-Graph-Bild
`assets/img/og.png` (1200 × 630), `hreflang` für beide Sprachen, `sitemap.xml`
und `robots.txt`. Die Sitemap verwendet die Punycode-Form der Domain.

## Noch einzutragen

| Stelle | Platzhalter | gebraucht wird |
|---|---|---|
| alle Seiten | `+41 41 000 00 00` | echte Rufnummer (auch in `tel:`-Links und im JSON-LD) |
| Impressum | `CHE-000.000.000` | UID nach Handelsregistereintrag |
| Datenschutz | «Hosting-Anbieter» | Name und Serverstandort des Hosters |
| Über uns | Porträtrahmen (Canvas) | Foto von Daniel Klotzek — `<canvas>` durch `<img>` ersetzen |
| Hero, Festpreis, FAQ | `200+`, `490 €`, «1–2 Wochen», «Zahlung nach Übergabe» | Zahlen und Zusagen bestätigen — Werbeaussagen müssen stimmen |
| Festpreis | «Nicht enthalten» | Leistungsumfang mit dem tatsächlichen Angebot abgleichen |
| Kontakt | `data-endpoint` | Formular-Endpunkt, falls kein Mailprogramm gewünscht |

Die E-Mail-Adresse ist aus der Domain abgeleitet; `mailto:`-Links verwenden die
Punycode-Form `info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch`, damit ältere
Mailprogramme sie auflösen.
