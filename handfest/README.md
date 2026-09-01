# HANDFEST — Vermittlungsportal Schule ↔ Handwerk

Prototyp eines Portals, das Schülerinnen und Schüler an Handwerksbetriebe in
ihrer Region vermittelt. Leitgedanke der ganzen Seite: **ein Beruf, dessen Kern
sich nicht automatisieren lässt.**

## Aufbau

```
index.html                  Komplette Seite (Hero, Zukunfts-Index, Talent-Check,
                            Betriebe, Ablauf, Schulen & Betriebe, FAQ)
assets/css/style.css        Styles; alle Farben/Typo als CSS-Variablen in :root
assets/js/data.js           Inhalte: Berufe, Betriebe, Fragen, Indexwerte
assets/js/app.js            Logik: Matching, Filter, Detailpanel, Diagramm
tools/einzeldatei.py        Optional: baut alles zu einer HTML-Datei zusammen
```

Kein Build, kein Framework, keine Abhängigkeiten außer den Webfonts. Lokal
testen:

```bash
python3 -m http.server 8000   # dann http://localhost:8000/handfest/ öffnen
```

Einzeldatei zum Weitergeben (Mailanhang, Präsentation):

```bash
python3 tools/einzeldatei.py            # handfest-einzeldatei.html
python3 tools/einzeldatei.py --fragment out.html   # ohne <html>/<head>-Gerüst
```

## Die drei Bausteine

**Zukunfts-Index.** Ein eigenes Modell, das Tätigkeiten auf einer Skala von 0 bis
100 danach bewertet, wie schlecht sich ihr Kern automatisieren lässt. Fünf
Kriterien: wechselnde Arbeitsumgebung, Anteil an Hand- und Körperarbeit vor Ort,
Verantwortung/Abnahme, Beratungsanteil, Fehlerkosten. Die Kriterien stehen offen
auf der Seite, damit dem Wert widersprochen werden kann — er ist ausdrücklich
keine amtliche Statistik und wird auf der Seite auch so ausgewiesen.

**Talent-Check.** Neun Fragen erzeugen ein Profil über sieben Merkmale
(Handgeschick, Technikverständnis, wechselnde Orte, Kundenkontakt, Gestalten,
Präzision, körperlicher Einsatz). Verglichen wird per Pearson-Korrelation mit
dem Anforderungsprofil jedes Berufs; angezeigt werden Passung in Prozent und die
beiden Merkmale, die den Ausschlag gegeben haben — beide müssen auf beiden
Seiten überdurchschnittlich sein, sonst würde eine gemeinsame *Schwäche* als
Begründung erscheinen. Alles läuft im Browser, nichts wird gesendet oder
gespeichert.

**Betriebsvergleich.** Jeder Betrieb zeigt vorab, was sonst erst im Gespräch
kommt: Vergütung im ersten Lehrjahr, Übernahmequote, freie Plätze, konkrete
Ausbildungsinhalte. Filter nach Gewerk, Umkreis, Ausbildungsstart; Sortierung
nach Passung, Entfernung, Vergütung oder Übernahmequote.

## Slogans im Hero

Die Überschrift wechselt alle 5,2 Sekunden durch sechs Sätze. Sie stehen
vollständig im Markup (`h1.slogans`), jedes Wort in einem eigenen
`<span class="w">` — daraus entsteht die gestaffelte Einlauf-Animation, und
ohne JavaScript bleibt der erste Slogan einfach stehen. Das Akzentwort trägt
zusätzlich `accent`.

```html
<span class="slogan">
  <span class="w">Kein</span>
  <span class="w">Update</span>
  <span class="w">ersetzt</span>
  <span class="w">einen</span>
  <span class="w accent">Meisterbrief.</span>
</span>
```

Alle Slogans liegen in derselben Rasterzelle, die Höhe richtet sich nach dem
längsten — beim Wechsel springt also nichts. Damit darunter keine Lücke
entsteht, sind die sechs Sätze so gefasst, dass sie in jeder Fensterbreite
gleich viele Zeilen brauchen: **beim Ergänzen eines Slogans die Länge der
vorhandenen treffen** (rund 32–39 Zeichen) und einen Knopf in der Skala
darunter mitanlegen.

Die Skala unter der Überschrift ist gleichzeitig Fortschrittsanzeige und
Bedienelement: der orangefarbene Strich läuft über die Standzeit voll, jeder
Strich springt per Klick zum zugehörigen Slogan. Bei Mauszeiger oder Tastatur­
fokus im Hero hält der Wechsel an; bei `prefers-reduced-motion` läuft er gar
nicht erst von allein, die Striche bleiben als manuelle Bedienung.

## Geschäftsmodell (Entwurf)

| Seite | Preis | Begründung |
|---|---|---|
| Schülerinnen und Schüler | 0 € | Reichweite ist die Ware |
| Schulen | 0 € | Klassencode + Auswertung; Schulen bringen die Nutzer mit |
| Betriebe | 690 € je unterschriebenem Ausbildungsvertrag | Kein Abo — der Betrieb zahlt für das Ergebnis, nicht für eine Anzeige |

Ergänzend denkbar: Jahrespauschalen über Innungen und Kammern, damit kleine
Betriebe nicht einzeln akquiriert werden müssen.

## Datenlage

**Sämtliche Betriebe, Ortsnamen, Zitate und Kennzahlen in `data.js` sind
erfunden** und dienen nur der Veranschaulichung. Ein Hinweisband oben auf der
Seite und ein Vermerk in der Fußzeile sagen das auch den Besuchern. Die
Vergütungsangaben sind grobe Richtwerte und ersetzen keine Tarifauskunft.

## Design anpassen

Farben, Schriften, Radien und Maximalbreite liegen als Variablen in `:root`
(und dreifach gespiegelt für Dunkelmodus: Systemeinstellung und ausdrückliche
Wahl). Hausfarbe wechseln ist eine Zeile:

```css
--signal: #E2611A;   /* Akzent */
--blue:   #0E2A3E;   /* Blaupausen-Flächen: Hero, Fußzeile, Panel-Kopf */
```

Die beiden Datenreihenfarben (`--series-1`, `--series-2`) sind auf
Farbfehlsichtigkeit geprüft (ΔE ≈ 20 bei Protanopie, Kontrast ≥ 3:1 gegen die
Diagrammfläche) — beim Ändern bitte nachprüfen.

## Noch offen

| Stelle | Platzhalter | gebraucht wird |
|---|---|---|
| Impressum | `noch einzutragen` | Telefon und E-Mail, Amtsgericht + HRB, USt-IdNr., redaktionell verantwortliche Person; Postleitzahl bestätigen |
| Fußzeile | Datenschutz, Barrierefreiheit | eigene Erklärungen |
| Panel-Buttons | Kurzmeldung statt Funktion | Bewerbungsstrecke mit Backend |
| Betriebe | erfundener Datensatz | Anbindung Lehrstellenbörse / Kammer-API |
| Schulbereich | nur beschrieben | Klassencode und Lehrkraft-Auswertung |

Das Impressum steht als Abschnitt `#impressum` in `index.html` — wie beim
Schwesterprojekt in derselben Datei, damit die Einzeldatei-Ausgabe keine toten
Verweise enthält. Firma und Geschäftsführer sind eingetragen; jede noch fehlende
Pflichtangabe trägt sichtbar die Marke `noch einzutragen` und im Markup ein
`TODO`, damit nichts unbemerkt ungefüllt online geht. Der Text ist eine
Arbeitsfassung und ersetzt keine rechtliche Prüfung.
