/* ============================================================================
   ARKTIK — Kassenseite
   Schickt Artikelnummern und Mengen an die Serverfunktion, die daraus eine
   Stripe-Sitzung erzeugt. Preise werden bewusst NICHT mitgeschickt: Der Server
   schlägt sie im eigenen Katalog nach.
   ========================================================================= */
(function () {
  'use strict';

  var ENDPUNKT = '/.netlify/functions/checkout';
  var KEY = 'arktik.cart.v1';

  var form     = document.querySelector('[data-checkout-form]');
  var knopf    = document.querySelector('[data-checkout-submit]');
  var fehler   = document.querySelector('[data-checkout-error]');
  var fehlend  = document.querySelector('[data-checkout-missing]');

  /* --- Bestellnummer auf der Erfolgsseite -------------------------------- */
  var ref = document.querySelector('[data-order-ref]');
  if (ref) {
    var sitzung = new URLSearchParams(location.search).get('sitzung');
    if (sitzung) {
      ref.textContent = 'Vorgangsnummer: ' + sitzung.slice(0, 24) + '…';
      ref.hidden = false;
    }
    // Der Warenkorb hat seinen Zweck erfüllt.
    try { localStorage.removeItem(KEY); } catch (e) { /* privater Modus */ }
  }

  if (!form || !knopf) { return; }

  function warenkorb() {
    try {
      var roh = JSON.parse(localStorage.getItem(KEY) || '[]');
      return roh.filter(function (i) { return i && i.sku && i.qty > 0; })
                .map(function (i) { return { sku: i.sku, qty: i.qty }; });
    } catch (e) { return []; }
  }

  /* --- Formular nur bei gefülltem Warenkorb zeigen ----------------------- */
  var positionen = warenkorb();
  form.hidden = positionen.length === 0;

  /* --- Bestellschaltfläche erst nach Zustimmung freigeben ---------------- */
  var kaesten = form.querySelectorAll('[data-agb], [data-datenschutz]');
  function pruefeFreigabe() {
    var alle = Array.prototype.every.call(kaesten, function (k) { return k.checked; });
    var mail = form.querySelector('#k-mail');
    knopf.disabled = !alle || !mail.value || !mail.checkValidity();
  }
  form.addEventListener('change', pruefeFreigabe);
  form.addEventListener('input', pruefeFreigabe);
  pruefeFreigabe();

  function zeigeFehler(text) {
    if (!fehler) { return; }
    fehler.querySelector('span').textContent = text;
    fehler.hidden = false;
  }

  /* --- Bestellung auslösen ----------------------------------------------- */
  knopf.addEventListener('click', function () {
    var artikel = warenkorb();
    if (!artikel.length) { zeigeFehler('Ihr Warenkorb ist leer.'); return; }

    fehler.hidden = true;
    knopf.disabled = true;
    var beschriftung = knopf.textContent;
    knopf.textContent = 'Weiterleitung zu Stripe …';

    fetch(ENDPUNKT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        warenkorb: artikel,
        email: form.querySelector('#k-mail').value.trim(),
        land: form.querySelector('#k-land').value,
        notiz: form.querySelector('#k-notiz').value.trim()
      })
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) { throw new Error(d.fehler || 'Die Zahlung konnte nicht gestartet werden.'); }
          return d;
        });
      })
      .then(function (d) {
        if (!d.url) { throw new Error('Stripe hat keine Zahlungsadresse zurückgegeben.'); }
        window.location.href = d.url;
      })
      .catch(function (e) {
        knopf.textContent = beschriftung;
        knopf.disabled = false;
        // Fehlt die Serverfunktion ganz, ist der Hinweis hilfreicher als eine
        // technische Meldung.
        if (fehlend && /Failed to fetch|NetworkError|Unexpected token|404/i.test(e.message)) {
          fehlend.hidden = false;
        } else {
          zeigeFehler(e.message);
        }
      });
  });
})();
