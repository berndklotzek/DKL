/* =====================================================================
   WERKLOT — Datenschicht
   Alle Inhalte dieser Datei sind Demonstrationsdaten. Betriebe, Namen,
   Zitate und Kennzahlen sind erfunden; die Vergütungsangaben sind grobe
   Richtwerte und ersetzen keine Tarifauskunft.
   ===================================================================== */

/* Die sieben Merkmale, über die Personen und Berufe verglichen werden. */
const DIMENSIONEN = {
  haende:     "Handgeschick",
  technik:    "Technikverständnis",
  draussen:   "Wechselnde Orte",
  kunde:      "Kundenkontakt",
  gestalten:  "Gestalten",
  praezision: "Präzision",
  koerper:    "Körperlicher Einsatz"
};
const DIM_KEYS = Object.keys(DIMENSIONEN);

/* ---------------------------------------------------------------------
   Berufe
   index  = WERKLOT Zukunfts-Index (0–100, eigenes Modell, siehe Methodik)
   profil = Ausprägung 0–5 je Merkmal
   ------------------------------------------------------------------ */
const BERUFE = [
  {
    id: "shk", name: "Anlagenmechaniker/in SHK", kurz: "Sanitär · Heizung · Klima",
    index: 94, verguetung: "780 – 1.020 €", dauer: "3,5 Jahre",
    profil: { haende:4, technik:5, draussen:4, kunde:4, gestalten:1, praezision:4, koerper:4 },
    warum: "Wärmepumpe, Altbau, enger Schacht: jede Anlage sitzt anders. Planbar ist hier nichts, und abnehmen muss es ein Mensch mit Namen."
  },
  {
    id: "elektro", name: "Elektroniker/in", kurz: "Energie- und Gebäudetechnik",
    index: 92, verguetung: "800 – 1.050 €", dauer: "3,5 Jahre",
    profil: { haende:4, technik:5, draussen:3, kunde:3, gestalten:1, praezision:5, koerper:3 },
    warum: "Wer Netze, Speicher und Ladepunkte in Bestandsgebäude bringt, arbeitet an der Engstelle der Energiewende — unter Vorschriften, die eine Unterschrift verlangen."
  },
  {
    id: "dach", name: "Dachdecker/in", kurz: "Dach · Fassade · Abdichtung",
    index: 91, verguetung: "900 – 1.180 €", dauer: "3 Jahre",
    profil: { haende:4, technik:3, draussen:5, kunde:2, gestalten:2, praezision:4, koerper:5 },
    warum: "Höhe, Wetter, kein Dach wie das andere. Dazu Photovoltaik und Dämmung — das Gewerk wächst mit jeder Sanierungswelle."
  },
  {
    id: "zimmerer", name: "Zimmerer/Zimmerin", kurz: "Holzbau · Dachstuhl · Aufstockung",
    index: 89, verguetung: "935 – 1.230 €", dauer: "3 Jahre",
    profil: { haende:5, technik:4, draussen:5, kunde:2, gestalten:3, praezision:5, koerper:5 },
    warum: "Holzbau ist die Antwort auf CO₂ im Bau. Abbund kommt aus der Maschine, der Aufbau auf der Baustelle nicht."
  },
  {
    id: "ortho", name: "Orthopädietechnik-Mechaniker/in", kurz: "Prothesen · Orthesen · Reha",
    index: 88, verguetung: "760 – 950 €", dauer: "3,5 Jahre",
    profil: { haende:5, technik:4, draussen:1, kunde:5, gestalten:3, praezision:5, koerper:2 },
    warum: "Jedes Hilfsmittel wird an einen einzigen Menschen angepasst — im Gespräch, am Körper, in mehreren Anproben."
  },
  {
    id: "friseur", name: "Friseur/in", kurz: "Haar · Farbe · Beratung",
    index: 85, verguetung: "650 – 850 €", dauer: "3 Jahre",
    profil: { haende:5, technik:2, draussen:1, kunde:5, gestalten:5, praezision:4, koerper:3 },
    warum: "Beratung, Vertrauen und eine Hand am Kopf eines Menschen: der Teil des Berufs, der zählt, ist nicht auslagerbar."
  },
  {
    id: "kfz", name: "Kfz-Mechatroniker/in", kurz: "Diagnose · Antrieb · Hochvolt",
    index: 84, verguetung: "720 – 980 €", dauer: "3,5 Jahre",
    profil: { haende:4, technik:5, draussen:2, kunde:3, gestalten:1, praezision:4, koerper:3 },
    warum: "Software liest den Fehler aus. Ausbauen, prüfen, entscheiden und Hochvolt sicher trennen macht weiterhin die Werkstatt."
  },
  {
    id: "tischler", name: "Tischler/in", kurz: "Möbel · Innenausbau · Massivholz",
    index: 82, verguetung: "700 – 900 €", dauer: "3 Jahre",
    profil: { haende:5, technik:3, draussen:2, kunde:4, gestalten:5, praezision:5, koerper:3 },
    warum: "CNC schneidet die Teile. Aufmaß im schiefen Altbau, Materialwahl und Montage beim Kunden bleiben Handarbeit."
  },
  {
    id: "metall", name: "Metallbauer/in", kurz: "Konstruktion · Schweißen · Montage",
    index: 83, verguetung: "760 – 990 €", dauer: "3,5 Jahre",
    profil: { haende:4, technik:5, draussen:4, kunde:2, gestalten:2, praezision:5, koerper:5 },
    warum: "Geländer, Tore, Tragwerke — Einzelstücke nach Maß, gefertigt und vor Ort verbaut."
  },
  {
    id: "galabau", name: "Landschaftsgärtner/in", kurz: "Garten- und Landschaftsbau",
    index: 87, verguetung: "950 – 1.250 €", dauer: "3 Jahre",
    profil: { haende:3, technik:3, draussen:5, kunde:3, gestalten:4, praezision:3, koerper:5 },
    warum: "Regenwasser, Hitze, Begrünung: Städte müssen umgebaut werden. Gemacht wird das mit Bagger, Pflanze und Rücken."
  },
  {
    id: "maler", name: "Maler/in und Lackierer/in", kurz: "Oberfläche · Farbe · Dämmung",
    index: 79, verguetung: "750 – 950 €", dauer: "3 Jahre",
    profil: { haende:4, technik:2, draussen:3, kunde:4, gestalten:5, praezision:4, koerper:4 },
    warum: "Untergrund beurteilen, Farbe empfehlen, sauber abkleben: Entscheidungen am Objekt, jedes Mal neu."
  },
  {
    id: "optik", name: "Augenoptiker/in", kurz: "Refraktion · Anpassung · Verkauf",
    index: 76, verguetung: "680 – 880 €", dauer: "3 Jahre",
    profil: { haende:4, technik:4, draussen:1, kunde:5, gestalten:4, praezision:5, koerper:1 },
    warum: "Messtechnik nimmt Arbeit ab, die Anpassung am Gesicht und die Beratung zur Fassung nicht."
  },
  {
    id: "baecker", name: "Bäcker/in · Konditor/in", kurz: "Teig · Ofen · Handwerksbackstube",
    index: 78, verguetung: "700 – 900 €", dauer: "3 Jahre",
    profil: { haende:5, technik:3, draussen:1, kunde:3, gestalten:4, praezision:4, koerper:4 },
    warum: "Industrie kann Massenware. Sauerteig, Führung und Fingerspitzengefühl für den Teig kann sie nicht."
  },
  {
    id: "maurer", name: "Maurer/in", kurz: "Rohbau · Sanierung · Beton",
    index: 86, verguetung: "935 – 1.230 €", dauer: "3 Jahre",
    profil: { haende:4, technik:3, draussen:5, kunde:2, gestalten:2, praezision:4, koerper:5 },
    warum: "Der Rohbau ist der Anfang von allem — und findet an einem Ort statt, an dem nie zweimal dasselbe steht."
  }
];

/* ---------------------------------------------------------------------
   Diagramm: Zukunfts-Index im Vergleich
   serie 1 = Handwerk, serie 2 = Vergleichsberufe (Büro / Verwaltung)
   ------------------------------------------------------------------ */
const INDEX_VERGLEICH = [
  { label: "Anlagenmechanik SHK",        value: 94, serie: 1 },
  { label: "Elektronik Gebäudetechnik",  value: 92, serie: 1 },
  { label: "Dachdeckerei",               value: 91, serie: 1 },
  { label: "Zimmerei",                   value: 89, serie: 1 },
  { label: "Orthopädietechnik",          value: 88, serie: 1 },
  { label: "Landschaftsbau",             value: 87, serie: 1 },
  { label: "Kfz-Mechatronik",            value: 84, serie: 1 },
  { label: "Tischlerei",                 value: 82, serie: 1 },
  { label: "Sachbearbeitung Verwaltung", value: 31, serie: 2 },
  { label: "Buchhaltung",                value: 27, serie: 2 },
  { label: "Standardtexte / Redaktion",  value: 24, serie: 2 },
  { label: "Telefonischer Kundendienst", value: 19, serie: 2 }
];

/* ---------------------------------------------------------------------
   Talent-Check
   Jede Antwort verteilt Punkte auf die sieben Merkmale.
   ------------------------------------------------------------------ */
const FRAGEN = [
  {
    frage: "Der Nachmittag gehört dir. Was ziehst du vor?",
    hinweis: "Antworte, wie du wirklich bist — nicht, was gut klingt.",
    optionen: [
      { text: "Etwas auseinandernehmen", sub: "Verstehen, wie es funktioniert.", w:{ technik:3, haende:2 } },
      { text: "Etwas bauen",             sub: "Am Abend steht da etwas.",        w:{ haende:3, koerper:2 } },
      { text: "Etwas entwerfen",         sub: "Zeichnen, planen, gestalten.",    w:{ gestalten:3, praezision:1 } },
      { text: "Jemandem helfen",         sub: "Bis das Problem weg ist.",        w:{ kunde:3, koerper:1 } }
    ]
  },
  {
    frage: "Wo willst du acht Stunden verbringen?",
    hinweis: "Es gibt keine falsche Antwort, nur unterschiedliche Betriebe.",
    optionen: [
      { text: "In der Werkstatt",   sub: "Maschinen, Material, fester Platz.", w:{ technik:2, praezision:2 } },
      { text: "Auf der Baustelle",  sub: "Draußen, Wetter ist egal.",          w:{ draussen:3, koerper:2 } },
      { text: "Bei Kundinnen",      sub: "Jeden Tag eine andere Wohnung.",     w:{ kunde:3, draussen:2 } },
      { text: "Am Feinarbeitsplatz",sub: "Ruhe, Licht, kleine Teile.",         w:{ praezision:3, haende:2 } }
    ]
  },
  {
    frage: "Ein Millimeter daneben.",
    hinweis: "",
    optionen: [
      { text: "Fällt mir sofort auf", sub: "Und dann mache ich es neu.",     w:{ praezision:3, haende:2 } },
      { text: "Hauptsache, es hält",  sub: "Funktion vor Optik.",            w:{ koerper:2, technik:2 } },
      { text: "Kommt darauf an",      sub: "Sichtbar ja, versteckt egal.",   w:{ gestalten:2, praezision:1 } }
    ]
  },
  {
    frage: "Körperliche Arbeit — dein Verhältnis dazu?",
    hinweis: "",
    optionen: [
      { text: "Genau mein Ding",    sub: "Ich will mich bewegen.",          w:{ koerper:3, draussen:2 } },
      { text: "Anstrengung ist ok", sub: "Aber der Kopf soll mitarbeiten.", w:{ technik:2, koerper:1 } },
      { text: "Lieber konzentriert",sub: "Ruhig, genau, im Sitzen.",        w:{ praezision:3, haende:1 } }
    ]
  },
  {
    frage: "Wie nah willst du an die Technik?",
    hinweis: "",
    optionen: [
      { text: "Ganz nah",          sub: "Schaltpläne, Messgeräte, Steuerung.", w:{ technik:3, praezision:2 } },
      { text: "Material zuerst",   sub: "Maschine bedienen, Werkstoff fühlen.", w:{ haende:3, technik:1 } },
      { text: "Nur als Werkzeug",  sub: "Wichtig ist, was am Ende herauskommt.", w:{ kunde:2, gestalten:2 } }
    ]
  },
  {
    frage: "Mit Kundschaft zu tun haben …",
    hinweis: "",
    optionen: [
      { text: "… macht den Job aus",   sub: "Reden, erklären, beraten.",        w:{ kunde:3, gestalten:1 } },
      { text: "… lieber im Team",      sub: "Kollegen ja, Kundschaft selten.",  w:{ technik:2, koerper:2 } },
      { text: "… klarer Auftrag, dann Ruhe", sub: "Kurz absprechen, dann arbeiten.", w:{ praezision:2, haende:1 } }
    ]
  },
  {
    frage: "Was soll man deiner Arbeit ansehen?",
    hinweis: "",
    optionen: [
      { text: "Dass sie exakt sitzt",  sub: "Auf den Zehntel genau.",       w:{ praezision:3, haende:1 } },
      { text: "Dass sie schön ist",    sub: "Form, Farbe, Oberfläche.",     w:{ gestalten:3, haende:1 } },
      { text: "Dass sie 30 Jahre hält",sub: "Solide, tragfähig, gebaut.",   w:{ koerper:2, technik:2 } },
      { text: "Dass es jemandem hilft",sub: "Vorher schlecht, nachher gut.",w:{ kunde:3, haende:1 } }
    ]
  },
  {
    frage: "Jeden Tag ein anderer Einsatzort?",
    hinweis: "",
    optionen: [
      { text: "Bitte",           sub: "Immer unterwegs, nie derselbe Blick.", w:{ draussen:3, kunde:1 } },
      { text: "Lieber nicht",    sub: "Ich mag meinen eigenen Platz.",        w:{ praezision:2, technik:1 } },
      { text: "Die Mischung",    sub: "Halb Werkstatt, halb Montage.",        w:{ draussen:1, haende:1, kunde:1 } }
    ]
  },
  {
    frage: "Fünf Jahre nach der Gesellenprüfung: Wo stehst du?",
    hinweis: "Antworte nach Bauchgefühl.",
    optionen: [
      { text: "Eigener Betrieb",       sub: "Meisterbrief, eigene Kundschaft.", w:{ kunde:2, technik:1, koerper:1 } },
      { text: "Spezialist/in",         sub: "Die kniffligen Fälle sind meine.", w:{ technik:2, praezision:2 } },
      { text: "Das beste Auge im Team",sub: "Qualität, Optik, Detail.",         w:{ gestalten:2, haende:2 } }
    ]
  }
];

/* ---------------------------------------------------------------------
   Betriebe (Demonstrationsdaten, erfundene Region)
   ------------------------------------------------------------------ */
const BETRIEBE = [
  {
    id:"b1", name:"Steinmüller Haustechnik", beruf:"shk", ort:"Talheim", km:6,
    plaetze:3, start:"August 2026", verguetung:"940 €", uebernahme:92, team:24, gegruendet:1978,
    kurz:"Familienbetrieb in dritter Generation, seit 2019 fast nur noch Wärmepumpen und Altbausanierung.",
    benefits:["Führerschein bezahlt","Eigener Werkzeugsatz","Vier-Tage-Woche im 3. Lehrjahr","Prüfungsvorbereitung intern"],
    lernen:["Wärmepumpen planen, setzen und in Betrieb nehmen","Bäder komplett aufbauen — vom Rohr bis zur Fuge","Hydraulischer Abgleich und Anlagenprotokoll","Kundengespräch und Übergabe"],
    stimme:{ text:"Im zweiten Lehrjahr durfte ich meine erste Anlage allein in Betrieb nehmen. Der Chef stand daneben und hat nichts gesagt. Das vergisst du nicht.", autor:"Auszubildender, 2. Lehrjahr" },
    ansprech:"Yannick Steinmüller, Betriebsleitung"
  },
  {
    id:"b2", name:"Elektro Vahlbruch GmbH", beruf:"elektro", ort:"Ostbrück", km:12,
    plaetze:2, start:"August 2026", verguetung:"1.010 €", uebernahme:88, team:41, gegruendet:1995,
    kurz:"Gebäudetechnik für Schulen, Kliniken und Gewerbe. Eigene Abteilung für Ladeinfrastruktur.",
    benefits:["Deutschlandticket","Meisterschule bezuschusst","Tablet ab Tag 1","Feste Ausbildungsmeisterin"],
    lernen:["Verteilungen aufbauen und prüfen","KNX-Gebäudesteuerung programmieren","Ladepunkte errichten und messen","Normgerecht dokumentieren nach DIN VDE"],
    stimme:{ text:"Wir machen einmal im Monat Messtraining. Nach einem Jahr hältst du das Messgerät wie eine Zahnbürste.", autor:"Auszubildende, 3. Lehrjahr" },
    ansprech:"Kerstin Vahlbruch, Ausbildungsleitung"
  },
  {
    id:"b3", name:"Zimmerei Reinke & Partner", beruf:"zimmerer", ort:"Neuwiesen", km:18,
    plaetze:2, start:"September 2026", verguetung:"1.080 €", uebernahme:95, team:19, gegruendet:1962,
    kurz:"Holzbau mit eigenem Abbundwerk. Aufstockungen, Dachstühle, zunehmend mehrgeschossiger Holzbau.",
    benefits:["Abbund an der CNC","Übernahmegarantie schriftlich","Arbeitskleidung gestellt","Bergsteiger-Sicherungstraining"],
    lernen:["Vom Aufmaß zum Abbundplan","CNC-Abbund vorbereiten und prüfen","Dachstuhl richten im Team","Holzschutz und Bauphysik"],
    stimme:{ text:"Wenn der Kran den Binder hebt und alles auf den Zentimeter passt — dafür stehe ich morgens auf.", autor:"Auszubildender, 3. Lehrjahr" },
    ansprech:"Marek Reinke, Zimmerermeister"
  },
  {
    id:"b4", name:"Tischlerei Ostwald", beruf:"tischler", ort:"Talheim", km:4,
    plaetze:1, start:"August 2026", verguetung:"820 €", uebernahme:80, team:11, gegruendet:2004,
    kurz:"Innenausbau und Einzelmöbel für Privatkundschaft. Massivholz, kleine Serien, viel Aufmaß vor Ort.",
    benefits:["Eigenes Gesellenstück-Budget","Freitag ab 13 Uhr","Werkstattschlüssel für Privatprojekte"],
    lernen:["Aufmaß im Altbau — nichts ist rechtwinklig","Massivholzverbindungen von Hand","Oberflächen: ölen, wachsen, lackieren","Montage beim Kunden"],
    stimme:{ text:"Mein erstes eigenes Möbel steht jetzt bei jemandem im Wohnzimmer. Das kann kein Bildschirm.", autor:"Auszubildende, 2. Lehrjahr" },
    ansprech:"Britta Ostwald, Tischlermeisterin"
  },
  {
    id:"b5", name:"Dach & Wand Kaltenbach", beruf:"dach", ort:"Rehberg", km:22,
    plaetze:3, start:"August 2026", verguetung:"1.150 €", uebernahme:85, team:28, gegruendet:1987,
    kurz:"Steildach, Flachdach, Fassade — mit eigener Photovoltaik-Kolonne.",
    benefits:["Höchste Vergütung im Vergleich","Höhentraining zertifiziert","Fahrgemeinschaft ab Talheim","Winterarbeit gesichert"],
    lernen:["Dachaufbau und Abdichtung","PV-Anlagen montieren","Gerüst und Absturzsicherung","Blechanschlüsse kanten und setzen"],
    stimme:{ text:"Oben ist es laut, windig und du siehst über die ganze Stadt. Büro könnte ich nicht.", autor:"Auszubildender, 1. Lehrjahr" },
    ansprech:"Ilja Kaltenbach, Dachdeckermeister"
  },
  {
    id:"b6", name:"Autohaus Brendel Werkstatt", beruf:"kfz", ort:"Ostbrück", km:14,
    plaetze:2, start:"September 2026", verguetung:"890 €", uebernahme:74, team:36, gegruendet:1971,
    kurz:"Freie Werkstatt mit Hochvolt-Zertifizierung. Verbrenner, Hybrid und E-Antrieb unter einem Dach.",
    benefits:["Hochvolt-Schein inklusive","Eigene Hebebühne im 2. Lehrjahr","Werkstattkleidung gewaschen"],
    lernen:["Fehlerdiagnose mit Diagnosesystem","Hochvoltsystem freischalten und sichern","Fahrwerk und Bremsen","Kundenannahme und Kostenvoranschlag"],
    stimme:{ text:"Das Gerät sagt dir, welcher Fehlercode kommt. Warum er kommt, findest immer noch du heraus.", autor:"Auszubildender, 3. Lehrjahr" },
    ansprech:"Tom Brendel, Werkstattleitung"
  },
  {
    id:"b7", name:"Sanitätshaus Lorenz Technik", beruf:"ortho", ort:"Talheim", km:8,
    plaetze:1, start:"August 2026", verguetung:"900 €", uebernahme:90, team:17, gegruendet:1958,
    kurz:"Orthopädietechnik mit eigener Werkstatt und 3D-Scan. Prothesen, Orthesen, Einlagen nach Maß.",
    benefits:["3D-Scan und Drucklabor","Patientenkontakt ab dem 1. Jahr","Feste Bezugsperson im Team"],
    lernen:["Gipsabdruck und 3D-Scan","Prothesenschaft laminieren","Anprobe und Feinjustage am Patienten","Abrechnung mit Krankenkassen"],
    stimme:{ text:"Ich habe eine Frau nach der Anprobe zum ersten Mal wieder gehen sehen. Danach war klar, dass ich bleibe.", autor:"Auszubildende, 3. Lehrjahr" },
    ansprech:"Dr. Anne Lorenz, Geschäftsführung"
  },
  {
    id:"b8", name:"Metallbau Sudhoff", beruf:"metall", ort:"Katzbach", km:27,
    plaetze:2, start:"August 2026", verguetung:"950 €", uebernahme:83, team:22, gegruendet:1990,
    kurz:"Konstruktionstechnik: Geländer, Tore, Stahltreppen und Sonderanfertigungen für Industriekunden.",
    benefits:["Schweißpässe bezahlt","Konstruktion am CAD","Zuschuss Fahrkosten"],
    lernen:["Schweißverfahren MAG und WIG","Konstruktion nach Zeichnung","Zuschnitt, Kanten, Richten","Montage auf der Baustelle"],
    stimme:{ text:"Ein Tor, das du selbst konstruiert und geschweißt hast, hängt danach 40 Jahre da. Das ist ein gutes Gefühl.", autor:"Auszubildender, 2. Lehrjahr" },
    ansprech:"Nadine Sudhoff, Metallbaumeisterin"
  },
  {
    id:"b9", name:"GaLaBau Hesselmann", beruf:"galabau", ort:"Neuwiesen", km:16,
    plaetze:4, start:"September 2026", verguetung:"1.100 €", uebernahme:78, team:33, gegruendet:2001,
    kurz:"Garten- und Landschaftsbau mit Schwerpunkt Regenwasser, Entsiegelung und Stadtgrün.",
    benefits:["Baggerschein ab 18","Winterpause bezahlt","Team-Frühstück täglich","Duale Weiterbildung Techniker"],
    lernen:["Pflasterdecken und Entwässerung","Baggerarbeiten und Vermessung","Pflanzenkunde und Standortwahl","Regenwasserbewirtschaftung"],
    stimme:{ text:"Wir haben einen Parkplatz in einen Wasserspeicher verwandelt. Nach drei Wochen sah man, dass es funktioniert.", autor:"Auszubildende, 2. Lehrjahr" },
    ansprech:"Paul Hesselmann, Bauleitung"
  },
  {
    id:"b10", name:"Malerwerkstätten Grasse", beruf:"maler", ort:"Lindenau", km:19,
    plaetze:2, start:"August 2026", verguetung:"860 €", uebernahme:70, team:15, gegruendet:1983,
    kurz:"Denkmalpflege, Altbausanierung und Fassadendämmung. Eigene Abteilung für historische Techniken.",
    benefits:["Denkmalpflege-Projekte","Farbwerkstatt für eigene Versuche","Gesellenstück gefördert"],
    lernen:["Untergründe beurteilen und vorbereiten","Historische Anstrichtechniken","Wärmedämmverbundsysteme","Farbberatung mit Kundschaft"],
    stimme:{ text:"An einer 200 Jahre alten Fassade lernst du mehr über Material als in jedem Video.", autor:"Auszubildender, 3. Lehrjahr" },
    ansprech:"Ellen Grasse, Malermeisterin"
  },
  {
    id:"b11", name:"Optik Hanfeld", beruf:"optik", ort:"Talheim", km:5,
    plaetze:1, start:"September 2026", verguetung:"830 €", uebernahme:86, team:9, gegruendet:2010,
    kurz:"Inhabergeführtes Fachgeschäft mit eigener Schleifwerkstatt und Sportbrillen-Anpassung.",
    benefits:["Eigene Schleifwerkstatt","Messtraining wöchentlich","Beteiligung am Umsatz ab Jahr 2"],
    lernen:["Refraktion und Sehtest","Gläser einschleifen und einsetzen","Fassungsberatung und Anpassung","Kontaktlinsen anpassen"],
    stimme:{ text:"Beim ersten eigenen Sehtest zittert die Hand. Beim fünfzigsten kennst du den Menschen vor dir.", autor:"Auszubildende, 2. Lehrjahr" },
    ansprech:"Mirko Hanfeld, Augenoptikermeister"
  },
  {
    id:"b12", name:"Backhaus Weigert", beruf:"baecker", ort:"Sandhofen", km:11,
    plaetze:2, start:"August 2026", verguetung:"870 €", uebernahme:76, team:26, gegruendet:1949,
    kurz:"Handwerksbackstube mit langer Teigführung, eigener Mühle und vier Filialen.",
    benefits:["Schichtbeginn erst 4 Uhr","Zuschlag für Nachtarbeit","Eigene Brotkreation im 3. Jahr","Kein Sonntagsdienst für Azubis"],
    lernen:["Sauerteig führen und pflegen","Brote formen und schießen","Konditorei: Torten und Feingebäck","Kalkulation und Warenkunde"],
    stimme:{ text:"Der Teig macht, was er will, wenn du ihn nicht verstehst. Das ist das Handwerk daran.", autor:"Auszubildender, 3. Lehrjahr" },
    ansprech:"Hanna Weigert, Bäckermeisterin"
  },
  {
    id:"b13", name:"Bauunternehmung Krieger", beruf:"maurer", ort:"Wörth", km:24,
    plaetze:3, start:"August 2026", verguetung:"1.120 €", uebernahme:81, team:47, gegruendet:1969,
    kurz:"Rohbau und Sanierung für Wohnungsbau und Kommunen. Eigener Betonfertigteil-Platz.",
    benefits:["Höchste Tarifvergütung Bau","Poliersausbildung möglich","Unterkunft bei Auswärtsmontage"],
    lernen:["Mauerwerk und Schalung","Beton einbringen und verdichten","Vermessung mit Nivellier und Laser","Sanierung im Bestand"],
    stimme:{ text:"Man fährt Jahre später an dem Haus vorbei und weiß: die Kellerwand ist von mir.", autor:"Auszubildender, 2. Lehrjahr" },
    ansprech:"Sven Krieger, Bauleiter"
  },
  {
    id:"b14", name:"Salon Kettler", beruf:"friseur", ort:"Ostbrück", km:13,
    plaetze:2, start:"September 2026", verguetung:"780 €", uebernahme:72, team:12, gegruendet:2013,
    kurz:"Salon mit Schwerpunkt Farbe und Haarschnitt-Technik, eigene Akademie-Tage.",
    benefits:["Akademietag pro Monat","Trinkgeld bleibt beim Team","Feste Modellabende","Vier-Tage-Woche"],
    lernen:["Schnitttechniken an Modell und Kundschaft","Farbe: Bestimmung, Mischung, Korrektur","Haar- und Kopfhautdiagnose","Beratung und Typveränderung"],
    stimme:{ text:"Bei uns entscheidet niemand über den Kopf der Kundin hinweg. Zuhören ist der halbe Schnitt.", autor:"Auszubildende, 3. Lehrjahr" },
    ansprech:"Deniz Kettler, Friseurmeisterin"
  }
];
