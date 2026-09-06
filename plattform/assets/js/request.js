/* ---------------------------------------------------------------------------
   Anfrage einer Tierhalterin in vier Schritten: Leistung, Wann, Tier und
   Zuhause, Kontakt. Anders als bei einer einzelnen Betreuerin gibt es hier
   keinen Kalender mit freien Zeiten — die Plattform sucht nach der Anfrage
   die passende Person. Gefragt wird deshalb nach Wunschzeiten:
     once   = ein Tag + Zeitfenster
     weekly = Wochentage + Zeitfenster + Start
     stay   = Zeitraum von–bis
   Die fertige Anfrage geht per WhatsApp oder E-Mail raus, optional
   zusätzlich als JSON an PLATFORM.formEndpoint.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var P    = window.PLATFORM;
  var root = document.getElementById('request');
  if (!P || !root) return;

  var DAYS  = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var LONG  = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var MONTH = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
               'August', 'September', 'Oktober', 'November', 'Dezember'];

  var state = { step: 1, service: null, rhythm: 'once' };

  /* --- Helfer --------------------------------------------------------------*/

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(s) {
    var d = fromIso(s);
    return LONG[(d.getDay() + 6) % 7] + ', ' + d.getDate() + '. ' + MONTH[d.getMonth()] + ' ' + d.getFullYear();
  }
  function esc(s) {
    return String(s).replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; });
  }
  function fail(box, msg) { box.textContent = msg; box.hidden = false; }
  function $(sel) { return root.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function minDate() {
    var d = new Date(Date.now() + P.leadTimeHours * 3600000);
    return iso(d);
  }
  function maxDate() {
    var d = new Date(); d.setDate(d.getDate() + P.horizonDays);
    return iso(d);
  }

  function serviceById(id) {
    for (var i = 0; i < P.services.length; i++) if (P.services[i].id === id) return P.services[i];
    return null;
  }

  /* --- Schritt 1: Leistung ---------------------------------------------------*/

  var list = $('[data-services]');

  function renderServices() {
    list.innerHTML = P.services.map(function (s) {
      return '<li><button type="button" class="pick" data-service="' + s.id + '"' +
             ' aria-pressed="' + (state.service && state.service.id === s.id) + '">' +
               '<span class="pick__name">' + s.name + '</span>' +
               '<span class="pick__price">' + s.price + '</span>' +
               '<span class="pick__desc">' + s.desc + '</span>' +
             '</button></li>';
    }).join('');
  }

  list.addEventListener('click', function (e) {
    var b = e.target.closest('[data-service]');
    if (b) pickService(serviceById(b.getAttribute('data-service')));
  });

  function pickService(svc) {
    if (!svc) return;
    state.service = svc;
    state.rhythm  = svc.id === 'urlaub' ? 'stay' : 'once';
    renderServices();
    renderWhen();
    goTo(2);
  }

  /* --- Schritt 2: Wann ---------------------------------------------------------*/

  var whenBox   = $('[data-when]');
  var rhythmBox = $('[data-rhythm]');
  var whenErr   = $('[data-when-error]');

  function chips(name, items, multi) {
    return '<div class="chips">' + items.map(function (it) {
      return '<label class="chip"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name +
             '" value="' + it.value + '"><span>' + it.label +
             (it.sub ? '<small>' + it.sub + '</small>' : '') + '</span></label>';
    }).join('') + '</div>';
  }

  function windowChips(name, multi) {
    return chips(name, P.windows.map(function (w) {
      return { value: w.label, label: w.label, sub: w.hours };
    }), multi);
  }

  function renderWhen() {
    var svc = state.service;
    var canRepeat = svc.id !== 'urlaub' && svc.id !== 'kennen';

    rhythmBox.hidden = !canRepeat;
    if (canRepeat) {
      rhythmBox.innerHTML = chips('rhythm', [
        { value: 'once',   label: 'Einmalig' },
        { value: 'weekly', label: 'Regelmäßig', sub: 'feste Wochentage' }
      ]);
      rhythmBox.querySelector('[value="' + state.rhythm + '"]').checked = true;
    }

    var html = '';
    if (state.rhythm === 'stay') {
      html =
        '<div class="field-grid">' +
          '<p class="field"><label for="w-from">Erster Tag</label>' +
            '<input id="w-from" name="from" type="date" min="' + minDate() + '" max="' + maxDate() + '"></p>' +
          '<p class="field"><label for="w-to">Letzter Tag</label>' +
            '<input id="w-to" name="to" type="date" min="' + minDate() + '" max="' + maxDate() + '"></p>' +
          '<p class="field field--wide"><label for="w-visits">Besuche pro Tag</label>' +
            '<select id="w-visits" name="visits">' +
              '<option>2 Besuche pro Tag (morgens und abends)</option>' +
              '<option>1 Besuch pro Tag</option>' +
              '<option>3 Besuche pro Tag</option>' +
            '</select></p>' +
        '</div>';
    } else if (state.rhythm === 'weekly') {
      html =
        '<fieldset class="choice"><legend>An welchen Tagen?</legend>' +
          chips('days', DAYS.map(function (d, i) { return { value: LONG[i], label: d }; }), true) +
        '</fieldset>' +
        '<fieldset class="choice"><legend>In welchem Zeitfenster?</legend>' + windowChips('window', false) + '</fieldset>' +
        '<p class="field"><label for="w-start">Ab wann?</label>' +
          '<input id="w-start" name="start" type="date" min="' + minDate() + '" max="' + maxDate() + '"></p>';
    } else {
      html =
        '<p class="field"><label for="w-date">Welcher Tag?</label>' +
          '<input id="w-date" name="date" type="date" min="' + minDate() + '" max="' + maxDate() + '"></p>' +
        '<fieldset class="choice"><legend>In welchem Zeitfenster?</legend>' + windowChips('window', false) + '</fieldset>';
    }
    whenBox.innerHTML = html;
    whenErr.hidden = true;
  }

  rhythmBox.addEventListener('change', function (e) {
    if (e.target.name === 'rhythm') { state.rhythm = e.target.value; renderWhen(); }
  });

  function checked(name) {
    return $$('input[name="' + name + '"]:checked').map(function (i) { return i.value; });
  }
  function val(name) {
    var el = root.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  /** Liest Schritt 2 aus und liefert eine lesbare Zeile — oder eine Fehlermeldung. */
  function whenSummary() {
    if (state.rhythm === 'stay') {
      var from = val('from'), to = val('to');
      if (!from || !to)      return { error: 'Bitte ersten und letzten Tag angeben.' };
      if (to < from)         return { error: 'Der letzte Tag liegt vor dem ersten.' };
      if (from < minDate())  return { error: 'Bitte mindestens ' + P.leadTimeHours + ' Stunden Vorlauf einplanen — bei Eile lieber anrufen.' };
      var days = Math.round((fromIso(to) - fromIso(from)) / 86400000) + 1;
      return { text: longDate(from) + ' bis ' + longDate(to) + ' (' + days + (days === 1 ? ' Tag' : ' Tage') + '), ' + val('visits') };
    }
    if (state.rhythm === 'weekly') {
      var days2 = checked('days'), win = checked('window')[0], start = val('start');
      if (!days2.length) return { error: 'Bitte mindestens einen Wochentag wählen.' };
      if (!win)          return { error: 'Bitte ein Zeitfenster wählen.' };
      if (!start)        return { error: 'Bitte sagen Sie, ab wann es losgehen soll.' };
      if (start < minDate()) return { error: 'Der Start liegt zu nah — bitte ' + P.leadTimeHours + ' Stunden Vorlauf.' };
      return { text: 'Regelmäßig ' + days2.join(', ') + ' · ' + win + ' · ab ' + longDate(start) };
    }
    var date = val('date'), win2 = checked('window')[0];
    if (!date) return { error: 'Bitte einen Tag wählen.' };
    if (!win2) return { error: 'Bitte ein Zeitfenster wählen.' };
    if (date < minDate()) return { error: 'Bitte mindestens ' + P.leadTimeHours + ' Stunden Vorlauf einplanen — bei Eile lieber anrufen.' };
    return { text: longDate(date) + ' · ' + win2 };
  }

  $('[data-when-next]').addEventListener('click', function () {
    var w = whenSummary();
    if (w.error) return fail(whenErr, w.error);
    whenErr.hidden = true;
    state.when = w.text;
    goTo(3);
  });

  /* --- Schritt 3: Tier und Zuhause -------------------------------------------*/

  var petForm = $('[data-pet-form]');
  var petErr  = $('[data-pet-error]');

  $('[data-areas]').innerHTML = P.areas.map(function (a) { return '<option>' + a + '</option>'; }).join('');
  $('[data-keys]').innerHTML  = P.keyOptions.map(function (k) { return '<option>' + k + '</option>'; }).join('');

  function pet() {
    var f = petForm.elements;
    return {
      art:   f.art.value, tier: f.tier.value.trim(), alter: f.alter.value.trim(),
      notes: f.notes.value.trim(), street: f.street.value.trim(), area: f.area.value, key: f.key.value
    };
  }

  petForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = pet();
    if (!p.art)    return fail(petErr, 'Bitte sagen Sie, wer betreut werden soll.');
    if (!p.tier)   return fail(petErr, 'Bitte den Namen des Tieres eintragen.');
    if (!p.street) return fail(petErr, 'Bitte Straße und Hausnummer angeben — wir ordnen danach die Betreuung zu.');
    petErr.hidden = true;
    goTo(4);
  });

  /* --- Schritt 4: Kontakt -------------------------------------------------------*/

  var form    = $('[data-contact-form]');
  var errBox  = $('[data-form-error]');
  var summary = $('[data-summary]');
  var doneSum = $('[data-done-summary]');

  function renderSummary() {
    var p = pet();
    var rows = [
      ['Leistung', state.service.name + ' · ' + state.service.price],
      ['Wann', state.when],
      ['Tier', p.art + ' · ' + p.tier + (p.alter ? ' · ' + p.alter : '')],
      ['Zuhause', p.street + ', ' + p.area],
      ['Schlüssel', p.key]
    ];
    summary.innerHTML = '<dl class="summary">' + rows.map(function (r) {
      return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }

  function contact() {
    var f = form.elements;
    return { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
             message: f.message.value.trim(), consent: f.consent.checked };
  }

  function validate(c) {
    if (!c.name)              return 'Bitte tragen Sie Ihren Namen ein.';
    if (!c.phone && !c.email) return 'Bitte Telefonnummer oder E-Mail-Adresse hinterlassen.';
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) return 'Diese E-Mail-Adresse sieht nicht vollständig aus.';
    if (!c.consent)           return 'Bitte bestätigen Sie den Hinweis zum Datenschutz.';
    return null;
  }

  function requestText(c) {
    var p = pet();
    var lines = [
      'Anfrage über ' + P.brand,
      '',
      'Leistung: ' + state.service.name + ' (' + state.service.price + ')',
      'Wann: ' + state.when,
      '',
      'Tier: ' + p.art + ', ' + p.tier + (p.alter ? ', ' + p.alter : '')
    ];
    if (p.notes) lines.push('Besonderheiten: ' + p.notes);
    lines.push('Zuhause: ' + p.street + ', ' + p.area, 'Schlüssel: ' + p.key, '', 'Name: ' + c.name);
    if (c.phone)   lines.push('Telefon: ' + c.phone);
    if (c.email)   lines.push('E-Mail: ' + c.email);
    if (c.message) lines.push('', 'Nachricht: ' + c.message);
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = contact();
    var msg = validate(c);
    if (msg) return fail(errBox, msg);
    errBox.hidden = true;

    var finish = function () {
      var text = requestText(c);
      doneSum.innerHTML = '<pre class="request">' + esc(text) + '</pre>';
      $('[data-send-whatsapp]').href = 'https://wa.me/' + P.contact.whatsapp + '?text=' + encodeURIComponent(text);
      $('[data-send-mail]').href = 'mailto:' + P.contact.email +
        '?subject=' + encodeURIComponent('Anfrage ' + P.brand + ' — ' + state.service.name) +
        '&body=' + encodeURIComponent(text);
      goTo(5);
    };

    if (P.formEndpoint) {
      fetch(P.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ type: 'request', service: state.service.id, when: state.when, pet: pet(), contact: c, text: requestText(c) })
      })['catch'](function () {}).then(finish);
      return;
    }
    finish();
  });

  /* --- Schrittwechsel -----------------------------------------------------------*/

  var panels = $$('[data-step]');
  var rail   = $$('[data-rail-step]');
  var live   = $('[data-live]');
  var TITLES = { 1: 'Schritt 1 von 4: Leistung', 2: 'Schritt 2 von 4: Wann', 3: 'Schritt 3 von 4: Tier',
                 4: 'Schritt 4 von 4: Kontakt', 5: 'Anfrage bereit zum Versenden' };

  function goTo(step) {
    if (step === 4) renderSummary();
    state.step = step;
    panels.forEach(function (p) { p.hidden = +p.getAttribute('data-step') !== step; });
    rail.forEach(function (r) {
      var n = +r.getAttribute('data-rail-step');
      r.classList.toggle('is-active', n === step);
      r.classList.toggle('is-done', n < step);
    });
    live.textContent = TITLES[step] || '';
    if (step > 1) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  root.addEventListener('click', function (e) {
    var back = e.target.closest('[data-back]');
    if (back) goTo(+back.getAttribute('data-back'));
    if (e.target.closest('[data-restart]')) {
      state = { step: 1, service: null, rhythm: 'once' };
      petForm.reset(); form.reset();
      renderServices(); goTo(1);
    }
  });

  renderServices();
  goTo(1);

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-book-service]');
    if (!link) return;
    var svc = serviceById(link.getAttribute('data-book-service'));
    if (!svc) return;
    e.preventDefault();
    pickService(svc);
  });
})();
