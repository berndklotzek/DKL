/* ---------------------------------------------------------------------------
   Alles, was Veronika selbst pflegt, steht in dieser einen Datei.
   Datei bearbeiten, speichern, hochladen — mehr ist nicht nötig.

   PLATZHALTER sind mit  // TODO  markiert.
--------------------------------------------------------------------------- */

window.BOOKING_CONFIG = {

  /* --- Kontakt ---------------------------------------------------------- */
  contact: {
    name:      'Veronika Yovenko',
    email:     'veronikayovenko@gmail.com',
    phone:     '+49 176 57990459',
    whatsapp:  '4917657990459',           // nur Ziffern, mit Vorwahl, ohne +
    instagram: 'veronnyss',
    street:    'Berliner Straße 13',
    city:      '71686 Remseck am Neckar',
    area:      'Stuttgart und Umgebung'          // TODO Grenzen des Gebiets bestätigen
  },

  /* --- Wohin geht die Anfrage? ------------------------------------------
     Leer lassen = Versand per WhatsApp oder E-Mail, ohne Server.
     Wer später einen Formular-Dienst nutzt, trägt dessen URL hier ein.    */
  formEndpoint: '',

  /* --- Regeln ------------------------------------------------------------
     Kurzfristige Anfragen sind bei Tieren der Normalfall: zwölf Stunden
     Vorlauf reichen. Urlaube werden dagegen lange im Voraus geplant,
     deshalb der weite Horizont.                                            */
  leadTimeHours:   12,
  horizonDays:     240,
  slotStepMinutes: 30,
  bufferMinutes:   15,   // Weg zum nächsten Tier

  /* --- Besuchszeiten ----------------------------------------------------
     1 = Montag ... 7 = Sonntag. Mehrere Fenster pro Tag sind möglich.     */
  visitHours: {                                   // TODO Zeiten bestätigen
    1: [['07:00', '21:00']],
    2: [['07:00', '21:00']],
    3: [['07:00', '21:00']],
    4: [['07:00', '21:00']],
    5: [['07:00', '21:00']],
    6: [['08:00', '20:00']],
    7: [['08:00', '20:00']]
  },

  /* --- Tage, an denen gar nichts geht (eigener Urlaub) ------------------- */
  closedDates: [
    // '2026-12-24',
  ],

  /* --- Schon vergebene Zeiten für einzelne Besuche -----------------------
     Entweder eine Startzeit ('14:00') oder ein Zeitraum ('14:00-16:30').  */
  bookedSlots: {
    // '2026-09-10': ['08:00-09:00', '18:00']
  },

  /* --- Tage, die für Urlaubsbetreuung belegt sind ------------------------
     Während einer Urlaubsbetreuung ist Veronika bei einem Tier gebunden;
     diese Tage werden im Kalender komplett gesperrt.                       */
  bookedDays: [
    // '2026-10-02', '2026-10-03'
  ],

  /* --- Leistungen -------------------------------------------------------
     mode 'visit' = einzelner Besuch mit Uhrzeit.
     mode 'stay'  = Betreuung über mehrere Tage (Von–Bis im Kalender).     */
  services: [                                     // TODO Preise bestätigen
    {
      id: 'gassi-30',
      name: 'Gassirunde',
      mode: 'visit',
      duration: 30,
      price: '15 €',
      desc: 'Eine halbe Stunde raus: lösen, schnüffeln, Kopf frei bekommen. Für den langen Bürotag zwischendurch.'
    },
    {
      id: 'gassi-60',
      name: 'Große Runde',
      mode: 'visit',
      duration: 60,
      price: '22 €',
      desc: 'Eine volle Stunde mit Tempo und Nase-Arbeit. Für Hunde, denen zwanzig Minuten Gehsteig nicht reichen.'
    },
    {
      id: 'katzenbesuch',
      name: 'Katzenbesuch',
      mode: 'visit',
      duration: 30,
      price: '14 €',
      desc: 'Füttern, frisches Wasser, Katzenklo, Post reinholen — und so lange spielen, wie die Katze mitmacht.'
    },
    {
      id: 'tagesbetreuung',
      name: 'Tagesbetreuung',
      mode: 'visit',
      duration: 240,
      price: '45 €',
      desc: 'Vier Stunden am Stück, wenn der Tag lang wird: zwei Runden, Futter, Ruhezeit dazwischen.'
    },
    {
      id: 'urlaubsbetreuung',
      name: 'Urlaubsbetreuung',
      mode: 'stay',
      price: '55 € pro Tag',
      desc: 'Betreuung über mehrere Tage im gewohnten Zuhause Ihres Tieres — mit täglicher Rückmeldung an Sie.'
    },
    {
      id: 'kennenlernen',
      name: 'Kennenlernen',
      mode: 'visit',
      duration: 30,
      price: 'kostenlos',
      desc: 'Eine halbe Stunde bei Ihnen zu Hause: Tier, Mensch, Gewohnheiten, Schlüssel. Ohne Verpflichtung.'
    }
  ],

  /* --- Auswahl für Schritt 3 -------------------------------------------- */
  visitsPerDay: [
    { id: '1', label: '1 Besuch pro Tag' },
    { id: '2', label: '2 Besuche pro Tag' },
    { id: '3', label: '3 Besuche pro Tag' },
    { id: 'nacht', label: 'Mit Übernachtung' }
  ],

  keyOptions: [
    { id: 'uebergabe',  label: 'Persönliche Übergabe vorab' },
    { id: 'hinterlegt', label: 'Schlüssel liegt schon bei Ihnen' },
    { id: 'safe',       label: 'Schlüsselsafe am Haus' },
    { id: 'offen',      label: 'Noch offen — bitte besprechen' }
  ]
};
