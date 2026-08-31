# ARKTIK Klimasysteme — Bedienungsanleitung für den Shop

Statische Website für einen Klimaanlagen-Onlineshop. Kein Framework, keine
externen Ressourcen, keine Cookies. Der fertige Stand liegt in `klimaanlagen/`
und lässt sich unverändert auf jeden Webspace hochladen.

```
src/                      Quellen
  layout.html             Rahmen: Kopf, Navigation, Fusszeile, Warenkorb-Schublade
  products.json           Produktkatalog — die einzige Datenquelle für Geräte
  pages/*.html            Inhaltsseiten mit Kopfblock
  artikel/*.html          Ratgeberartikel mit Kopfblock
tools/
  build.py                Erzeugt aus den Quellen die fertige Website
  check.py                Prüft Links, JSON-LD, Titles, Alt-Texte, Tag-Balance
  make-og.py              Rendert das Vorschaubild für soziale Netzwerke als PNG
klimaanlagen/             Ergebnis — das ist, was hochgeladen wird
  assets/css|js|img       Handgeschriebene Stile und Skripte, erzeugte Bilder
  produkte/*.html         Je Gerät eine eigene Seite (erzeugt)
  sitemap.xml robots.txt manifest.webmanifest _headers   (erzeugt)
```

## Bauen und ansehen

```bash
python3 tools/build.py     # erzeugt klimaanlagen/
python3 tools/check.py     # muss "0 Fehler" melden
cd klimaanlagen && python3 -m http.server 8000
```

Danach <http://localhost:8000> öffnen. Es wird nichts installiert, es gibt keine
Abhängigkeiten ausser Python 3.

## Vorschau zum Herumzeigen

```bash
python3 tools/bundle.py    # erzeugt vorschau/arktik-vorschau.html
```

Packt die komplette Website — alle Seiten, Stile, Skripte und Grafiken — in eine
einzige HTML-Datei. Die läuft ohne Webserver: Doppelklick genügt, und sie lässt
sich als Anhang verschicken. Jede Seite wird in einem eigenen Dokument angezeigt,
damit die Seitenskripte genauso laufen wie im Echtbetrieb; Verweise werden
abgefangen und auf die eingebettete Fassung umgeleitet.

In der Vorschau abgeschaltet: Formulare (statt E-Mail erscheint ein Hinweis) und
`mailto:`- sowie `tel:`-Verweise. Warenkorb, Filter, Sortierung, Registerkarten
und der Kühllastrechner funktionieren vollständig.

Nach jeder Änderung erst `tools/build.py`, dann `tools/bundle.py` ausführen —
der Bundler liest den gebauten Stand aus `klimaanlagen/`.

## Was wo geändert wird

| Ziel | Datei |
|---|---|
| Firmenname, Domain, Adresse, Telefon, E-Mail | `tools/build.py`, Block `SITE` ganz oben |
| Farben, Schriften, Abstände, Radien | `klimaanlagen/assets/css/style.css`, `:root` |
| Produkte anlegen, ändern, entfernen | `src/products.json` |
| Texte einer Seite | passende Datei in `src/pages/` |
| Ratgebertexte | `src/artikel/` |
| Navigation, Fusszeile | `src/layout.html` |

Nach jeder Änderung `python3 tools/build.py` ausführen. Dateien in
`klimaanlagen/*.html` direkt zu bearbeiten bringt nichts — sie werden beim
nächsten Lauf überschrieben. Die Dateien unter `klimaanlagen/assets/` sind
davon ausgenommen und werden von Hand gepflegt.

## Ein Produkt hinzufügen

Einen Eintrag in `src/products.json` ergänzen. Pflichtfelder:

```json
{
  "slug": "arktik-neu-12",          // wird zur URL: produkte/arktik-neu-12.html
  "sku": "ARK-N12",
  "name": "ARKTIK Neu 12",
  "kurz": "Split-Klimaanlage 3,5 kW mit …",
  "kategorie": "quick-connect",      // monoblock | quick-connect | split | multisplit | mobil | zubehoer
  "preis": 749, "uvp": 929,
  "kw": 3.5, "btu": 12000,
  "raum_min": 22, "raum_max": 42,
  "seer": 7.0, "scop": 4.0,
  "kaeltemittel": "R32", "fuellmenge": 0.72,
  "db": 22, "wifi": true, "heizen": true,
  "eek_kuehlen": "A+++", "eek_heizen": "A++",
  "gewicht": 43, "masse": "Innen 900 × 300 × 210 mm",
  "montage": "selbst",               // selbst | fachbetrieb | keine
  "badge": "Selbstmontage",          // kurz halten, sonst wird die Karte gekürzt
  "farbe": "#1f9fb8",                // Farbe der erzeugten Produktgrafik
  "features": ["…"],                 // 4–6 Punkte
  "beschreibung": ["…", "…", "…"]    // 2–4 Absätze
}
```

Danach neu bauen. Produktseite, Übersicht, Filterzähler, Sitemap, Rechner-
Empfehlungen und die strukturierten Daten entstehen automatisch.

Die Produktbilder sind erzeugte SVG-Zeichnungen (`assets/img/produkt-*.svg`).
Sobald echte Fotos vorliegen: Fotos unter demselben Dateinamen als `.jpg`
ablegen und in `product_card()` sowie `product_page()` die Endung ändern.

## Warenkorb

Der Warenkorb liegt im `localStorage` des Besuchers unter dem Schlüssel
`arktik.cart.v1`. Es gibt bewusst kein Backend: Für einen echten Bestellabschluss
muss ein Zahlungs- oder Shopsystem angebunden werden. Übergabepunkt ist
`src/pages/kasse.html`. Beim Anbinden zu beachten:

- Preise serverseitig erneut prüfen — der Warenkorb liegt beim Kunden.
- Schaltfläche muss „zahlungspflichtig bestellen“ heissen (§ 312j Abs. 3 BGB).
- Bestellbestätigung mit allen Vertragsdaten unmittelbar per E-Mail.

## Formulare

Kontakt-, Newsletter- und Bestellformular öffnen im Auslieferungszustand das
E-Mail-Programm des Besuchers. Für einen echten Endpunkt genügt ein Attribut:

```html
<form data-form data-endpoint="https://…" method="post" action="https://…">
```

Sobald `data-endpoint` gesetzt ist, sendet das Formular normal ab, statt
`mailto:` zu verwenden.

## Veröffentlichen

Den Inhalt von `klimaanlagen/` in das Wurzelverzeichnis der Domain kopieren.
Getestet mit statischem Webspace, Netlify, Cloudflare Pages und GitHub Pages.

- `_headers` setzt auf Netlify und Cloudflare Pages Sicherheits- und
  Cache-Regeln. Auf klassischem Webspace muss dasselbe in `.htaccess`.
- `404.html` als Fehlerseite eintragen.
- In `tools/build.py` unter `SITE["url"]` die echte Domain eintragen und neu
  bauen, sonst zeigen Canonical-Links und Sitemap auf die Beispieldomain.
- Nach dem Livegang die `sitemap.xml` in der Google Search Console einreichen.

## Suchmaschinen

Bereits enthalten:

- eigener Title und eine Meta-Description je Seite, Canonical, Open Graph, Twitter Card
- strukturierte Daten: `OnlineStore`, `WebSite` mit `SearchAction`, `BreadcrumbList`,
  `Product` mit `Offer`, `ShippingDetails` und `MerchantReturnPolicy`, `ItemList`,
  `FAQPage`, `Article`, `WebApplication`
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
- semantische Gliederung, genau eine `h1` je Seite, Alt-Texte, Sprungmarke,
  sichtbarer Fokus, Tastaturbedienung
- keine externen Ressourcen — kein Schriftart-Nachladen, kein Tracking

Bewusst **nicht** enthalten: `aggregateRating` und `review` in den strukturierten
Daten. Bewertungsauszeichnungen ohne echte, überprüfbare Bewertungen verstossen
gegen die Richtlinien von Google und gegen das UWG. Sobald echte Bewertungen über
einen unabhängigen Dienstleister vorliegen, lassen sie sich in `product_page()`
ergänzen.

## Vor dem Livegang

`docs/klimashop-rechtliches.md` durchgehen. Dort stehen die Registrierungen und
Nachweise, die für den Verkauf von Klimageräten in Deutschland vorliegen müssen —
mehrere davon **vor** dem ersten Verkauf.

Alle Platzhalter im Markup sind mit „Platzhalter“ oder `TODO` gekennzeichnet und
so zu finden:

```bash
grep -rn "Platzhalter\|TODO\|0000000" src/ tools/
```
