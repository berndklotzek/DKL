/* ---------------------------------------------------------------------------
   Terminbuchung — drei Schritte: Leistung, Termin, Kontakt.

   Die Seite ist statisch, es gibt also keinen Server, der Termine verwaltet.
   Das Formular stellt eine *Anfrage* zusammen und uebergibt sie an WhatsApp
   oder das E-Mail-Programm; optional zusaetzlich per POST an einen
   Formular-Dienst (BOOKING_CONFIG.formEndpoint). Verbindlich wird der Termin
   erst mit Veronikas Antwort — die Oberflaeche sagt das auch so.

   Freie Zeiten kommen aus assets/js/booking-config.js.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var CFG = window.BOOKING_CONFIG;
  var root = document.getElementById('booking');
  if (!CFG || !root) return;

  var DAY_NAMES   = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                     'August', 'September', 'Oktober', 'November', 'Dezember'];

  var state = {
    step: 1,
    service: null,
    date: null,   // 'YYYY-MM-DD'
    time: null,   // 'HH:MM'
    month: null   // Date, immer der 1. des angezeigten Monats
  };

  /* --- kleine Helfer ---------------------------------------------------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function iso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function fromIso(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function minutes(hhmm) {
    var p = hhmm.split(':');
    return +p[0] * 60 + +p[1];
  }

  function hhmm(mins) {
    return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
  }

  /** Wochentag als 1 = Montag ... 7 = Sonntag (getDay() liefert 0 = Sonntag). */
  function weekday(d) { return d.getDay() === 0 ? 7 : d.getDay(); }

  function longDate(isoStr) {
    var d = fromIso(isoStr);
    return DAY_NAMES[weekday(d) - 1] + ', ' + d.getDate() + '. ' +
           MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
  }

  function startOfToday() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function serviceById(id) {
    for (var i = 0; i < CFG.services.length; i++) {
      if (CFG.services[i].id === id) return CFG.services[i];
    }
    return null;
  }

  /* --- Verfuegbarkeit ---------------------------------------------------- */

  /** Gesperrte Zeitraeume eines Tages als [von, bis] in Minuten. */
  function blockedRanges(isoStr) {
    var raw = (CFG.bookedSlots && CFG.bookedSlots[isoStr]) || [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var entry = String(raw[i]);
      if (entry.indexOf('-') > -1) {
        var parts = entry.split('-');
        out.push([minutes(parts[0].trim()), minutes(parts[1].trim())]);
      } else {
        // einzelne Startzeit: sperrt genau dieses Raster-Feld
        var s = minutes(entry.trim());
        out.push([s, s + CFG.slotStepMinutes]);
      }
    }
    return out;
  }

  function overlaps(aStart, aEnd, ranges) {
    for (var i = 0; i < ranges.length; i++) {
      if (aStart < ranges[i][1] && aEnd > ranges[i][0]) return true;
    }
    return false;
  }

  function isClosed(isoStr) {
    return (CFG.closedDates || []).indexOf(isoStr) > -1;
  }

  function horizonEnd() {
    var d = startOfToday();
    d.setDate(d.getDate() + CFG.horizonDays);
    return d;
  }

  /** Fruehester zulaessiger Startzeitpunkt (jetzt + Vorlaufzeit). */
  function earliestStart() {
    return new Date(Date.now() + CFG.leadTimeHours * 3600000);
  }

  /** Alle freien Startzeiten eines Tages fuer die gewaehlte Leistung. */
  function slotsFor(isoStr, service) {
    if (!service || isClosed(isoStr)) return [];

    var day    = fromIso(isoStr);
    var today  = startOfToday();
    if (day < today || day > horizonEnd()) return [];

    var windows = CFG.openingHours[weekday(day)] || [];
    var need    = service.duration + CFG.bufferMinutes;
    var blocked = blockedRanges(isoStr);
    var min     = earliestStart();
    var out     = [];

    for (var w = 0; w < windows.length; w++) {
      var open  = minutes(windows[w][0]);
      var close = minutes(windows[w][1]);
      for (var t = open; t + need <= close; t += CFG.slotStepMinutes) {
        if (overlaps(t, t + need, blocked)) continue;
        var when = new Date(day.getFullYear(), day.getMonth(), day.getDate(),
                            Math.floor(t / 60), t % 60);
        if (when < min) continue;
        out.push(hhmm(t));
      }
    }
    return out;
  }

  function hasAnySlot(isoStr) {
    return slotsFor(isoStr, state.service).length > 0;
  }

  /* --- Schritt 1: Leistungen -------------------------------------------- */

  var serviceList = root.querySelector('[data-services]');

  function renderServices() {
    var html = '';
    for (var i = 0; i < CFG.services.length; i++) {
      var s = CFG.services[i];
      html +=
        '<li>' +
          '<button type="button" class="svc-pick" data-service="' + s.id + '"' +
                  ' aria-pressed="' + (state.service && state.service.id === s.id) + '">' +
            '<span class="svc-pick__name">' + s.name + '</span>' +
            '<span class="svc-pick__meta caps">' + s.duration + ' Min · ' + s.price + '</span>' +
            '<span class="svc-pick__desc">' + s.desc + '</span>' +
          '</button>' +
        '</li>';
    }
    serviceList.innerHTML = html;
  }

  serviceList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-service]');
    if (!btn) return;
    state.service = serviceById(btn.getAttribute('data-service'));
    state.time = null;
    if (state.date && !hasAnySlot(state.date)) state.date = null;
    renderServices();
    renderCalendar();
    renderSlots();
    goTo(2);
  });

  /* --- Schritt 2: Kalender ---------------------------------------------- */

  var calGrid  = root.querySelector('[data-calendar]');
  var calLabel = root.querySelector('[data-month-label]');
  var prevBtn  = root.querySelector('[data-prev-month]');
  var nextBtn  = root.querySelector('[data-next-month]');
  var slotWrap = root.querySelector('[data-slots]');
  var slotHead = root.querySelector('[data-slots-head]');

  function monthStart(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }

  function renderCalendar() {
    if (!state.month) state.month = monthStart(startOfToday());

    var first    = state.month;
    var year     = first.getFullYear();
    var month    = first.getMonth();
    var lead     = weekday(first) - 1;                       // Leerfelder vorne
    var days     = new Date(year, month + 1, 0).getDate();
    var today    = startOfToday();
    var limit    = horizonEnd();

    calLabel.textContent = MONTH_NAMES[month] + ' ' + year;

    var html = '';
    for (var i = 0; i < DAY_NAMES.length; i++) {
      html += '<span class="cal__dow caps" aria-hidden="true">' + DAY_NAMES[i] + '</span>';
    }
    for (var l = 0; l < lead; l++) html += '<span class="cal__pad"></span>';

    for (var d = 1; d <= days; d++) {
      var date = new Date(year, month, d);
      var key  = iso(date);
      var free = date >= today && date <= limit && hasAnySlot(key);
      var cls  = 'cal__day' +
                 (key === state.date ? ' is-selected' : '') +
                 (key === iso(today) ? ' is-today' : '');
      html +=
        '<button type="button" class="' + cls + '" data-date="' + key + '"' +
        (free ? '' : ' disabled') +
        ' aria-label="' + longDate(key) + (free ? '' : ' – keine freien Zeiten') + '"' +
        (key === state.date ? ' aria-current="date"' : '') + '>' + d + '</button>';
    }

    calGrid.innerHTML = html;

    prevBtn.disabled = monthStart(today) >= first;
    nextBtn.disabled = new Date(year, month + 1, 1) > limit;
  }

  function shiftMonth(delta) {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + delta, 1);
    renderCalendar();
  }

  prevBtn.addEventListener('click', function () { shiftMonth(-1); });
  nextBtn.addEventListener('click', function () { shiftMonth(1); });

  calGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-date]');
    if (!btn || btn.disabled) return;
    state.date = btn.getAttribute('data-date');
    state.time = null;
    renderCalendar();
    renderSlots();
  });

  function renderSlots() {
    if (!state.service) {
      slotHead.textContent = 'Bitte zuerst eine Leistung wählen.';
      slotWrap.innerHTML = '';
      return;
    }
    if (!state.date) {
      slotHead.textContent = 'Wählen Sie einen Tag – die freien Zeiten erscheinen hier.';
      slotWrap.innerHTML = '';
      return;
    }

    var slots = slotsFor(state.date, state.service);
    slotHead.textContent = longDate(state.date) +
      (slots.length ? ' · ' + slots.length + ' freie Zeiten' : ' · keine freien Zeiten');

    var html = '';
    for (var i = 0; i < slots.length; i++) {
      var end = hhmm(minutes(slots[i]) + state.service.duration);
      html +=
        '<button type="button" class="slot' + (slots[i] === state.time ? ' is-selected' : '') + '"' +
        ' data-time="' + slots[i] + '" aria-pressed="' + (slots[i] === state.time) + '">' +
          '<span class="slot__time">' + slots[i] + '</span>' +
          '<span class="slot__end">bis ' + end + '</span>' +
        '</button>';
    }
    slotWrap.innerHTML = html;
  }

  slotWrap.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-time]');
    if (!btn) return;
    state.time = btn.getAttribute('data-time');
    renderSlots();
    goTo(3);
  });

  /* --- Schritt 3: Kontaktdaten ------------------------------------------ */

  var form    = root.querySelector('[data-booking-form]');
  var summary = root.querySelector('[data-summary]');
  var errBox  = root.querySelector('[data-form-error]');
  var done    = root.querySelector('[data-booking-done]');
  var doneSum = root.querySelector('[data-done-summary]');

  function renderSummary() {
    if (!state.service || !state.date || !state.time) {
      summary.innerHTML = '<p class="muted">Noch kein Termin gewählt.</p>';
      return;
    }
    var end = hhmm(minutes(state.time) + state.service.duration);
    summary.innerHTML =
      '<dl class="summary">' +
        '<div><dt>Leistung</dt><dd>' + state.service.name + '</dd></div>' +
        '<div><dt>Termin</dt><dd>' + longDate(state.date) + '</dd></div>' +
        '<div><dt>Uhrzeit</dt><dd>' + state.time + ' – ' + end + ' Uhr</dd></div>' +
        '<div><dt>Dauer</dt><dd>' + state.service.duration + ' Minuten</dd></div>' +
        '<div><dt>Preis</dt><dd>' + state.service.price + '</dd></div>' +
      '</dl>';
  }

  function values() {
    return {
      name:    form.elements.name.value.trim(),
      email:   form.elements.email.value.trim(),
      phone:   form.elements.phone.value.trim(),
      message: form.elements.message.value.trim(),
      consent: form.elements.consent.checked
    };
  }

  function validate(v) {
    if (!state.service)               return 'Bitte wählen Sie eine Leistung.';
    if (!state.date || !state.time)   return 'Bitte wählen Sie Tag und Uhrzeit.';
    if (!v.name)                      return 'Bitte tragen Sie Ihren Namen ein.';
    if (!v.email && !v.phone)         return 'Bitte hinterlassen Sie eine E-Mail-Adresse oder eine Telefonnummer.';
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))
                                      return 'Diese E-Mail-Adresse sieht nicht vollständig aus.';
    if (!v.consent)                   return 'Bitte bestätigen Sie den Hinweis zum Datenschutz.';
    return null;
  }

  /** Die Anfrage als Fliesstext — identisch fuer WhatsApp, E-Mail und POST. */
  function requestText(v) {
    var end = hhmm(minutes(state.time) + state.service.duration);
    var lines = [
      'Terminanfrage',
      '',
      'Leistung: ' + state.service.name + ' (' + state.service.duration + ' Min, ' + state.service.price + ')',
      'Termin: ' + longDate(state.date),
      'Uhrzeit: ' + state.time + ' – ' + end + ' Uhr',
      '',
      'Name: ' + v.name
    ];
    if (v.email)   lines.push('E-Mail: ' + v.email);
    if (v.phone)   lines.push('Telefon: ' + v.phone);
    if (v.message) lines.push('', 'Nachricht: ' + v.message);
    return lines.join('\n');
  }

  function icsFile() {
    var d     = fromIso(state.date);
    var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(),
                         +state.time.split(':')[0], +state.time.split(':')[1]);
    var end   = new Date(start.getTime() + state.service.duration * 60000);
    var stamp = function (x) {
      return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' +
             pad(x.getHours()) + pad(x.getMinutes()) + '00';
    };
    var studio = CFG.contact.studio;
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//' + CFG.contact.name + '//Terminanfrage//DE',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@lash-termin',
      'DTSTAMP:' + stamp(new Date()),
      'DTSTART:' + stamp(start),
      'DTEND:' + stamp(end),
      'SUMMARY:' + state.service.name + ' bei ' + CFG.contact.name,
      'LOCATION:' + [studio.name, studio.street, studio.city].filter(Boolean).join(', '),
      'DESCRIPTION:Terminanfrage – verbindlich erst nach Bestätigung.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function showDone(v) {
    var text = requestText(v);
    var wa   = 'https://wa.me/' + CFG.contact.whatsapp + '?text=' + encodeURIComponent(text);
    var mail = 'mailto:' + CFG.contact.email +
               '?subject=' + encodeURIComponent('Terminanfrage ' + longDate(state.date) + ', ' + state.time) +
               '&body=' + encodeURIComponent(text);

    doneSum.innerHTML =
      '<pre class="request">' + text.replace(/[<>&]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
      }) + '</pre>';

    root.querySelector('[data-send-whatsapp]').href = wa;
    root.querySelector('[data-send-mail]').href     = mail;

    var icsLink = root.querySelector('[data-download-ics]');
    if (icsLink.dataset.url) URL.revokeObjectURL(icsLink.dataset.url);
    var url = URL.createObjectURL(new Blob([icsFile()], { type: 'text/calendar' }));
    icsLink.href = url;
    icsLink.dataset.url = url;
    icsLink.download = 'termin-' + state.date + '.ics';

    goTo(4);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v   = values();
    var msg = validate(v);
    if (msg) {
      errBox.textContent = msg;
      errBox.hidden = false;
      return;
    }
    errBox.hidden = true;

    if (CFG.formEndpoint) {
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          service: state.service.name,
          date:    state.date,
          time:    state.time,
          name:    v.name,
          email:   v.email,
          phone:   v.phone,
          message: v.message,
          text:    requestText(v)
        })
      })['catch'](function () { /* Versand per WhatsApp/E-Mail bleibt als Weg */ })
       .then(function () { btn.disabled = false; showDone(v); });
      return;
    }

    showDone(v);
  });

  /* --- Schrittwechsel ---------------------------------------------------- */

  var panels = root.querySelectorAll('[data-step]');
  var rail   = root.querySelectorAll('[data-rail-step]');
  var live   = root.querySelector('[data-live]');

  function goTo(step) {
    state.step = step;
    for (var i = 0; i < panels.length; i++) {
      var n = +panels[i].getAttribute('data-step');
      panels[i].hidden = n !== step;
    }
    for (var r = 0; r < rail.length; r++) {
      var rn = +rail[r].getAttribute('data-rail-step');
      rail[r].classList.toggle('is-active', rn === step);
      rail[r].classList.toggle('is-done', rn < step);
      rail[r].setAttribute('aria-current', rn === step ? 'step' : 'false');
    }
    if (step === 3) renderSummary();

    var titles = { 1: 'Schritt 1 von 3: Leistung', 2: 'Schritt 2 von 3: Termin',
                   3: 'Schritt 3 von 3: Kontakt',  4: 'Anfrage bereit zum Versenden' };
    live.textContent = titles[step] || '';

    if (step > 1) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  root.addEventListener('click', function (e) {
    var back = e.target.closest('[data-back]');
    if (back) goTo(+back.getAttribute('data-back'));

    if (e.target.closest('[data-restart]')) {
      state.service = null; state.date = null; state.time = null;
      form.reset();
      renderServices(); renderCalendar(); renderSlots();
      goTo(1);
    }
  });

  /* --- Start ------------------------------------------------------------- */

  renderServices();
  renderCalendar();
  renderSlots();
  goTo(1);

  // Die Leistungskarten oben auf der Seite springen direkt in Schritt 2.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-book-service]');
    if (!link) return;
    var svc = serviceById(link.getAttribute('data-book-service'));
    if (!svc) return;
    e.preventDefault();
    state.service = svc; state.time = null;
    renderServices(); renderCalendar(); renderSlots();
    goTo(2);
  });
})();
