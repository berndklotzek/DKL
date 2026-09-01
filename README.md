# Seelenfrieden Urnenrückführung GmbH — Website

Statische, zweisprachige Website (Deutsch / Russisch) für die
Seelenfrieden Urnenrückführung GmbH, Zug.

## Aufbau

```
quelle.html             Einzige Datei, die von Hand bearbeitet wird — beide Sprachen nebeneinander
tools/sprachen.py       Trennt die Sprachen und erzeugt daraus:
index.html                deutsche Seite   (/)
ru/index.html             russische Seite  (/ru/)
sitemap.xml               beide URLs mit hreflang-Verweisen
robots.txt
assets/css/style.css    Styles; alle Farben/Typo als CSS-Variablen ganz oben in :root
assets/img/og-*.png     Vorschaubilder für geteilte Links, je Sprache
```

Kein Framework, keine externen Ressourcen. Die erzeugten Seiten liegen im
Verzeichnis und laufen direkt von jedem Webspace. Nach jeder Änderung an
`quelle.html`:

```bash
python3 tools/sprachen.py            # erzeugt die Seiten neu
python3 tools/sprachen.py --pruefen  # meldet nur, ob etwas veraltet ist
python3 -m http.server 8000          # lokal ansehen
```

## Zweisprachigkeit

In `quelle.html` stehen beide Sprachfassungen weiterhin nebeneinander:

```html
<span lang="de">Leistungen</span><span lang="ru">Услуги</span>
```

`tools/sprachen.py` schneidet daraus zwei Seiten: für `/` fällt alles mit
`lang="ru"` weg, für `/ru/` alles mit `lang="de"`. Beide bekommen einen eigenen
Titel, eine eigene Beschreibung, `canonical` auf sich selbst und
`hreflang`-Verweise aufeinander.

**Neuen Text ergänzen:** immer beide Sprachvarianten anlegen, sonst fehlt der
Abschnitt in einer Sprache. Danach das Skript laufen lassen — sonst zeigt die
Website den alten Stand.

**Warum nicht mehr per CSS umschalten?** Weil eine URL nur in einer Sprache
ranken kann. Solange beide Fassungen in einem Dokument standen und per CSS
umgeschaltet wurden, sah eine Suchmaschine eine gemischtsprachige Seite ohne
eigene russische Adresse — die russische Zielgruppe war praktisch unauffindbar.
Der frühere Umschalter (`assets/js/i18n.js`) ist deshalb entfallen; an seiner
Stelle stehen echte Verweise auf die jeweils andere Seite, die auch ein
Suchmaschinen-Roboter verfolgen kann.

## Suchmaschinen

Was in den erzeugten Seiten steckt:

| Baustein | Wo |
|---|---|
| Titel und Beschreibung je Sprache | `tools/sprachen.py`, Wörterbuch `SPRACHEN` |
| `canonical`, `hreflang`, `x-default` | automatisch aus denselben Angaben |
| Open Graph und Twitter Card | dito, Bilder unter `assets/img/` |
| Strukturierte Daten `LocalBusiness` | Anschrift, Sprachen, Erreichbarkeit |
| Strukturierte Daten `FAQPage` | wird aus dem Abschnitt `#fragen` der Seite gelesen |
| `sitemap.xml`, `robots.txt` | erzeugt |

Die Fragen und Antworten stehen nur an einer Stelle — im Markup des Abschnitts
`#fragen`. Wer dort etwas ändert, ändert die strukturierten Daten mit.

**Eine Angabe fehlt noch und ist im Skript als `TODO` markiert:** die endgültige
Domain (`BASIS`). Die Rufnummer steht als `TELEFON` im selben Skript und wandert
von dort in die strukturierten Daten.

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
| Impressum | `CHE-000.000.000` | UID/Handelsregisternummer nach Eintrag |
| Kontakt + Impressum | `6300 Zug` | Postleitzahl bestätigen |

Die E-Mail-Adresse `info@seelenfrieden-urnenrückführung.ch` ist aus der Domain
abgeleitet; `mailto:`-Links verwenden die Punycode-Form
`info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch`, damit ältere Mailprogramme sie
korrekt auflösen.
