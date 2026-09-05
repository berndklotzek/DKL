/* ---------------------------------------------------------------------------
   Alle Angaben, die Veronika selbst pflegt, stehen in dieser einen Datei.
   Kein Build, kein Framework: Datei bearbeiten, speichern, hochladen.

   PLATZHALTER sind mit  // TODO  markiert und muessen vor dem Livegang
   durch echte Werte ersetzt werden.
--------------------------------------------------------------------------- */

window.BOOKING_CONFIG = {

  /* --- Kontakt ---------------------------------------------------------- */
  contact: {
    name:      'Veronika Yovenko',
    email:     'veronikayovenko@gmail.com',
    phone:     '+49 176 57990459',
    // Nummer fuer wa.me: nur Ziffern, mit Laendervorwahl, ohne + und ohne 0.
    whatsapp:  '4917657990459',
    instagram: 'veronnyss',
    studio: {
      name:   'Veronika Yovenko — Lash Lifting',
      street: 'Berliner Straße 13',
      city:   '71686 Remseck am Neckar'
    }
  },

  /* --- Wohin geht die Terminanfrage? ------------------------------------
     Leer lassen = die Anfrage wird per WhatsApp oder E-Mail verschickt
     (funktioniert ohne Server, kostet nichts).
     Wer spaeter einen Formular-Dienst nutzt (z. B. Formspree, Basin,
     eigenes Skript): dessen URL hier eintragen. Dann wird die Anfrage
     zusaetzlich als JSON dorthin gesendet.                                */
  formEndpoint: '',

  /* --- Regeln ----------------------------------------------------------- */
  leadTimeHours:    24,   // so viel Vorlauf braucht eine Anfrage mindestens
  horizonDays:      90,   // so weit im Voraus darf gebucht werden
  slotStepMinutes:  30,   // Raster der angebotenen Uhrzeiten
  bufferMinutes:    15,   // Puffer nach jeder Behandlung (Aufraeumen)

  /* --- Oeffnungszeiten --------------------------------------------------
     Pro Wochentag beliebig viele Zeitfenster: 1 = Montag ... 7 = Sonntag.
     Leeres Array = an diesem Tag geschlossen.
     Beispiel Mittagspause:  [['10:00','13:00'], ['14:00','19:00']]        */
  openingHours: {                                  // TODO Zeiten bestaetigen
    1: [],
    2: [['10:00', '19:00']],
    3: [['10:00', '19:00']],
    4: [['10:00', '19:00']],
    5: [['10:00', '19:00']],
    6: [['10:00', '16:00']],
    7: []
  },

  /* --- Urlaub und einzelne freie Tage (YYYY-MM-DD) ----------------------- */
  closedDates: [
    // '2026-12-24',
  ],

  /* --- Schon vergebene Zeiten -------------------------------------------
     Pro Tag entweder eine einzelne Startzeit ('14:00' sperrt genau diesen
     Slot) oder ein Zeitraum ('14:00-16:30' sperrt alles, was sich damit
     ueberschneidet).                                                       */
  bookedSlots: {
    // '2026-09-10': ['14:00-16:00', '17:30']
  },

  /* --- Leistungen -------------------------------------------------------
     duration = reine Behandlungszeit in Minuten (der Puffer kommt oben
     dazu). price = frei formulierbarer Text.                              */
  services: [                                    // TODO Preise bestaetigen
    {
      id: 'lifting',
      name: 'Wimpernlifting',
      duration: 60,
      price: 'ab 45 €',
      desc: 'Die Naturwimper wird sanft aufgerichtet und fixiert – offener Blick, ganz ohne Verlängerung.'
    },
    {
      id: 'lifting-farbe',
      name: 'Wimpernlifting & Färben',
      duration: 75,
      price: 'ab 55 €',
      desc: 'Lifting plus Farbe: die Spitzen werden sichtbar, der Effekt wirkt wie Mascara, die nicht verwischt.'
    },
    {
      id: 'laminierung',
      name: 'Wimpernlaminierung mit Pflege',
      duration: 80,
      price: 'ab 60 €',
      desc: 'Lifting, Farbe und eine abschließende Keratin-Pflege für feine oder strapazierte Wimpern.'
    },
    {
      id: 'auffrischung',
      name: 'Auffrischung',
      duration: 45,
      price: 'ab 40 €',
      desc: 'Für Stammkundinnen im Rhythmus von sechs bis acht Wochen.'
    },
    {
      id: 'beratung',
      name: 'Beratung & Wimpern-Check',
      duration: 20,
      price: 'kostenlos',
      desc: 'Wir schauen uns Ihre Wimpernstruktur an und besprechen, welches Ergebnis realistisch ist.'
    }
  ]
};
