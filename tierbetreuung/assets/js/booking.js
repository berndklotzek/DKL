/* ---------------------------------------------------------------------------
   Betreuungsanfrage in vier Schritten: Leistung, Zeit, Tier und Zuhause,
   Kontakt.

   Zwei Arten von Leistungen, und daran hängt fast alles:
     mode 'visit' — ein einzelner Besuch, also Tag + Uhrzeit
     mode 'stay'  — Betreuung über mehrere Tage, also Von–Bis im Kalender

   Die Seite ist statisch; einen Server, der Termine führt, gibt es nicht.
   Am Ende steht deshalb eine fertige Anfrage, die per WhatsApp oder E-Mail
   rausgeht. Verbindlich wird sie mit Veronikas Antwort — die Oberfläche
   sagt das an jeder Stelle auch so.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var CFG  = window.BOOKING_CONFIG;
  var root = document.getElementById('booking');
  if (!CFG || !root) return;

  var DAY_NAMES   = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                     'August', 'September', 'Oktober', 'November', 'Dezember'];

  var state = {
    step: 1,
    service: null,
    date: null,    // 'YYYY-MM-DD' — einzelner Besuch
    time: null,    // 'HH:MM'
    from: null,    // 'YYYY-MM-DD' — Betreuung über mehrere Tage
    to: null,
    month: null
  };

  /* --- Datum und Uhrzeit ------------------------------------------------- */

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

  function hhmm(mins) { return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60); }

  function weekday(d) { return d.getDay() === 0 ? 7 : d.getDay(); }

  function longDate(isoStr) {
    var d = fromIso(isoStr);
    return DAY_NAMES[weekday(d) - 1] + ', ' + d.getDate() + '. ' +
           MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
  }

  function shortDate(isoStr) {
    var d = fromIso(isoStr);
    return d.getDate() + '. ' + MONTH_NAMES[d.getMonth()].slice(0, 3) + '.';
  }

  function startOfToday() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function horizonEnd() {
    var d = startOfToday();
    d.setDate(d.getDate() + CFG.horizonDays);
    return d;
  }

  function earliestStart() {
    return new Date(Date.now() + CFG.leadTimeHours * 3600000);
  }

  function daysBetween(a, b) {
    return Math.round((fromIso(b) - fromIso(a)) / 86400000) + 1;
  }

  function serviceById(id) {
    for (var i = 0; i < CFG.services.length; i++) {
      if (CFG.services[i].id === id) return CFG.services[i];
    }
    return null;
  }

  function isStay() { return !!state.service && state.service.mode === 'stay'; }

  /* --- Verfügbarkeit ------------------------------------------------------ */

  /** Tag fällt komplett aus: Urlaub oder laufende Betreuung bei einem Tier. */
  function dayOff(isoStr) {
    return (CFG.closedDates || []).indexOf(isoStr) > -1 ||
           (CFG.bookedDays  || []).indexOf(isoStr) > -1;
  }

  function inRange(isoStr) {
    var d = fromIso(isoStr);
    return d >= startOfToday() && d <= horizonEnd();
  }

  function blockedRanges(isoStr) {
    var raw = (CFG.bookedSlots && CFG.bookedSlots[isoStr]) || [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var entry = String(raw[i]);
      if (entry.indexOf('-') > -1) {
        var p = entry.split('-');
        out.push([minutes(p[0].trim()), minutes(p[1].trim())]);
      } else {
        var s = minutes(entry.trim());
        out.push([s, s + CFG.slotStepMinutes]);
      }
    }
    return out;
  }

  function overlaps(start, end, ranges) {
    for (var i = 0; i < ranges.length; i++) {
      if (start < ranges[i][1] && end > ranges[i][0]) return true;
    }
    return false;
  }

  /** Freie Startzeiten eines Tages für die gewählte Besuchsart. */
  function slotsFor(isoStr, service) {
    if (!service || service.mode !== 'visit') return [];
    if (dayOff(isoStr) || !inRange(isoStr)) return [];

    var day     = fromIso(isoStr);
    var windows = CFG.visitHours[weekday(day)] || [];
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

  /** Ist der Tag im Kalender anklickbar? */
  function dayAvailable(isoStr) {
    if (!state.service) return false;
    if (!inRange(isoStr) || dayOff(isoStr)) return false;
    if (isStay()) {
      // Für eine Betreuung zählt nur, dass der Tag überhaupt frei ist;
      // der erste Tag muss ausserdem die Vorlaufzeit einhalten.
      var end = new Date(fromIso(isoStr).getTime() + 86399000);
      return end >= earliestStart();
    }
    return slotsFor(isoStr, state.service).length > 0;
  }

  /** Liegt zwischen zwei Tagen ein gesperrter Tag? */
  function rangeHasGap(a, b) {
    var d = fromIso(a);
    var end = fromIso(b);
    while (d <= end) {
      if (dayOff(iso(d))) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  }

  /* --- Schritt 1: Leistung ------------------------------------------------ */

  var serviceList = root.querySelector('[data-services]');

  function renderServices() {
    var html = '';
    for (var i = 0; i < CFG.services.length; i++) {
      var s = CFG.services[i];
      var meta = s.mode === 'stay' ? s.price : s.duration + ' Min · ' + s.price;
      html +=
        '<li>' +
          '<button type="button" class="svc" data-service="' + s.id + '"' +
                  ' aria-pressed="' + (state.service && state.service.id === s.id) + '">' +
            '<span class="svc__name">' + s.name + '</span>' +
            '<span class="svc__meta mono">' + meta + '</span>' +
            '<span class="svc__desc">' + s.desc + '</span>' +
          '</button>' +
        '</li>';
    }
    serviceList.innerHTML = html;
  }

  serviceList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-service]');
    if (!btn) return;
    pickService(serviceById(btn.getAttribute('data-service')));
  });

  function pickService(svc) {
    if (!svc) return;
    state.service = svc;
    state.date = null; state.time = null; state.from = null; state.to = null;
    root.querySelector('[data-mode-visit]').hidden = svc.mode !== 'visit';
    root.querySelector('[data-mode-stay]').hidden  = svc.mode !== 'stay';
    renderServices();
    renderCalendar();
    renderSlots();
    renderStay();
    goTo(2);
  }

  /* --- Schritt 2: Kalender ------------------------------------------------ */

  var calGrid  = root.querySelector('[data-calendar]');
  var calLabel = root.querySelector('[data-month-label]');
  var prevBtn  = root.querySelector('[data-prev-month]');
  var nextBtn  = root.querySelector('[data-next-month]');
  var slotWrap = root.querySelector('[data-slots]');
  var slotHead = root.querySelector('[data-slots-head]');
  var stayInfo = root.querySelector('[data-stay-info]');
  var stayHint = root.querySelector('[data-stay-hint]');

  function monthStart(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }

  function inSelectedRange(key) {
    if (!isStay() || !state.from) return false;
    if (!state.to) return key === state.from;
    return key >= state.from && key <= state.to;
  }

  function renderCalendar() {
    if (!state.month) state.month = monthStart(startOfToday());

    var first = state.month;
    var year  = first.getFullYear();
    var month = first.getMonth();
    var lead  = weekday(first) - 1;
    var days  = new Date(year, month + 1, 0).getDate();
    var today = startOfToday();
    var limit = horizonEnd();

    calLabel.textContent = MONTH_NAMES[month] + ' ' + year;

    var html = '';
    for (var i = 0; i < DAY_NAMES.length; i++) {
      html += '<span class="cal__dow mono" aria-hidden="true">' + DAY_NAMES[i] + '</span>';
    }
    for (var l = 0; l < lead; l++) html += '<span></span>';

    for (var d = 1; d <= days; d++) {
      var key  = iso(new Date(year, month, d));
      var free = dayAvailable(key);
      var cls  = 'cal__day';
      if (key === state.date) cls += ' is-selected';
      if (isStay()) {
        if (key === state.from || key === state.to) cls += ' is-selected';
        else if (inSelectedRange(key)) cls += ' is-between';
      }
      if (key === iso(today)) cls += ' is-today';

      html += '<button type="button" class="' + cls + '" data-date="' + key + '"' +
              (free ? '' : ' disabled') +
              ' aria-label="' + longDate(key) + (free ? '' : ' – nicht verfügbar') + '">' +
              d + '</button>';
    }

    calGrid.innerHTML = html;
    prevBtn.disabled = monthStart(today) >= first;
    nextBtn.disabled = new Date(year, month + 1, 1) > limit;
  }

  prevBtn.addEventListener('click', function () {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
    renderCalendar();
  });
  nextBtn.addEventListener('click', function () {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
    renderCalendar();
  });

  calGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-date]');
    if (!btn || btn.disabled) return;
    var key = btn.getAttribute('data-date');

    if (!isStay()) {
      state.date = key;
      state.time = null;
      renderCalendar();
      renderSlots();
      return;
    }

    // Betreuung über mehrere Tage: erster Klick = Anreise, zweiter = Abreise.
    if (!state.from || state.to || key < state.from) {
      state.from = key; state.to = null;
      stayHint.hidden = true;
    } else if (key === state.from) {
      state.to = key;
    } else if (rangeHasGap(state.from, key)) {
      stayHint.hidden = false;      // in der Mitte liegt ein belegter Tag
      renderCalendar();
      return;
    } else {
      state.to = key;
      stayHint.hidden = true;
    }
    renderCalendar();
    renderStay();
  });

  function renderSlots() {
    if (isStay()) return;
    if (!state.service) {
      slotHead.textContent = 'Bitte zuerst eine Leistung wählen.';
      slotWrap.innerHTML = '';
      return;
    }
    if (!state.date) {
      slotHead.textContent = 'Tag wählen — die freien Zeiten erscheinen hier.';
      slotWrap.innerHTML = '';
      return;
    }

    var slots = slotsFor(state.date, state.service);
    slotHead.textContent = longDate(state.date) +
      (slots.length ? ' · ' + slots.length + ' freie Zeiten' : ' · nichts mehr frei');

    var html = '';
    for (var i = 0; i < slots.length; i++) {
      var end = hhmm(minutes(slots[i]) + state.service.duration);
      html += '<button type="button" class="slot' + (slots[i] === state.time ? ' is-selected' : '') +
              '" data-time="' + slots[i] + '" aria-pressed="' + (slots[i] === state.time) + '">' +
                '<span class="slot__time mono">' + slots[i] + '</span>' +
                '<span class="slot__end mono">bis ' + end + '</span>' +
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

  function renderStay() {
    if (!isStay()) return;
    if (!state.from) {
      stayInfo.innerHTML = '<p class="muted">Ersten Tag anklicken, dann den letzten — die Tage dazwischen füllen sich.</p>';
      return;
    }
    if (!state.to) {
      stayInfo.innerHTML = '<p><strong>Ab ' + longDate(state.from) + '</strong><br>' +
        '<span class="muted">Jetzt den letzten Tag anklicken.</span></p>';
      return;
    }
    var tage = daysBetween(state.from, state.to);
    stayInfo.innerHTML =
      '<p class="stay-range"><strong>' + shortDate(state.from) + ' – ' + shortDate(state.to) + '</strong></p>' +
      '<p class="mono muted">' + tage + (tage === 1 ? ' Tag' : ' Tage') + ' · ' + state.service.price + '</p>' +
      '<p><button type="button" class="btn btn--ghost btn--small" data-next-step="3">Weiter</button></p>';
  }

  /* --- Schritt 3: Tier und Zuhause ---------------------------------------- */

  var petForm  = root.querySelector('[data-pet-form]');
  var petErr   = root.querySelector('[data-pet-error]');
  var visitBox = root.querySelector('[data-visits-field]');

  function renderChoices() {
    var visits = root.querySelector('[data-visits]');
    var keys   = root.querySelector('[data-keys]');
    var v = '', k = '';
    for (var i = 0; i < CFG.visitsPerDay.length; i++) {
      var o = CFG.visitsPerDay[i];
      v += '<option value="' + o.label + '">' + o.label + '</option>';
    }
    for (var j = 0; j < CFG.keyOptions.length; j++) {
      k += '<option value="' + CFG.keyOptions[j].label + '">' + CFG.keyOptions[j].label + '</option>';
    }
    visits.innerHTML = v;
    keys.innerHTML = k;
  }

  function petValues() {
    var f = petForm.elements;
    return {
      art:    (f.art.value || '').trim(),
      tier:   f.tier.value.trim(),
      alter:  f.alter.value.trim(),
      notes:  f.notes.value.trim(),
      ort:    f.ort.value.trim(),
      visits: visitBox.hidden ? '' : f.visits.value,
      key:    f.key.value
    };
  }

  petForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = petValues();
    if (!v.art)  return fail(petErr, 'Bitte sagen Sie, wer betreut werden soll.');
    if (!v.tier) return fail(petErr, 'Bitte tragen Sie den Namen des Tieres ein.');
    if (!v.ort)  return fail(petErr, 'Bitte nennen Sie Straße und Ort — sonst weiß ich nicht, wohin.');
    petErr.hidden = true;
    goTo(4);
  });

  function fail(box, msg) {
    box.textContent = msg;
    box.hidden = false;
  }

  /* --- Schritt 4: Kontakt -------------------------------------------------- */

  var form    = root.querySelector('[data-booking-form]');
  var summary = root.querySelector('[data-summary]');
  var errBox  = root.querySelector('[data-form-error]');
  var doneSum = root.querySelector('[data-done-summary]');

  function timeLine() {
    if (isStay()) {
      var tage = daysBetween(state.from, state.to);
      return longDate(state.from) + ' bis ' + longDate(state.to) +
             ' (' + tage + (tage === 1 ? ' Tag' : ' Tage') + ')';
    }
    return longDate(state.date) + ', ' + state.time + ' – ' +
           hhmm(minutes(state.time) + state.service.duration) + ' Uhr';
  }

  function renderSummary() {
    var p = petValues();
    var rows = [
      ['Leistung', state.service.name],
      ['Zeit', timeLine()],
      ['Preis', state.service.price],
      ['Tier', p.art + (p.tier ? ' · ' + p.tier : '') + (p.alter ? ' · ' + p.alter : '')],
      ['Zuhause', p.ort],
      ['Schlüssel', p.key]
    ];
    if (p.visits) rows.splice(3, 0, ['Rhythmus', p.visits]);

    var html = '<dl class="summary">';
    for (var i = 0; i < rows.length; i++) {
      html += '<div><dt>' + rows[i][0] + '</dt><dd>' + esc(rows[i][1]) + '</dd></div>';
    }
    summary.innerHTML = html + '</dl>';
  }

  function esc(s) {
    return String(s).replace(/[<>&]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
    });
  }

  function values() {
    return {
      name:    form.elements.name.value.trim(),
      phone:   form.elements.phone.value.trim(),
      email:   form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      consent: form.elements.consent.checked
    };
  }

  function validate(v) {
    if (!v.name)               return 'Bitte tragen Sie Ihren Namen ein.';
    if (!v.phone && !v.email)  return 'Bitte hinterlassen Sie eine Telefonnummer oder eine E-Mail-Adresse.';
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))
                               return 'Diese E-Mail-Adresse sieht nicht vollständig aus.';
    if (!v.consent)            return 'Bitte bestätigen Sie den Hinweis zum Datenschutz.';
    return null;
  }

  function requestText(v) {
    var p = petValues();
    var lines = [
      'Anfrage Tierbetreuung',
      '',
      'Leistung: ' + state.service.name + ' (' + state.service.price + ')',
      'Zeit: ' + timeLine()
    ];
    if (p.visits) lines.push('Rhythmus: ' + p.visits);
    lines.push('', 'Tier: ' + p.art + (p.tier ? ', ' + p.tier : '') + (p.alter ? ', ' + p.alter : ''));
    if (p.notes) lines.push('Besonderheiten: ' + p.notes);
    lines.push('Zuhause: ' + p.ort);
    lines.push('Schlüssel: ' + p.key);
    lines.push('', 'Name: ' + v.name);
    if (v.phone) lines.push('Telefon: ' + v.phone);
    if (v.email) lines.push('E-Mail: ' + v.email);
    if (v.message) lines.push('', 'Nachricht: ' + v.message);
    return lines.join('\n');
  }

  function icsFile() {
    var stamp = function (x) {
      return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' +
             pad(x.getHours()) + pad(x.getMinutes()) + '00';
    };
    var dstamp = function (isoStr, plusDays) {
      var d = fromIso(isoStr);
      d.setDate(d.getDate() + (plusDays || 0));
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    };
    var p = petValues();
    var head = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//' + CFG.contact.name + '//Tierbetreuung//DE',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@tierbetreuung',
      'DTSTAMP:' + stamp(new Date())
    ];
    var body;
    if (isStay()) {
      // ganztägig; DTEND ist bei ganztägigen Terminen der Folgetag
      body = ['DTSTART;VALUE=DATE:' + dstamp(state.from),
              'DTEND;VALUE=DATE:'   + dstamp(state.to, 1)];
    } else {
      var d = fromIso(state.date);
      var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(),
                           +state.time.split(':')[0], +state.time.split(':')[1]);
      var end = new Date(start.getTime() + state.service.duration * 60000);
      body = ['DTSTART:' + stamp(start), 'DTEND:' + stamp(end)];
    }
    return head.concat(body, [
      'SUMMARY:' + state.service.name + (p.tier ? ' für ' + p.tier : '') + ' — ' + CFG.contact.name,
      'LOCATION:' + p.ort,
      'DESCRIPTION:Anfrage – verbindlich erst nach Bestätigung.',
      'END:VEVENT', 'END:VCALENDAR'
    ]).join('\r\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = values();
    var msg = validate(v);
    if (msg) return fail(errBox, msg);
    errBox.hidden = true;

    if (CFG.formEndpoint) {
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          service: state.service.name,
          from: state.from || state.date,
          to: state.to || state.date,
          time: state.time || '',
          pet: petValues(),
          name: v.name, phone: v.phone, email: v.email, message: v.message,
          text: requestText(v)
        })
      })['catch'](function () { /* WhatsApp und E-Mail bleiben als Weg */ })
       .then(function () { btn.disabled = false; showDone(v); });
      return;
    }
    showDone(v);
  });

  function showDone(v) {
    var text = requestText(v);
    doneSum.innerHTML = '<pre class="request">' + esc(text) + '</pre>';

    root.querySelector('[data-send-whatsapp]').href =
      'https://wa.me/' + CFG.contact.whatsapp + '?text=' + encodeURIComponent(text);
    root.querySelector('[data-send-mail]').href =
      'mailto:' + CFG.contact.email +
      '?subject=' + encodeURIComponent('Anfrage Tierbetreuung — ' + state.service.name) +
      '&body=' + encodeURIComponent(text);

    var ics = root.querySelector('[data-download-ics]');
    if (ics.dataset.url) URL.revokeObjectURL(ics.dataset.url);
    var url = URL.createObjectURL(new Blob([icsFile()], { type: 'text/calendar' }));
    ics.href = url;
    ics.dataset.url = url;
    ics.download = 'betreuung-' + (state.from || state.date) + '.ics';

    goTo(5);
  }

  /* --- Schrittwechsel ------------------------------------------------------ */

  var panels = root.querySelectorAll('[data-step]');
  var rail   = root.querySelectorAll('[data-rail-step]');
  var live   = root.querySelector('[data-live]');
  var TITLES = {
    1: 'Schritt 1 von 4: Leistung',
    2: 'Schritt 2 von 4: Zeit',
    3: 'Schritt 3 von 4: Tier und Zuhause',
    4: 'Schritt 4 von 4: Kontakt',
    5: 'Anfrage bereit zum Versenden'
  };

  function goTo(step) {
    if (step === 3) visitBox.hidden = !isStay();
    if (step === 4) renderSummary();

    state.step = step;
    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden = +panels[i].getAttribute('data-step') !== step;
    }
    for (var r = 0; r < rail.length; r++) {
      var n = +rail[r].getAttribute('data-rail-step');
      rail[r].classList.toggle('is-active', n === step);
      rail[r].classList.toggle('is-done', n < step);
    }
    live.textContent = TITLES[step] || '';

    if (step > 1) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: top, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  root.addEventListener('click', function (e) {
    var back = e.target.closest('[data-back]');
    if (back) goTo(+back.getAttribute('data-back'));

    var next = e.target.closest('[data-next-step]');
    if (next) goTo(+next.getAttribute('data-next-step'));

    if (e.target.closest('[data-restart]')) {
      state.service = null; state.date = null; state.time = null;
      state.from = null; state.to = null;
      form.reset(); petForm.reset();
      renderServices(); renderCalendar(); renderSlots();
      goTo(1);
    }
  });

  /* --- Start ---------------------------------------------------------------*/

  renderChoices();
  renderServices();
  renderCalendar();
  renderSlots();
  goTo(1);

  // Die Leistungskarten weiter oben auf der Seite springen direkt in Schritt 2.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-book-service]');
    if (!link) return;
    var svc = serviceById(link.getAttribute('data-book-service'));
    if (!svc) return;
    e.preventDefault();
    pickService(svc);
  });
})();
