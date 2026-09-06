/* ---------------------------------------------------------------------------
   Bewerbung von Studierenden. Eine Seite, ein Formular, am Ende ein fertiger
   Text für WhatsApp oder E-Mail — optional zusätzlich als JSON an
   PLATFORM.formEndpoint. Kein Server nötig.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var P    = window.PLATFORM;
  var root = document.getElementById('apply');
  if (!P || !root) return;

  var DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  function esc(s) {
    return String(s).replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; });
  }

  var form   = root.querySelector('[data-apply-form]');
  var errBox = root.querySelector('[data-form-error]');
  var done   = root.querySelector('[data-done]');
  var doneSum = root.querySelector('[data-done-summary]');

  root.querySelector('[data-unis]').innerHTML =
    P.universities.concat(['Andere Hochschule']).map(function (u) { return '<option>' + u + '</option>'; }).join('');
  root.querySelector('[data-areas]').innerHTML =
    P.areas.map(function (a) { return '<option>' + a + '</option>'; }).join('');
  root.querySelector('[data-days]').innerHTML = DAYS.map(function (d, i) {
    return '<label class="chip"><input type="checkbox" name="days" value="' + d + '"><span>' + SHORT[i] + '</span></label>';
  }).join('');
  root.querySelector('[data-windows]').innerHTML = P.windows.map(function (w) {
    return '<label class="chip"><input type="checkbox" name="windows" value="' + w.label + '"><span>' + w.label +
           '<small>' + w.hours + '</small></span></label>';
  }).join('');

  function checked(name) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (i) { return i.value; });
  }

  function values() {
    var f = form.elements;
    return {
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      uni: f.uni.value, semester: f.semester.value.trim(), area: f.area.value,
      animals: checked('animals'), days: checked('days'), windows: checked('windows'),
      experience: f.experience.value.trim(), record: f.record.checked, consent: f.consent.checked
    };
  }

  function validate(v) {
    if (!v.name)            return 'Bitte deinen Namen eintragen.';
    if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) return 'Bitte eine gültige E-Mail-Adresse angeben.';
    if (!v.animals.length)  return 'Mit welchen Tieren möchtest du arbeiten? Bitte mindestens eines anhaken.';
    if (!v.days.length)     return 'Bitte mindestens einen Tag angeben, an dem du Zeit hast.';
    if (!v.windows.length)  return 'Bitte mindestens ein Zeitfenster angeben.';
    if (!v.experience)      return 'Zwei, drei Sätze zu deiner Erfahrung mit Tieren wären gut — auch „bin mit Hund aufgewachsen“ zählt.';
    if (!v.consent)         return 'Bitte den Hinweis zum Datenschutz bestätigen.';
    return null;
  }

  function text(v) {
    return [
      'Bewerbung als Tierbetreuer:in bei ' + P.brand,
      '',
      'Name: ' + v.name,
      'E-Mail: ' + v.email,
      v.phone ? 'Telefon: ' + v.phone : null,
      'Hochschule: ' + v.uni + (v.semester ? ', ' + v.semester + '. Semester' : ''),
      'Wohnort: ' + v.area,
      '',
      'Tiere: ' + v.animals.join(', '),
      'Zeit: ' + v.days.join(', '),
      'Zeitfenster: ' + v.windows.join(', '),
      'Erweitertes Führungszeugnis: ' + (v.record ? 'kann ich vorlegen' : 'noch offen'),
      '',
      'Erfahrung: ' + v.experience
    ].filter(function (l) { return l !== null; }).join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = values();
    var msg = validate(v);
    if (msg) { errBox.textContent = msg; errBox.hidden = false; return; }
    errBox.hidden = true;

    var finish = function () {
      var t = text(v);
      doneSum.innerHTML = '<pre class="request">' + esc(t) + '</pre>';
      root.querySelector('[data-send-whatsapp]').href = 'https://wa.me/' + P.contact.whatsapp + '?text=' + encodeURIComponent(t);
      root.querySelector('[data-send-mail]').href = 'mailto:' + P.contact.email +
        '?subject=' + encodeURIComponent('Bewerbung ' + P.brand + ' — ' + v.name) + '&body=' + encodeURIComponent(t);
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (P.formEndpoint) {
      fetch(P.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ type: 'application', data: v, text: text(v) })
      })['catch'](function () {}).then(finish);
      return;
    }
    finish();
  });

  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-restart]')) {
      form.reset(); form.hidden = false; done.hidden = true;
    }
  });
})();
