# Veronika Yovenko — Lash Lifting

Statische Website mit Terminanfrage. Kein Build, kein Framework, keine
Abhängigkeiten: HTML, CSS und drei kleine JavaScript-Dateien.

```
veronika/
├── index.html                    Startseite (Hero, Leistungen, Galerie, Über mich,
│                                 Ablauf, Terminbuchung, FAQ, Kontakt)
├── impressum.html                Pflichtangaben — Platzhalter ausfüllen
├── datenschutz.html              Datenschutzerklärung — Platzhalter ausfüllen
└── assets/
    ├── css/style.css             alle Farben, Schriften und Abstände in :root
    ├── fonts/                    Cormorant Garamond + Jost, selbst gehostet
    ├── img/                      Porträt und Behandlungsfotos aus dem Portfolio
    └── js/
        ├── booking-config.js     ← hier pflegt Veronika alles selbst
        ├── booking.js            Kalender, freie Zeiten, Anfrage
        └── site.js               Menü, Galerie, Einblenden
```

Lokal ansehen:

```bash
python3 -m http.server 8000     # dann http://localhost:8000/veronika/ öffnen
```

Hochladen: den Ordner `veronika/` auf einen beliebigen Webspace kopieren.
Es braucht keinen Server mit PHP, Node oder Datenbank.

## Terminbuchung

Der Ablauf hat drei Schritte: **Leistung → Tag und Uhrzeit → Kontaktdaten**.
Angeboten werden nur Zeiten, die zu den Öffnungszeiten passen, nicht belegt
sind und weit genug in der Zukunft liegen. Zum Schluss stellt die Seite die
Anfrage als fertigen Text zusammen; die Kundin schickt ihn per **WhatsApp**
oder **E-Mail** ab und kann sich den Termin als **.ics-Datei** in den eigenen
Kalender legen.

Wichtig zu wissen: Eine statische Seite kann keine Termine verwalten. Die
Anfrage ist deshalb ausdrücklich eine *Anfrage* — verbindlich wird sie erst mit
Veronikas Antwort. Genau so steht es auch auf der Seite.

### Freie Zeiten pflegen

Alles in `assets/js/booking-config.js`:

| Was | Wo | Beispiel |
|---|---|---|
| Öffnungszeiten | `openingHours` | `2: [['10:00','19:00']]` = Dienstag 10–19 Uhr |
| Mittagspause | `openingHours` | `[['10:00','13:00'], ['14:00','19:00']]` |
| Urlaub, freie Tage | `closedDates` | `['2026-12-24', '2026-12-25']` |
| vergebene Termine | `bookedSlots` | `'2026-09-10': ['14:00-16:00', '17:30']` |
| Vorlaufzeit | `leadTimeHours` | `24` — vorher ist keine Anfrage möglich |
| Puffer nach der Behandlung | `bufferMinutes` | `15` |
| Leistungen, Dauer, Preise | `services` | Reihenfolge = Reihenfolge auf der Seite |

Ein Eintrag in `bookedSlots` mit Bindestrich (`'14:00-16:00'`) sperrt alles,
was sich mit diesem Zeitraum überschneidet. Eine einzelne Uhrzeit (`'17:30'`)
sperrt nur dieses eine Raster-Feld.

Tage ohne freie Zeit werden im Kalender automatisch grau und lassen sich nicht
anklicken — es ist also nicht möglich, versehentlich eine belegte Zeit
anzufragen.

### Später mit echtem Kalender

Wenn die Termine irgendwann automatisch ankommen sollen, genügt eine URL in
`formEndpoint` (Formspree, Basin, eigenes Skript, Zapier-Webhook). Die Anfrage
wird dann zusätzlich als JSON dorthin geschickt; WhatsApp und E-Mail bleiben als
Weg bestehen. Der Rest der Seite bleibt unverändert.

## Vor dem Livegang eintragen

| Stelle | Platzhalter | gebraucht wird |
|---|---|---|
| `index.html` Kontakt, `impressum.html`, `datenschutz.html` | `[Straße Hausnummer]`, `[PLZ Ort]` | die echte Studioadresse |
| `booking-config.js` → `contact.studio` | dieselben Platzhalter | Adresse für die Kalenderdatei |
| `impressum.html` | Abschnitt „Umsatzsteuer“ | USt-IdNr. **oder** Hinweis auf § 19 UStG (Kleinunternehmerin) |
| `datenschutz.html` | `[Name und Anschrift des Hosters]`, `[Speicherdauer]` | Angaben des gewählten Hosters |
| `booking-config.js` → `services` | Preise `ab 45 €` … | bestätigte Preise; Preisangaben müssen stimmen |
| `booking-config.js` → `openingHours` | Di–Fr 10–19, Sa 10–16 | die tatsächlichen Zeiten |
| `index.html` Abschnitt Kontakt | dieselbe Tabelle „Öffnungszeiten“ | muss zu `openingHours` passen |
| `index.html` | `2 Jahre`, `6–8 Wochen` | Angaben bestätigen |

Telefonnummer, E-Mail-Adresse und Instagram-Name stammen aus dem Portfolio.
Die WhatsApp-Schaltfläche nutzt dieselbe Nummer (`contact.whatsapp`) — falls
dort kein WhatsApp läuft, den Knopf in `index.html` entfernen.

**Ohne Impressum und Datenschutzerklärung sollte die Seite nicht online gehen.**
Beide Seiten sind vollständig angelegt, aber die markierten Stellen müssen
ausgefüllt werden; die Texte ersetzen keine Rechtsberatung.

## Gestaltung

Ein einziger heller Auftritt: warmes Elfenbein, Tinte, gebranntes Gold. Alle
Werte stehen oben in `assets/css/style.css` unter `:root`:

```css
--ivory:  #f7f3ed;   /* Grundton */
--ink:    #1b1512;   /* Schrift, dunkle Bänder */
--gold:   #a9814f;   /* Akzent: Kursive, Kennzahlen, Zierlinien */
--track:  .26em;     /* Laufweite der Versalien-Kleinschrift */
```

Wiederkehrend ist die Klasse `.caps`: kleine Versalien mit weiter Laufweite,
in Eyebrow, Knöpfen, Kennzahlen und Fusszeile. Überschriften stehen in
Cormorant Garamond, das betonte Wort jeweils kursiv in Gold.

### Schriften

Cormorant Garamond und Jost liegen als variable woff2-Dateien unter
`assets/fonts/` und werden per `@font-face` eingebunden. Es gibt **keinen**
Aufruf an Google Fonts — das Einbinden per Verweis überträgt die IP-Adresse der
Besucherinnen an Google, was deutsche Gerichte als DSGVO-Verstoss gewertet
haben (LG München I, 3 O 17493/20).

### Bilder

Porträt und Behandlungsfotos stammen aus Veronikas Portfolio-PDF, gedreht und
auf Webgrösse gerechnet (längste Kante 1400 px, ~1,5 MB insgesamt). Neue Bilder
einfach in `assets/img/` ablegen und in der Galerie in `index.html` ergänzen —
`width` und `height` mit angeben, sonst springt das Layout beim Laden.

Vor der Veröffentlichung weiterer Behandlungsfotos: Einwilligung der
abgebildeten Person einholen (steht so auch in der Datenschutzerklärung).

## Barrierefreiheit und Verhalten ohne JavaScript

* Sprungmarke zum Inhalt, sichtbarer Fokusrahmen, Beschriftungen an allen
  Formularfeldern, Schrittwechsel werden über `aria-live` angesagt.
* Galerie und Lightbox lassen sich mit Tastatur bedienen (Pfeiltasten, Esc).
* Bei `prefers-reduced-motion` stehen alle Bewegungen still.
* Ohne JavaScript bleiben alle Inhalte lesbar; nur die Buchungsstrecke
  funktioniert nicht — Telefonnummer und E-Mail-Adresse stehen deshalb
  zusätzlich im Kontaktabschnitt und in der Fusszeile.

## Nächste Ausbaustufen

* Zweite Sprachfassung (Russisch/Ukrainisch), aufgebaut wie bei einer
  parallelen Textführung im HTML mit `lang`-Attributen.
* Vorher-Nachher-Vergleich mit Schieberegler in der Galerie.
* Gutscheine als eigene Leistung in `services`.
