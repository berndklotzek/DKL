/* ==========================================================================
   Zentrale Einstellungen — hier alles Persönliche eintragen.
   Diese Datei wird von allen Seiten (index, visitenkarte, impressum,
   datenschutz) gelesen. Werte mit "TODO" bitte vor dem Livegang ersetzen.
   ========================================================================== */
window.SITE = {
  /* Öffentliche Adresse der Website — wird für QR-Code, Canonical-URL und
     Strukturdaten verwendet. Bis eine eigene Domain steht, funktioniert die
     GitHub-Pages-Adresse. */
  siteUrl: "https://berndklotzek.github.io/dkl/",

  owner: {
    name: "Daniel Klotzek",
    title: "Versicherungsmakler & Finanzberater",
    qualifications: [
      "Geprüfter Fachmann für Versicherungsvermittlung (IHK)",
      "Logistik- und Mobilitätsmanagement (B.Sc.)"
    ],
    phone: "+49 162 4053093",
    phoneDisplay: "0162 / 405 30 93",
    email: "kontakt@daniel-klotzek.de",  /* TODO: E-Mail-Adresse */
    street: "Am Danielsbrunnen 28",
    zip: "69168",
    city: "Wiesloch",
    hours: "Mo – Fr 8:30 – 18:30 Uhr · Termine nach Vereinbarung, auch abends"
  },

  /* Google-Meet-Terminbuchung.
     In Google Kalender → "Terminplan erstellen" → Videokonferenz "Google Meet"
     aktivieren → Freigeben → "Einbetten" oder "Link" kopieren und hier
     eintragen. Die Adresse sieht so aus:
     https://calendar.google.com/calendar/appointments/schedules/AcZss…?gv=true */
  booking: {
    url: "https://calendar.google.com/calendar/appointments/schedules/TODO_TERMINPLAN_ID?gv=true",
    duration: "30 Minuten",
    label: "Erstgespräch per Google Meet"
  },

  /* Pflichtangaben nach § 15 VersVermV / § 5 DDG — TODO ausfüllen */
  legal: {
    registerNumber: "D-XXXX-XXXXXX-XX",   /* Vermittlerregister-Nr. */
    ihk: "IHK Rhein-Neckar, L 1, 2, 68161 Mannheim",
    vatId: "DE000000000",                 /* USt-IdNr., falls vorhanden */
    hasFinanzanlagen34f: false            /* true, wenn Erlaubnis nach § 34f GewO vorliegt */
  },

  region: ["Wiesloch", "Dielheim", "Nußloch", "Leimen", "Heidelberg"]
};
