# Veronika Yovenko — Hunde- und Katzenbetreuung

Statische Website mit Anfragestrecke für Betreuungstermine. Kein Build, kein
Framework, keine Abhängigkeiten.

```
tierbetreuung/
├── index.html                    Startseite (Hero, Für wen, Leistungen, Tagesplan,
│                                 Ablauf, Über mich, Anfrage, Fragen, Kontakt)
├── impressum.html                Pflichtangaben — Umsatzsteuer noch offen
├── datenschutz.html              Datenschutzerklärung — Hoster noch offen
└── assets/
    ├── css/style.css             Farben, Schriften, Raster in :root
    ├── fonts/                    Fraunces + Karla, selbst gehostet
    ├── img/veronika.jpg          Porträt
    └── js/
        ├── booking-config.js     ← hier pflegt Veronika alles selbst
        ├── booking.js            Kalender, freie Zeiten, Anfrage
        └── site.js               Menü, Einblenden, Kleinkram
```

Lokal ansehen:

```bash
python3 -m http.server 8000    # dann http://localhost:8000/tierbetreuung/
```

Hochladen: Ordner `tierbetreuung/` auf einen beliebigen Webspace kopieren.

## Die Anfragestrecke

Vier Schritte: **Leistung → Zeit → Tier und Zuhause → Kontakt.** Am Ende steht
ein fertiger Anfragetext, den die Kundin per WhatsApp oder E-Mail abschickt;
dazu gibt es den Termin als `.ics` für den eigenen Kalender.

Der zweite Schritt sieht je nach Leistung anders aus — das ist der Kern:

| `mode` | Kalender | für |
|---|---|---|
| `visit` | ein Tag + eine Uhrzeit aus dem freien Raster | Gassirunde, Katzenbesuch, Tagesbetreuung, Kennenlernen |
| `stay` | erster und letzter Tag, alles dazwischen wird markiert | Urlaubsbetreuung |

Liegt in einem gewählten Zeitraum ein Tag, an dem Veronika schon vergeben ist,
lässt sich der Zeitraum gar nicht erst abschliessen; die Seite sagt, woran es
liegt.

Eine statische Seite kann keine Termine verwalten. Die Anfrage ist deshalb
ausdrücklich eine *Anfrage* — verbindlich wird sie mit Veronikas Antwort. Genau
so steht es auch auf der Seite.

### Verfügbarkeit pflegen

Alles in `assets/js/booking-config.js`:

| Was | Wo | Beispiel |
|---|---|---|
| Besuchszeiten | `visitHours` | `1: [['07:00','21:00']]` = Montag 7–21 Uhr |
| Pause am Tag | `visitHours` | `[['07:00','12:00'], ['16:00','21:00']]` |
| eigener Urlaub | `closedDates` | `['2026-12-24']` |
| einzelne belegte Zeiten | `bookedSlots` | `'2026-09-10': ['08:00-09:00', '18:00']` |
| Tage mit laufender Urlaubsbetreuung | `bookedDays` | `['2026-10-02','2026-10-03']` |
| Vorlaufzeit | `leadTimeHours` | `12` |
| Weg zum nächsten Tier | `bufferMinutes` | `15` |
| Leistungen, Dauer, Preise | `services` | Reihenfolge = Reihenfolge auf der Seite |
| Auswahl „Rhythmus“ / „Schlüssel“ | `visitsPerDay`, `keyOptions` | frei erweiterbar |

`bookedDays` ist der wichtige Eintrag: Wer über mehrere Tage bei einem Tier
ist, kann daneben keine Besuche annehmen. Diese Tage fallen im Kalender
komplett heraus.

### Später automatisch

Sollen Anfragen von selbst ankommen, genügt eine URL in `formEndpoint`
(Formspree, Basin, eigenes Skript). Die Anfrage geht dann zusätzlich als JSON
dorthin; WhatsApp und E-Mail bleiben bestehen.

## Vor dem Livegang

| Stelle | offen | gebraucht wird |
|---|---|---|
| `booking-config.js` → `services` | Preise 15 € / 22 € / 14 € / 45 € / 55 € | bestätigte Preise — Preisangaben müssen stimmen |
| `booking-config.js` → `visitHours` | 7–21 Uhr, Wochenende 8–20 Uhr | die tatsächlichen Zeiten |
| `index.html` Kontakt | Tabelle „Besuchszeiten“ | muss zu `visitHours` passen |
| `booking-config.js` → `contact.area` | „Stuttgart und Umgebung“ | Grenzen des Gebiets bestätigen — dieselbe Angabe steht im Hero, im FAQ und im Kontaktteil |
| `impressum.html` | Abschnitt „Umsatzsteuer“ | USt-IdNr. **oder** Hinweis auf § 19 UStG |
| `datenschutz.html` | Hoster, Speicherdauer der Logfiles | Angaben des gewählten Hosters |

**Noch zu klären, dann ergänzen:** eine Tierbetreuer-Haftpflicht. Solange keine
besteht, steht auf der Seite bewusst nichts dazu — eine Versicherung zu
behaupten, die es nicht gibt, wäre der teuerste Fehler auf dieser Seite. Sobald
sie abgeschlossen ist, gehört ein Satz in die Fragen-Liste.

**Gewerbe:** Tierbetreuung gegen Entgelt ist in der Regel ein Gewerbe; je nach
Umfang kann zusätzlich eine Erlaubnis nach § 11 TierSchG nötig werden (das
betrifft vor allem Betreuung in eigenen Räumen). Das gehört vor den Livegang
mit Gewerbeamt und Veterinäramt geklärt.

## Betriebssitz und Einsatzgebiet

Die Anschrift in Impressum, Datenschutzerklärung und `booking-config.js`
(Berliner Straße 13, Remseck am Neckar) ist der Sitz — dort muss die
ladungsfähige Adresse stehen. Das Einsatzgebiet ist davon unabhängig und
lautet Stuttgart und Umgebung; genannt werden das Stadtgebiet sowie Fellbach,
Waiblingen, Kornwestheim, Ludwigsburg und Remseck. Wird das Gebiet enger oder
weiter, sind es drei Stellen: `contact.area`, die Antwort „Wo sind Sie
unterwegs?“ im FAQ und der Kontaktabschnitt.

## Bilder

| Datei | wo | Ausschnitt |
|---|---|---|
| `veronika-hund.jpg` | Titelbild neben der Hauptüberschrift | 4:5, fasst Gesicht und Hund |
| `katze-snack.jpg` | Tagesplan, linke Spalte | 4:5 |
| `veronika.jpg` | Über mich | Hochformat |

Alle drei sind auf 1120 × 1400 gerechnet und liegen bei rund 100 bis 200 KB.
Das Titelbild wird über `object-fit: cover` beschnitten: auf dem Handy schmaler
(3:4), am Rechner genau im Seitenverhältnis der Datei. Ein Austausch braucht
deshalb nur ein Bild im Hochformat, in dem oben und in der Mitte nichts
Wichtiges am Rand klebt.

### Video

`assets/video/ankommen.mp4` (H.264, 2,4 MB) und `ankommen.webm` (VP9, 1,6 MB)
zeigen dasselbe: den ersten Besuch eines Tages, 16 Sekunden, mit Ton. Beide
Fassungen stehen als `<source>` im HTML — Safari und iOS nehmen die MP4, ein
Chromium ohne H.264 die WebM. Das Standbild `assets/img/ankommen-poster.jpg`
ist der einzige Teil, der beim Seitenaufruf geladen wird: das Video hat
`preload="none"` und startet erst auf Tippen. Es liegt auf demselben Server,
also kein YouTube, kein Cookie, kein Fremdzugriff.

Ein neues Video ersetzt beide Dateien; die Kommandozeile dafür steht im
Commit, kurz gefasst: 30 Bilder pro Sekunde, 720 Pixel Breite, `-crf 28` für
H.264 und `-crf 40` für VP9. Das Standbild sollte ein Bild aus der Mitte sein,
in dem das Tier gut zu sehen ist.

Sobald Fotos betreuter Tiere dazukommen, ist der Tagesplan die passende Stelle —
pro Eintrag ein Bild neben dem Text. Vorher immer die Einwilligung der
Halterinnen und Halter einholen; so steht es auch in der Datenschutzerklärung.

## Gestaltung

Bewusst anders als der Lash-Auftritt derselben Person: Kiefergrün auf
Kreidepapier, Ocker als einziger Signalton, Aufbau wie ein Betreuungsjournal —
Zeitstempel, feine Linien, ein durchlaufender Tagesrhythmus statt Kacheln.

```css
--paper: #eef0e9;   /* Grundton */
--pine:  #16211b;   /* Schrift und dunkle Bänder */
--ocher: #b5722c;   /* Zeitstempel, Akzente, Pfote */
--sage:  #cdd6c4;   /* Linien, gestrichelte Wegspur im Hero */
```

Schriften: **Fraunces** (Überschriften) und **Karla** (Text), beide selbst
gehostet unter `assets/fonts/`. Kein Aufruf an Google Fonts, keine Cookies.
Ziffern stehen überall als Tabellenziffern (`tabular-nums`), damit Uhrzeiten
und Kalender sauber untereinander liegen.

Die Pfote ist ein `<symbol>` ganz oben im HTML und wird über `<use href="#paw">`
wiederverwendet — ein einziges Mal gezeichnet, überall gleich.

## Barrierefreiheit

Sprungmarke, sichtbarer Fokus, Beschriftungen an allen Feldern, Schrittwechsel
per `aria-live` angesagt, Kalender vollständig mit der Tastatur bedienbar. Bei
`prefers-reduced-motion` steht jede Bewegung still. Ohne JavaScript bleiben alle
Inhalte lesbar; nur die Anfragestrecke funktioniert dann nicht — Telefonnummer
und E-Mail stehen deshalb zusätzlich im Kontaktteil und in der Fusszeile.
