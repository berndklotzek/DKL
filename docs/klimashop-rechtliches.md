# Klimageräte per Dropshipping verkaufen — was vorher geklärt sein muss

Diese Liste gehört zum Shop in `klimaanlagen/`. Sie ist keine Rechtsberatung,
sondern eine Aufstellung der Punkte, an denen Händler in genau diesem Geschäft
regelmässig scheitern. Der Grund, warum das hier so ausführlich steht: Bei
Klimageräten treffen vier Regelungsbereiche zusammen — Produktsicherheit,
Kältemittelrecht, Elektroaltgeräte und Energiekennzeichnung. Wer aus China
importiert, ist für alle vier selbst verantwortlich.

Lassen Sie die Punkte 1 bis 6a von einer auf IT- und Produktrecht spezialisierten
Kanzlei prüfen, bevor Sie das erste Gerät verkaufen. Das kostet einen niedrigen
vierstelligen Betrag und ist deutlich günstiger als die erste Abmahnung.

---

## 1. Sie sind Importeur, nicht nur Händler

Sobald Sie Ware aus einem Nicht-EU-Land in die EU einführen und unter eigenem
Namen verkaufen, gelten Sie als **Importeur**. Damit übernehmen Sie im
Wesentlichen die Pflichten des Herstellers:

- CE-Kennzeichnung und **EU-Konformitätserklärung** in Ihren Unterlagen
- technische Dokumentation, zehn Jahre aufzubewahren
- Ihr Name und Ihre Anschrift auf dem Gerät oder der Verpackung
- Bedienungs- und Sicherheitshinweise in deutscher Sprache
- Stichprobenprüfung, Beschwerderegister, Rückrufmanagement

Ein Lieferant, der Ihnen keine vollständige Konformitätserklärung mit
Prüfberichten einer benannten Stelle liefert, ist kein Lieferant, sondern ein
Haftungsrisiko. Betroffene Richtlinien bei Klimageräten: Niederspannung, EMV,
Funkanlagen (RED, wegen WLAN), Druckgeräte je nach Bauart, Ökodesign.

**Direktversand aus China an den Endkunden ist bei diesen Produkten keine gute
Idee.** Dann wird nämlich Ihr Kunde zum Zollanmelder, muss Einfuhrumsatzsteuer
zahlen und steht im Zweifel ohne deutsche Anleitung da. Genau deshalb ist die
Website auf ein **EU-Lager** ausgelegt: vorab importieren, korrekt verzollen,
einlagern, aus der EU versenden. Das bindet Kapital, ist aber der einzige Weg,
der die zugesagte Lieferzeit von drei bis fünf Werktagen und die Pflichten aus
diesem Dokument zusammenbringt.

## 2. Produktsicherheitsverordnung (GPSR)

Die Verordnung (EU) 2023/988 gilt seit Dezember 2024 unmittelbar. Für den Shop
bedeutet das:

- Es muss eine **verantwortliche Person in der EU** geben. Als Importeur sind
  Sie das selbst.
- In **jedem Angebot** müssen Name und Kontaktdaten des Herstellers sowie der
  verantwortlichen Person stehen, dazu Angaben zur Produktidentifikation
  (Modell, Charge) und Warnhinweise in deutscher Sprache.
- Gefährliche Produkte sind über das Safety Business Gateway zu melden.

Im Shop ist dafür noch kein Feld vorgesehen. Ergänzen Sie in `src/products.json`
je Gerät ein Feld `hersteller` und geben Sie es auf der Produktseite aus.

## 3. Kältemittel: F-Gase-Verordnung

Massgeblich ist die **Verordnung (EU) 2024/573**, die seit März 2024 an die
Stelle der Verordnung 517/2014 getreten ist, zusammen mit der deutschen
Chemikalien-Klimaschutzverordnung.

- Arbeiten am Kältekreis dürfen nur Personen mit **Sachkundenachweis**
  ausführen. Das betrifft die Installation klassischer Split-Anlagen.
- **Nicht** betroffen: hermetisch geschlossene Monoblock-Geräte, vorbefüllte
  Quick-Connect-Systeme und mobile Geräte. Das ist der Grund, warum diese drei
  Kategorien im Shop im Vordergrund stehen — sie sind die einzigen, die der
  Kunde legal selbst montieren darf.
- Anhang IV der Verordnung senkt die zulässigen GWP-Grenzen stufenweise.
  R410A (GWP 2.088) ist bei kleinen Splits bereits draussen, R32 (GWP 675) ist
  derzeit zulässig, fällt aber bei kleinen Split-Anlagen gegen Ende des
  Jahrzehnts unter eine strengere Grenze. **Prüfen Sie den genauen Stichtag im
  aktuellen Verordnungstext, bevor Sie eine grosse Menge R32-Geräte für mehrere
  Saisons einkaufen** — ein Lager voll nicht mehr verkehrsfähiger Ware ist der
  teuerste Fehler, den man in diesem Geschäft machen kann.
- Geräte mit R290 (Propan, GWP 3) sind langfristig unkritisch, unterliegen aber
  wegen der Brennbarkeit Mengenbegrenzungen und Transportvorschriften.

## 4. Elektroaltgeräte, Verpackungen, Batterien

Alle drei Registrierungen müssen **vor dem ersten Anbieten** vorliegen. Ein
Verstoss ist jeweils ein Vertriebsverbot und abmahnfähig.

| Bereich | Was zu tun ist |
|---|---|
| ElektroG | Registrierung bei der stiftung ear je Marke und Geräteart, Garantie für B2C-Geräte, WEEE-Nummer im Impressum, Rücknahmepflicht 1:1 |
| VerpackG | Registrierung im Verpackungsregister LUCID **und** Systembeteiligung bei einem dualen System, Mengenmeldung |
| BattG | Registrierung wegen der Batterien in den Fernbedienungen, Rücknahme, Hinweispflichten |

Die Nummern sind im Shop als Platzhalter hinterlegt in
`src/pages/recht-impressum.html` und `src/pages/recht-altgeraete.html`.

## 5. Energieverbrauchskennzeichnung

Raumklimageräte unter 12 kW sind kennzeichnungspflichtig. Im Onlinehandel heisst
das konkret:

- Das **Energielabel** muss im Angebot sichtbar sein — als Grafik, nicht nur als
  Buchstabe. Zulässig ist die verschachtelte Anzeige über einen Pfeil, der das
  Label beim Anklicken öffnet.
- Das **Produktdatenblatt** muss zugänglich sein.
- Als Importeur werden Sie zum „Lieferanten“ im Sinne der Rahmenverordnung und
  müssen die Geräte in der **EU-Produktdatenbank EPREL** registrieren. Ohne
  EPREL-Eintrag darf das Gerät nicht in Verkehr gebracht werden.

Der Shop zeigt derzeit die Effizienzklasse als farbige Kennzeichnung an
(`eek_block()` in `tools/build.py`). Die offizielle Labelgrafik und der
EPREL-Link je Gerät fehlen noch und müssen vor dem Livegang ergänzt werden.

## 6. Shop- und Verbraucherrecht

- **Impressum** nach § 5 DDG, vollständig. Häufigster Abmahngrund überhaupt.
- **Widerrufsbelehrung** mit Muster-Widerrufsformular. Bei Speditionsware müssen
  Sie die geschätzten Rücksendekosten beziffern — steht als Spanne im Entwurf,
  bitte an Ihre tatsächlichen Konditionen anpassen.
- **AGB** und **Datenschutzerklärung** anpassen. Die mitgelieferte
  Datenschutzerklärung beschreibt den Auslieferungszustand: rein statisch, keine
  Cookies, kein Tracking. Sobald Zahlungsanbieter, Analyse-Werkzeuge oder
  externe Schriftarten dazukommen, ist sie unvollständig — und Sie brauchen in
  der Regel eine Einwilligungslösung.
- **Preisangaben**: Alle Preise inklusive Mehrwertsteuer, Versandkosten
  gesondert. Ein durchgestrichener Preis muss erkennen lassen, worauf er sich
  bezieht. Im Shop sind das durchgängig **UVP-Angaben**. Wenn Sie stattdessen
  Ihren eigenen früheren Preis durchstreichen, gilt § 11 PAngV: anzugeben ist
  der niedrigste Preis der letzten 30 Tage. Die UVP muss zudem tatsächlich vom
  Hersteller stammen.
- **Lieferzeitangaben** müssen stimmen. „3–5 Werktage“ auf der Website und real
  fünf Wochen Seefracht ist Irreführung und der klassische Dropshipping-Fehler.
- **Bewertungen**: Erfundene oder gekaufte Bewertungen sind seit der
  Omnibus-Richtlinie ausdrücklich verboten. Der Shop zeigt deshalb bewusst keine
  Sterne, bis echte, überprüfbare Bewertungen vorliegen.

## 6a. Was das Einzelunternehmen konkret bedeutet

Der Shop läuft auf Daniel Klotzek, Am Danielsbrunnen 28, 69168 Wiesloch — ein
Einzelunternehmen, keine Kapitalgesellschaft.
Vier Punkte, die daraus folgen:

**Sie haften persönlich und unbeschränkt.** Das ist bei diesem Warenkorb kein
theoretischer Punkt. Wenn ein importiertes Klimagerät einen Wohnungsbrand
auslöst, haftet als Importeur nach dem Produkthaftungsgesetz zunächst das
Unternehmen — und beim Einzelunternehmen ist das Ihr gesamtes Privatvermögen,
einschliesslich Haus und Ersparnissen. Bei einer GmbH oder UG endet die Haftung
grundsätzlich beim Gesellschaftsvermögen.

Daraus folgen zwei Handlungsempfehlungen:

1. **Betriebshaftpflicht mit Produkthaftpflicht abschliessen**, ausdrücklich
   einschliesslich Importeurshaftung und Rückrufkosten. Ohne diese Police sollten
   Sie kein einziges Gerät verkaufen. Rechnen Sie mit einem niedrigen bis
   mittleren dreistelligen Betrag im Jahr — gegenüber dem Risiko ist das nichts.
2. **Wechsel in eine UG oder GmbH prüfen**, sobald das Geschäft läuft. Eine UG
   ist ab 1 € Stammkapital gründbar, kostet mit Notar und Handelsregister
   überschaubar wenig und begrenzt genau dieses Risiko. Für den Start als
   Einzelunternehmen zu beginnen ist völlig in Ordnung; dauerhaft Klimageräte
   zu importieren, ohne die Haftung zu begrenzen, ist es nicht.

**Kein Handelsregistereintrag nötig, aber eine Gewerbeanmeldung.** Das Gewerbe
wird beim Gewerbeamt der Gemeinde angemeldet, bevor der erste Verkauf läuft.
Daraus folgt automatisch die Pflichtmitgliedschaft in der IHK. Eine Eintragung
ins Handelsregister als eingetragener Kaufmann (e. K.) ist erst ab einem in
kaufmännischer Weise eingerichteten Geschäftsbetrieb erforderlich — bei
wachsendem Import kann das schneller eintreten, als man denkt.

**Im Impressum steht Ihr Name, nicht nur die Marke.** „ARKTIK Klimasysteme“ ist
eine Geschäftsbezeichnung, kein Firmenname im Rechtssinn. Impressum, AGB,
Widerrufsbelehrung und Rechnungen müssen Ihren bürgerlichen Namen tragen. So ist
es jetzt umgesetzt: „ARKTIK Klimasysteme, Inhaber Daniel Klotzek“.

**„Geschäftsführer“ ist der falsche Titel.** Den gibt es nur bei
Kapitalgesellschaften. Beim Einzelunternehmen heisst die Rolle **Inhaber**. Auf
Visitenkarten und in E-Mail-Signaturen ist die falsche Bezeichnung ein
Angriffspunkt, weil sie über die Rechtsform und damit über die Haftung täuscht.

**Kleinunternehmerregelung passt hier nicht.** Nach § 19 UStG könnten Sie
unterhalb der Umsatzgrenze auf den Ausweis der Umsatzsteuer verzichten — dann
dürfen Sie aber auch keine Vorsteuer ziehen. Bei einem Import zahlen Sie
Einfuhrumsatzsteuer auf den gesamten Wareneinsatz und blieben darauf sitzen. Für
dieses Geschäftsmodell ist die Regelbesteuerung fast sicher richtig; die Website
weist entsprechend „inkl. 19 % MwSt.“ aus. Klären Sie das mit dem Steuerbüro,
bevor die erste Rechnung rausgeht.

## 7. Steuern

- Umsatzsteuerliche Registrierung in Deutschland, Regelbesteuerung.
- Bei Verkäufen in andere EU-Länder gilt ab 10.000 € Jahresumsatz das
  Bestimmungslandprinzip. Praktikabel über das **OSS-Verfahren**.
- Beim Import: Einfuhrumsatzsteuer und Zoll auf die Ware. Zolltarifnummer je
  Gerätetyp vorab klären, der Satz unterscheidet sich zwischen mobilen Geräten
  und Split-Anlagen.
- Anti-Dumping-Zölle prüfen — für einzelne Warengruppen aus China existieren
  zusätzliche Abgaben.

## 8. Kaufmännische Punkte, die kein Gesetz regelt

- **Saisonalität.** Der Umsatz konzentriert sich auf Mai bis August. Die Ware
  muss im Februar bezahlt und eingelagert sein. Wer im Juni bestellt, verkauft
  im September.
- **Retouren.** Ein zurückgesendetes Aussengerät ist oft ein Totalschaden auf
  der Palette. Kalkulieren Sie 3 bis 6 Prozent Retourenquote mit Wertverlust.
- **Gewährleistungsfälle** kommen bei Klimageräten spät — meist im zweiten
  Sommer. Rücklagen bilden und Ersatzteilversorgung beim Lieferanten
  vertraglich absichern.
- **Montagevermittlung.** Der Shop verspricht die Vermittlung von
  Partnerbetrieben. Bauen Sie dieses Netz vor der Saison auf, sonst ist es ein
  leeres Versprechen — und ab Juni sind die Betriebe ausgebucht.
- **Kapitalbedarf.** Vorabimport plus Lagerung plus Zahlungsziel der Kunden
  bedeutet, dass Sie den Wareneinsatz für eine ganze Saison vorfinanzieren.
