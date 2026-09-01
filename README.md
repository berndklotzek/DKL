# Seelenfrieden Urnenrückführung GmbH — Website

Statische, zweisprachige Website (Deutsch / Russisch) für die
Seelenfrieden Urnenrückführung GmbH, Zug.

## Aufbau

```
index.html              Komplette Seite (Hero, Leistungen, Ablauf, Über uns, Kontakt, Impressum)
assets/css/style.css    Styles; alle Farben/Typo als CSS-Variablen ganz oben in :root
assets/js/i18n.js       Sprachumschalter DE/RU
assets/js/slogans.js    Wechsel der Hauptüberschrift
```

Kein Build, kein Framework, keine externen Ressourcen — die Seite läuft direkt
vom Dateisystem oder von jedem Webspace. Lokal testen:

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

## Zweisprachigkeit

Beide Sprachfassungen stehen parallel im HTML:

```html
<span lang="de">Leistungen</span><span lang="ru">Услуги</span>
```

Sichtbar ist jeweils die Sprache, die `data-lang` am `<html>`-Element freigibt
(CSS-Regeln am Ende des Abschnitts „Sprachumschaltung“ in `style.css`).
`i18n.js` setzt das Attribut, merkt sich die Wahl in `localStorage` und
übernimmt beim ersten Besuch die Browsersprache. Ohne JavaScript bleibt Deutsch
stehen — es fehlt also nie Inhalt.

**Neuen Text ergänzen:** immer beide Sprachvarianten anlegen, sonst ist der
Abschnitt in einer Sprache leer.

## Wechselnde Hauptüberschrift

Die fünf Aussagen im Hero stehen als `.slogan` in der `<h1 class="rotator">`.
Sie liegen im selben Rasterfeld übereinander, deshalb ist die Überschrift immer
so hoch wie die längste Aussage und springt beim Wechsel nicht. `slogans.js`
schaltet alle 5,2 Sekunden weiter und pausiert, solange die Maus darauf steht
oder der Tab im Hintergrund liegt.

Aussage ergänzen: einen weiteren `.slogan`-Block mit beiden Sprachen in die
`<h1>` einhängen — mehr braucht es nicht. Die erste Aussage trägt `is-active`,
damit ohne JavaScript nicht etwa eine leere Überschrift dasteht. Bei
`prefers-reduced-motion` bleibt genau diese erste Aussage stehen.

## Laufschrift

Das Slogan-Band über der Kopfzeile (`.ticker`) läuft endlos, weil die Items
doppelt im Markup stehen und die Spur um genau 50 % verschoben wird. Der Text
steht einmal zusätzlich als `.visually-hidden` im Dokument — die laufende Spur
selbst ist `aria-hidden`, damit Screenreader den Slogan nicht viermal vorlesen.
Beim Überfahren mit der Maus hält das Band an; bei `prefers-reduced-motion`
steht ein einzelner, zentrierter Slogan ohne Bewegung.

Tempo ändern: `animation: ticker-run 38s linear infinite` in `style.css`.

## Design anpassen

Sämtliche Farben, Schriften, Radien und die Maximalbreite liegen als Variablen
in `:root` (und für den Dunkelmodus in `@media (prefers-color-scheme: dark)`).
Ein Wechsel der Hausfarbe ist eine Zeile:

```css
--primary: #46594f;   /* Hauptfarbe */
--accent:  #b08d57;   /* Akzent (Zahlen, Icons, Hover) */
```

## Noch einzutragen

Diese Platzhalter stehen im Markup und sind mit `TODO` kommentiert:

| Stelle | Platzhalter | gebraucht wird |
|---|---|---|
| Kontakt + Impressum | `+41 41 000 00 00` | echte Rufnummer |
| Impressum | `CHE-000.000.000` | UID/Handelsregisternummer nach Eintrag |
| Kontakt + Impressum | `6300 Zug` | Postleitzahl bestätigen |

Die E-Mail-Adresse `info@seelenfrieden-urnenrückführung.ch` ist aus der Domain
abgeleitet; `mailto:`-Links verwenden die Punycode-Form
`info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch`, damit ältere Mailprogramme sie
korrekt auflösen.
