/* =========================================================
   Fuhrparkkompass — zentrale Einstellungen
   Hier stehen alle Werte, die vor dem Livegang angepasst werden.
   ========================================================= */
window.FPK = {
  /* Kontakt */
  email: "termin@fuhrparkkompass.de",
  phone: "+49 000 0000000",            /* TODO: echte Rufnummer */
  phoneDisplay: "+49 (0) 000 000 00 00",

  /* 3D-Lkw im Hero
     truckModel: Pfad zu einer .glb-/.gltf-Datei (z. B. "assets/models/lkw.glb").
     Leer = eingebautes Modell. truckLength: Zuglänge in Metern, auf die das
     Modell skaliert wird. truckRotationY: Korrektur in Radiant, falls die
     Front nicht nach +z zeigt (Math.PI dreht um 180°). */
  truckModel: "",
  truckLength: 16.5,
  truckRotationY: 0,

  /* Terminbuchung
     endpoint: URL, an die die Buchung als JSON per POST geschickt wird
     (z. B. Formspree, Make/Zapier-Webhook, eigener Server).
     Leer lassen = Buchung wird als vorausgefüllte E-Mail geöffnet. */
  bookingEndpoint: "",
  /* Optional: Cal.com- oder Calendly-Link. Wenn gesetzt, wird er im
     Buchungsschritt als Alternative angeboten. */
  calendarLink: "",
  timezone: "Europe/Berlin",
  workdays: [1, 2, 3, 4, 5],           /* Mo–Fr */
  hours: { start: 9, end: 17 },        /* 09:00–17:00 */
  lunch: { start: 12.5, end: 13.5 },   /* 12:30–13:30 blockiert */
  leadHours: 20,                       /* frühester Termin: 20 h ab jetzt */
  horizonDays: 42,                     /* buchbar: die nächsten 6 Wochen */
  /* Gesetzliche Feiertage (bundesweit) — jährlich ergänzen */
  holidays: ["2026-10-03", "2026-12-25", "2026-12-26", "2027-01-01", "2027-03-26", "2027-03-29", "2027-05-01", "2027-05-06", "2027-05-17", "2027-10-03", "2027-12-25", "2027-12-26"],
  types: [
    { id: "erstgespraech", name: "Kostenloses Erstgespräch", minutes: 30, desc: "Telefon oder Video. Wir prüfen, ob und wo Ihr Fuhrpark Potenzial hat." },
    { id: "fuhrpark-check", name: "Fuhrpark-Check", minutes: 60, desc: "Analyse Ihres Bestands: Verträge, Schadenquote, Deckungslücken. Bitte Policen bereithalten." },
    { id: "vor-ort", name: "Vor-Ort-Termin", minutes: 90, desc: "Für Flotten ab 25 Fahrzeugen. Wir kommen in Ihren Betrieb, deutschlandweit." }
  ],

  /* Ersparnis-Rechner: Annahmen (bitte mit echten Erfahrungswerten abgleichen) */
  calc: {
    defaultVehicles: 25,
    defaultPremium: 1800,              /* Ø Jahresprämie je Fahrzeug in € */
    /* Spanne der erwarteten Ersparnis nach Schadenverlauf, in Prozent */
    saving: { gut: [12, 25], mittel: [8, 18], hoch: [4, 12] }
  }
};
