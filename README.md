# DKL — Websites

Zwei eigenständige, statische Websites in einem Repository.

| Projekt | Ordner | Beschreibung |
|---|---|---|
| Seelenfrieden Urnenrückführung GmbH | `index.html`, `assets/` | Zweisprachige Website (DE/RU), siehe unten |
| ARKTIK Klimasysteme | `klimaanlagen/` | Onlineshop für Klimaanlagen, erzeugt aus `src/` mit `tools/build.py` |

**Klimaanlagen-Shop:** Anleitung in
[`docs/klimashop-anleitung.md`](docs/klimashop-anleitung.md), rechtliche
Checkliste vor dem Livegang in
[`docs/klimashop-rechtliches.md`](docs/klimashop-rechtliches.md).

```bash
python3 tools/build.py     # Shop bauen
python3 tools/check.py     # Links, JSON-LD und SEO-Grundlagen prüfen
```

---

# Seelenfrieden Urnenrückführung GmbH — Website

Statische, zweisprachige Website (Deutsch / Russisch) für die
Seelenfrieden Urnenrückführung GmbH, Zug.

## Aufbau

```
index.html              Komplette Seite (Hero, Leistungen, Ablauf, Über uns, Kontakt, Impressum)
assets/css/style.css    Styles; alle Farben/Typo als CSS-Variablen ganz oben in :root
assets/js/i18n.js       Sprachumschalter DE/RU
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
