# fello — Studierende betreuen Ihr Tier

Auftritt einer Vermittlungsplattform nach dem Vorbild von Alltagshilfe-Diensten
wie JUHI, übertragen auf Tierbetreuung: Studierende auf Minijob-Basis führen
Hunde aus, versorgen Katzen und betreuen im Urlaub. Die Plattform prüft,
vermittelt, stellt an, versichert und rechnet ab. Zwei Zielgruppen, zwei
Seiten.

```
plattform/
├── index.html                Tierhalter: Modell, Preise, Sicherheit, Video, Anfrage
├── studierende.html          Studierende: Vorteile, Minijob erklärt, Ablauf, Bewerbung
├── impressum.html            Betreiber noch offen
├── datenschutz.html          Anfragen, Bewerbungen, Führungszeugnis, Weitergabe
└── assets/
    ├── css/style.css         Ultramarin auf Knochenweiss, Koralle als Signalton
    ├── fonts/                Familjen Grotesk + Instrument Sans, selbst gehostet
    ├── img/, video/          dieselben Aufnahmen wie unter tierbetreuung/
    └── js/
        ├── config.js         ← Name, Preise, Stadt, Zeitfenster, Kontakt
        ├── request.js        Anfrage in vier Schritten (Tierhalter)
        ├── apply.js          Bewerbung (Studierende)
        └── site.js           Menü, Einblenden
```

Lokal: `python3 -m http.server 8000`, dann `http://localhost:8000/plattform/`.
Kein Build, kein Framework.

## Das Modell, wie es auf der Seite steht

| | |
|---|---|
| Kundin zahlt | 19 € je Stunde, 11 € je halbe Stunde, 22 € je Urlaubstag — inkl. Versicherung, Abrechnung, Vertretung |
| Studierende erhalten | 14 € je Stunde (Mindestlohn 2026: 13,90 €) |
| Plattform behält | 5 € je Stunde für Versicherung, Abrechnung, Vertretung, Vermittlung |
| Beschäftigung | Minijob bei der Plattform, Grenze 2026: 603 € im Monat |
| Prüfung | Gespräch → erweitertes Führungszeugnis → Probeeinsatz zu zweit → Kennenlernen bei der Familie |
| Betreuung | eine feste Person je Tier, Vertretung nur angekündigt, Foto nach jedem Besuch |

Alle Zahlen stehen in `assets/js/config.js` **und** als Text in den HTML-Dateien.
Ändert sich ein Preis, sind beide Stellen zu ändern — die Seite hat keinen
Templating-Schritt. Die Suche nach `19 €`, `14 €`, `603` und `13,90` findet alle
Vorkommen.

## Anfrage und Bewerbung

Beides läuft ohne Server: Die Seite stellt am Ende einen Text zusammen, der
per WhatsApp oder E-Mail abgeschickt wird. Wer später einen Formular-Dienst
oder ein eigenes Backend hat, trägt die URL in `formEndpoint` ein — dann geht
jede Anfrage und Bewerbung zusätzlich als JSON dorthin (`type: 'request'` bzw.
`type: 'application'`).

Anders als bei einer einzelnen Betreuerin gibt es keinen Kalender mit freien
Zeiten: Die Plattform sucht nach der Anfrage die passende Person. Gefragt wird
deshalb nach **Wunschzeiten**: einmalig (Tag + Zeitfenster), regelmäßig
(Wochentage + Zeitfenster + Start) oder als Zeitraum (Urlaub).

## Was diese Seite nicht ist

Ein Auftritt, kein Betriebssystem. Für den Betrieb fehlen — bewusst, weil sie
Server, Konten und Verträge brauchen:

* Konten für Halter und Studierende, Einsatzplanung, Wochenübersicht
* Abrechnung, SEPA-Lastschrift, Lohnabrechnung, Meldung an die Minijob-Zentrale
* Foto-Versand nach dem Besuch (läuft in der Startphase über WhatsApp)

Sinnvolle nächste Stufe: ein kleines Backend (Formular-Endpunkt, Datenbank,
Wochenplan als geteiltes Dokument) — erst wenn mehr als eine Handvoll Familien
und Studierende dabei sind.

## Vor dem Livegang — und zwar wirklich vorher

Diese Seite beschreibt ein Modell, das es erst geben muss. Sie behauptet Dinge,
die vor dem ersten Kunden wahr sein müssen:

| Behauptung auf der Seite | was dafür da sein muss |
|---|---|
| „angestellt über fello, Minijob“ | Betreiber mit Betriebsnummer, Anmeldung bei der Minijob-Zentrale, Arbeitsverträge, Lohnabrechnung |
| „haftpflichtversichert“ | Betriebshaftpflicht mit Tierhüter-Risiko und Schlüsselverlust; **ohne Police diesen Satz entfernen** |
| „unfallversichert“ | gesetzliche Unfallversicherung über die Berufsgenossenschaft (folgt aus der Anstellung) |
| „erweitertes Führungszeugnis Pflicht“ | Bescheinigung des Betreibers für den Antrag der Studierenden |
| Preise und Lohn | Kalkulation prüfen: 5 € Marge je Stunde muss Versicherung, Lohnnebenkosten (Pauschalen ca. 30 % beim Minijob!) und Ausfall decken — **das ist knapp** |
| Minijob-Grenze, Mindestlohn | jährlich prüfen (Grenze folgt dem Mindestlohn) |
| Impressum, Datenschutz | Betreiber, Rechtsform, Anschrift, Hoster |
| Name „fello“ | Arbeitstitel — Marke und Domain prüfen |
| Veronikas Rolle | „arbeitet jede neue Kraft ein“ ist eine Annahme aus dem Konzept — mit ihr abstimmen |

Zur Rechtsform: Wer Studierende anstellt und zu Kunden schickt, ist Arbeitgeber
mit allen Pflichten. Für gewerbliche Tierbetreuung kann zusätzlich eine
Erlaubnis nach § 11 TierSchG nötig sein. Beides vor dem Start mit Steuerberatung
und Gewerbeamt klären.

## Kontakt in der Startphase

Anfragen und Bewerbungen laufen bei Veronika auf (E-Mail, WhatsApp). Später
auf Plattform-Adressen umstellen: `contact` in `config.js` sowie die Angaben
im Kontaktabschnitt, im Impressum und in der Datenschutzerklärung.
