# Seelenfrieden Urnenrückführung GmbH — Website

Statische, zweisprachige Website (Deutsch / Russisch) für die
Seelenfrieden Urnenrückführung GmbH, Zug.

## Aufbau

```
index.html              Komplette Seite (Hero, Leistungen, Ablauf, Über uns, Kontakt, Impressum)
assets/css/style.css    Styles; alle Farben und Schriften als CSS-Variablen ganz oben in :root
assets/js/i18n.js       Sprachumschalter DE/RU
assets/js/nav.js        Menü auf schmalen Schirmen
assets/js/slogans.js    Wechsel der Hauptüberschrift
assets/js/flag.js       Wehende Schweizer Fahne am Mast (Canvas)
```

Kein Build, kein Framework. Lokal testen:

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

## Gestaltung

Der Auftritt ist bewusst **einfarbig dunkel** — Gold auf Nachtblau — und hat
keine helle Variante: Er soll auf jedem Gerät gleich wirken. Alle Werte liegen
als Variablen in `:root`:

```css
--gold:    #c9a86b;   /* Akzent: Kursive, Buttons, Kennzahlen, Zierlinien */
--ink-800: #0b1119;   /* Grundton der Abschnitte */
--track:   .22em;     /* Laufweite der Versalien-Kleinschrift */
```

Wiederkehrendes Motiv ist die Klasse `.caps`: kleine Versalien mit weiter
Laufweite, in Eyebrow, Buttons, Kennzahlen und Fusszeile.

### Schriften — bitte selbst hosten

Playfair Display und Poppins werden derzeit über **Google Fonts** geladen. Für
eine Seite, die sich an Angehörige in Deutschland richtet, ist das heikel: Das
Einbinden per Verweis überträgt die IP-Adresse der Besucher an Google, was
deutsche Gerichte als DSGVO-Verstoss gewertet haben (LG München I, 3 O 17493/20).
Vor dem Livegang also die beiden Familien herunterladen, unter `assets/fonts/`
ablegen, per `@font-face` einbinden und die drei `<link>`-Zeilen im `<head>`
entfernen.

## Zweisprachigkeit

Beide Sprachfassungen stehen parallel im HTML:

```html
<span lang="de">Leistungen</span><span lang="ru">Услуги</span>
```

Sichtbar ist die Sprache, die `data-lang` am `<html>`-Element freigibt.
`i18n.js` setzt das Attribut, merkt sich die Wahl in `localStorage` und
übernimmt beim ersten Besuch die Browsersprache. Ohne JavaScript bleibt Deutsch
stehen — es fehlt also nie Inhalt.

**Neuen Text ergänzen:** immer beide Sprachvarianten anlegen.

## Wechselnde Hauptüberschrift

Die fünf Aussagen im Hero stehen als `.slogan` in der `<h1 class="rotator">`,
jede zweizeilig: `.l1` weiss, `.l2` goldkursiv. Sie liegen im selben Rasterfeld
übereinander, deshalb springt das Layout beim Wechsel nicht. `slogans.js`
schaltet alle 5,2 Sekunden weiter und pausiert unter der Maus und bei Tab im
Hintergrund. Die erste Aussage trägt `is-active`, damit ohne JavaScript keine
leere Überschrift dasteht; bei `prefers-reduced-motion` bleibt sie stehen.

## Wehende Fahne

`flag.js` zeichnet die Fahne einmal flach in ein Offscreen-Canvas — Feld 32 × 32,
Kreuzbalken 20 × 6, also die eidgenössischen Proportionen — und trägt sie dann
spaltenweise versetzt wieder auf. Der Versatz kommt aus einer Sinuswelle, deren
Ausschlag zum freien Ende hin wächst; die Helligkeit jeder Spalte folgt der
Steigung der Welle. Der Mast wird separat gezeichnet. Kein Bild, keine Bibliothek.

Stellschrauben oben in der Datei: `WAVES`, `SPEED`, `AMP`. Bei
`prefers-reduced-motion` steht die Fahne still.

## Laufschrift

Das Slogan-Band über der Kopfzeile läuft endlos, weil die Items doppelt im
Markup stehen und die Spur um genau 50 % verschoben wird. Die laufende Spur ist
`aria-hidden`, der Slogan steht einmal zusätzlich als `.visually-hidden` im
Dokument. Pause beim Überfahren; bei `prefers-reduced-motion` steht ein
einzelner, zentrierter Slogan.

## Noch einzutragen

| Stelle | Platzhalter | gebraucht wird |
|---|---|---|
| Kontakt + Impressum | `+41 41 000 00 00` | echte Rufnummer |
| Impressum | `CHE-000.000.000` | UID nach Handelsregistereintrag |
| Kontakt + Impressum | `6300 Zug` | Postleitzahl bestätigen |
| Kopfzeile | `.logo-mark` (SVG) | das echte Signet |
| Hero | Bergkette als SVG | das Original-Hintergrundbild, falls gewünscht |
| Hero | `200+`, `490 €`, `100 %` | Zahlen bestätigen — Werbeaussagen müssen stimmen |

Die E-Mail-Adresse ist aus der Domain abgeleitet; `mailto:`-Links verwenden die
Punycode-Form `info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch`, damit ältere
Mailprogramme sie auflösen.
