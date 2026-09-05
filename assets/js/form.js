/* Kontaktformular ohne Server.
   Ist am <form> ein data-endpoint gesetzt (z. B. Formspree, Netlify Function,
   eigener Endpunkt), werden die Felder als JSON dorthin geschickt. Ohne
   Endpunkt öffnet das Formular das Mailprogramm mit vorausgefülltem Text —
   so geht nie eine Anfrage verloren. Ein verstecktes Feld hält Bots fern. */
(function () {
  var form = document.querySelector('form.form');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var lang = function () { return document.documentElement.getAttribute('data-lang') || 'de'; };

  var T = {
    de: {
      sending: 'Ihre Nachricht wird gesendet …',
      ok: 'Vielen Dank. Wir haben Ihre Nachricht erhalten und melden uns in Kürze — auf Wunsch auch telefonisch.',
      mail: 'Ihr Mailprogramm öffnet sich mit der vorbereiteten Nachricht. Falls nicht: Schreiben Sie uns direkt an info@seelenfrieden-urnenrückführung.ch.',
      err: 'Das hat leider nicht geklappt. Bitte rufen Sie uns an oder schreiben Sie direkt an info@seelenfrieden-urnenrückführung.ch.',
      subject: 'Anfrage Urnenrückführung',
      labels: { name: 'Name', phone: 'Telefon', email: 'E-Mail', place: 'Ort des Todesfalls / Krematorium', when: 'Zeitrahmen', lang: 'Gewünschte Sprache', message: 'Nachricht', callback: 'Rückruf gewünscht' }
    },
    ru: {
      sending: 'Сообщение отправляется …',
      ok: 'Спасибо. Мы получили ваше сообщение и вскоре свяжемся с вами — по желанию по телефону.',
      mail: 'Откроется ваша почтовая программа с подготовленным письмом. Если нет — напишите нам напрямую: info@seelenfrieden-urnenrückführung.ch.',
      err: 'К сожалению, не получилось. Пожалуйста, позвоните нам или напишите напрямую: info@seelenfrieden-urnenrückführung.ch.',
      subject: 'Запрос: репатриация урны',
      labels: { name: 'Имя', phone: 'Телефон', email: 'E-mail', place: 'Место смерти / крематорий', when: 'Сроки', lang: 'Предпочтительный язык', message: 'Сообщение', callback: 'Прошу перезвонить' }
    }
  };

  function show(msg, isError) {
    if (!status) return;
    status.textContent = msg;
    status.classList.add('is-visible');
    status.classList.toggle('is-error', !!isError);
    status.setAttribute('role', isError ? 'alert' : 'status');
  }

  function collect() {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name === 'website') return;
      if (el.type === 'checkbox') data[el.name] = el.checked ? 'ja' : 'nein';
      else data[el.name] = el.value.trim();
    });
    data.sprache = lang();
    return data;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var t = T[lang()];
    if (form.website && form.website.value) { show(t.ok); return; }   /* Bot */
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var data = collect();
    var endpoint = form.dataset.endpoint;

    if (endpoint) {
      show(t.sending);
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        show(t.ok); form.reset();
      }).catch(function () { show(t.err, true); });
      return;
    }

    /* Ohne Endpunkt: Mailprogramm mit vorausgefülltem Text. */
    var lines = [];
    Object.keys(t.labels).forEach(function (k) {
      if (data[k]) lines.push(t.labels[k] + ': ' + data[k]);
    });
    var href = 'mailto:' + form.dataset.mailto +
      '?subject=' + encodeURIComponent(t.subject + (data.name ? ' — ' + data.name : '')) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    show(t.mail);
    window.location.href = href;
  });
})();
