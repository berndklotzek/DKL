/* ---------------------------------------------------------------------------
   Alles, was die Plattform ausmacht und sich ändern wird, in einer Datei:
   Name, Preise, Stadt, Kontakt, Leistungen, Zeitfenster.

   PLATZHALTER sind mit  // TODO  markiert und müssen vor dem Livegang
   durch echte Werte ersetzt werden.
--------------------------------------------------------------------------- */

window.PLATFORM = {

  /* --- Marke ------------------------------------------------------------ */
  brand: 'fello',                                   // TODO Arbeitstitel — Name und Domain prüfen
  claim: 'Studierende betreuen Ihr Tier.',

  /* --- Kontakt ------------------------------------------------------------
     In der Startphase laufen Anfragen bei Veronika auf; später auf die
     Plattform-Adressen umstellen.                                          */
  contact: {
    email:    'veronikayovenko@gmail.com',          // TODO z. B. hallo@fello.de
    phone:    '+49 176 57990459',                   // TODO Plattform-Nummer
    whatsapp: '4917657990459',                      // nur Ziffern, mit Vorwahl
    street:   'Berliner Straße 13',                 // TODO Sitz der Plattform
    city:     '71686 Remseck am Neckar'
  },

  /* Wohin geht eine Anfrage oder Bewerbung zusätzlich als JSON?
     Leer = nur WhatsApp / E-Mail (funktioniert ohne Server).            */
  formEndpoint: '',

  /* --- Region -------------------------------------------------------------- */
  city: 'Stuttgart',
  areas: ['Stuttgart-Mitte', 'Stuttgart-West', 'Stuttgart-Nord', 'Stuttgart-Ost',
          'Stuttgart-Süd', 'Bad Cannstatt', 'Feuerbach', 'Zuffenhausen', 'Vaihingen',
          'Degerloch', 'Fellbach', 'Ludwigsburg', 'Kornwestheim', 'Remseck am Neckar'],
  universities: ['Universität Stuttgart', 'Universität Hohenheim', 'HdM Stuttgart',
                 'Hochschule für Technik', 'DHBW Stuttgart', 'PH Ludwigsburg'],

  /* --- Preise (brutto, inkl. Versicherung und Abrechnung) ---------------
     Modell: Kundin zahlt der Plattform, die Plattform stellt die
     Studierenden auf Minijob-Basis an und zahlt sie aus.                    */
  prices: {                                          // TODO alle Beträge bestätigen
    hour:        19,    // € je Stunde
    half:        11,    // € je halbe Stunde (Gassirunde, Fütterungsbesuch)
    stayPerDay:  22,    // € je Tag Urlaubsbetreuung mit zwei Besuchen
    studentHour: 14,    // € je Stunde, die bei Studierenden ankommt
    minWage:     13.90, // gesetzlicher Mindestlohn 2026            // TODO jährlich prüfen
    minijobCap:  603    // Minijob-Grenze je Monat 2026             // TODO jährlich prüfen
  },

  /* --- Leistungen ---------------------------------------------------------
     kind 'once'  = ein Termin an einem Tag
     kind 'weekly'= wiederkehrend, Wochentage + Zeitfenster
     kind 'stay'  = Zeitraum von–bis                                          */
  services: [
    { id: 'gassi-30', name: 'Gassirunde',        minutes: 30, price: '11 €',
      desc: 'Eine halbe Stunde raus: lösen, schnüffeln, Kopf frei. Einmalig oder als feste Mittagsrunde.' },
    { id: 'gassi-60', name: 'Große Runde',        minutes: 60, price: '19 €',
      desc: 'Eine volle Stunde für Hunde, die mehr brauchen als den Block.' },
    { id: 'katze',    name: 'Fütterungsbesuch',   minutes: 30, price: '11 €',
      desc: 'Futter, Wasser, Katzenklo, Post — und Zeit für die Katze, wenn sie will.' },
    { id: 'urlaub',   name: 'Urlaubsbetreuung',   minutes: 0,  price: '22 € pro Tag',
      desc: 'Zwei Besuche täglich im gewohnten Zuhause, mit Foto nach jedem Besuch.' },
    { id: 'kennen',   name: 'Kennenlernen',       minutes: 30, price: 'kostenlos',
      desc: 'Die Betreuerin oder der Betreuer kommt vorbei: Tier, Gewohnheiten, Schlüssel. Unverbindlich.' }
  ],

  /* --- Zeitfenster für Besuche ------------------------------------------ */
  windows: [
    { id: 'morgens',     label: 'Morgens',      hours: '7 – 10 Uhr' },
    { id: 'mittags',     label: 'Mittags',      hours: '11 – 14 Uhr' },
    { id: 'nachmittags', label: 'Nachmittags',  hours: '14 – 17 Uhr' },
    { id: 'abends',      label: 'Abends',       hours: '17 – 21 Uhr' }
  ],

  keyOptions: [
    'Persönliche Übergabe beim Kennenlernen',
    'Schlüsselsafe am Haus',
    'Noch offen — bitte besprechen'
  ],

  leadTimeHours: 24,
  horizonDays:   180
};
