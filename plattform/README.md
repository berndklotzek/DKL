# Fellpaten GmbH — Studierende betreuen Ihr Tier

Auftritt einer Vermittlungsplattform nach dem Vorbild von Alltagshilfe-Diensten
wie JUHI, übertragen auf Tierbetreuung: Studierende auf Minijob-Basis führen
Hunde aus, versorgen Katzen und betreuen im Urlaub. Die Plattform prüft,
vermittelt, stellt an, versichert und rechnet ab. Zwei Zielgruppen, zwei
Seiten.

```
plattform/
├── index.html                    Startseite: Modell, Preise, Team, Sicherheit, Video, Anfrage
├── hundesitter-stuttgart.html    Landingpage „Hundesitter Stuttgart“
├── gassi-service-stuttgart.html  Landingpage „Gassi-Service Stuttgart“
├── katzensitter-stuttgart.html   Landingpage „Katzensitter Stuttgart“
├── urlaubsbetreuung-stuttgart.html  Landingpage „Urlaubsbetreuung Stuttgart“
├── studierende.html              Studierende: Vorteile, Minijob erklärt, Bewerbung (JobPosting)
├── impressum.html                Fellpaten GmbH, HRB und USt-IdNr. noch offen
├── datenschutz.html              Anfragen, Bewerbungen, Führungszeugnis, Weitergabe
├── sitemap.xml, robots.txt       für Suchmaschinen
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

## Name und Domain

**Fellpaten** — Fell für Hund und Katze, Paten für die feste Person, die
bleibt. Die Studierenden heißen auf der Seite durchgehend *Pfotenpatin* und
*Pfotenpate*; das ist das Vokabular der Marke.

Stand der DNS-Prüfung am 6. September 2026 (nur ein Hinweis — verbindlich ist
die Abfrage beim Registrar):

| Domain | Befund |
|---|---|
| **fellpaten.de** | keine Auflösung — vermutlich frei, **sofort sichern** |
| fellpaten.com, fellpate.de | keine Auflösung — als Schutz mitnehmen |
| pfotenpaten.de, pfotenpate.de, pfotenpaten.net | vergeben |
| pfotenzeit.de, pfotenfreunde.de, gassifreunde.de, fellfreunde.de | vergeben |

Alternative, falls Fellpaten nicht gefällt: **Pfotenpaten** ist das schönere
Wort, aber „Pfotenpate“ ist ein gängiger Begriff für Tierheim-Patenschaften,
die .de ist weg, und der Verwechslungsschutz wäre schwächer. Für beide Namen
vor der Anmeldung eine Markenrecherche beim DPMA machen.

Umbenennen ist ein Einzeiler, weil der Name nur als Text vorkommt:

```bash
grep -rl 'Fellpaten' plattform/ | xargs sed -i 's/Fellpaten/NeuerName/g; s/fellpaten\.de/neuedomain.de/g'
```

## SEO — was eingebaut ist

* **Eine Landingpage je Suchintention**: Hundesitter Stuttgart, Gassi-Service
  Stuttgart, Katzensitter Stuttgart, Urlaubsbetreuung Stuttgart — jeweils mit
  eigenem Text, Preis, Leistungsumfang, Stadtteilliste und fünf eigenen Fragen.
  Keine Textbausteine zwischen den Seiten; Google straft nahezu gleiche Seiten ab.
* **Seitentitel mit Suchbegriff vorn** („Hundesitter Stuttgart — …“), Beschreibung
  mit Preis und Nutzen, eine H1 je Seite, Zwischenüberschriften mit Begriff.
* **Strukturierte Daten** (JSON-LD): `Organization` mit beiden Geschäftsführern,
  `WebSite`, `LocalBusiness` mit `makesOffer` und Preisen, `Service` je
  Landingpage, `FAQPage` auf jeder Seite mit Fragen, `BreadcrumbList`,
  `JobPosting` auf der Studierendenseite — damit erscheint der Minijob bei
  Google for Jobs.
* **Canonical, Open Graph, Twitter Card, geo-Meta**, `sitemap.xml` mit
  Bildangabe, `robots.txt`. Impressum und Datenschutz tragen `noindex`.
* **Interne Verlinkung**: Menü und Fußzeile führen auf alle Landingpages,
  jede Landingpage verweist auf die drei anderen und auf die Anfrage.
* **Technik**: keine externen Requests, selbst gehostete Schriften mit
  `preload`, Bilder mit Breite/Höhe und `lazy`, Video ohne Vorabladen —
  Core Web Vitals sind damit unkritisch.

**Nach dem Livegang** (nicht in der Datei machbar): Domain in
`https://www.fellpaten.de/` ist als Canonical und in der Sitemap
eingetragen — bei anderer Domain überall ersetzen (siehe sed oben). Dann:
Google Search Console anmelden und Sitemap einreichen, Google-Unternehmensprofil
für „Fellpaten GmbH“ anlegen (Kategorie Tierbetreuung, Einsatzgebiet
Stuttgart), Bing Webmaster Tools, ein paar Einträge in lokalen Verzeichnissen
(Hochschul-Jobbörsen für die Studierendenseite!). Rezensionen im
Unternehmensprofil sind danach der stärkste Hebel — nach jeder gelungenen
Urlaubsbetreuung darum bitten.

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
| Impressum | HRB-Nummer nach Eintragung, USt-IdNr. nach Erteilung, Sitz der GmbH laut Gesellschaftsvertrag (derzeit Berliner Straße 13, Remseck) |
| Datenschutz | Hoster und Speicherdauer |
| Name „Fellpaten“, Domain | Registrar und DPMA prüfen, dann eintragen |
| Rollen der Geschäftsführung | Veronika: Betreuung/Einarbeitung, Daniel: Organisation/Abrechnung — so steht es im Team-Abschnitt; mit beiden abstimmen |

Zur GmbH: Sie braucht 25.000 € Stammkapital (12.500 € bei Gründung eingezahlt),
notariellen Gesellschaftsvertrag, Handelsregistereintrag — erst dann darf
„GmbH“ auf der Seite stehen. Bis zur Eintragung heißt es „in Gründung“
(GmbH i. G.). Wer Studierende anstellt und zu Kunden schickt, ist Arbeitgeber
mit allen Pflichten. Für gewerbliche Tierbetreuung kann zusätzlich eine
Erlaubnis nach § 11 TierSchG nötig sein. Beides vor dem Start mit Steuerberatung
und Gewerbeamt klären.

## Kontakt in der Startphase

Anfragen und Bewerbungen laufen bei Veronika auf (E-Mail, WhatsApp). Später
auf Firmenadressen umstellen (hallo@fellpaten.de): `contact` in `config.js`
sowie die Angaben im Kontaktabschnitt, in den strukturierten Daten, im
Impressum und in der Datenschutzerklärung.
