/* ============================================================================
   ARKTIK — Kühllastrechner
   Vereinfachtes Verfahren in Anlehnung an VDI 2078 / DIN EN 12831-1.
   Es ersetzt keine Kühllastberechnung durch einen Fachplaner, liefert aber
   für Wohnräume eine belastbare Grössenordnung.
   ========================================================================= */
(function () {
  'use strict';

  var form = document.querySelector('[data-calc]');
  if (!form) { return; }

  var out = {
    kw:        document.querySelector('[data-out-kw]'),
    btu:       document.querySelector('[data-out-btu]'),
    grund:     document.querySelector('[data-out-grund]'),
    fenster:   document.querySelector('[data-out-fenster]'),
    personen:  document.querySelector('[data-out-personen]'),
    geraete:   document.querySelector('[data-out-geraete]'),
    reserve:   document.querySelector('[data-out-reserve]'),
    strom:     document.querySelector('[data-out-strom]'),
    empfehlung: document.querySelector('[data-out-empfehlung]')
  };

  /* Spezifische Grundlast in W je m³ Raumvolumen, nach Gebäudestandard.
     Enthält Transmission durch Aussenbauteile und Infiltration. */
  var DAEMMUNG = {
    neubau:    18,   // ab ca. 2002, gedämmt, dichte Fenster
    saniert:   26,   // nachträglich gedämmt oder Baujahr 1985–2002
    altbau:    36    // ungedämmt, Einfachverglasung oder alte Isolierverglasung
  };

  /* Solare Last je m² Fensterfläche nach Himmelsrichtung, in W. */
  var ORIENTIERUNG = {
    nord:  40,
    ost:   135,
    sued:  110,
    west:  165,
    dach:  230
  };

  /* Wirksamkeit der Verschattung als Restfaktor. */
  var VERSCHATTUNG = {
    keine:   1.0,
    innen:   0.72,   // Vorhang oder Innenjalousie
    aussen:  0.28    // Rollladen, Markise, aussenliegende Raffstore
  };

  function val(name) {
    var el = form.elements[name];
    if (!el) { return 0; }
    if (el.type === 'checkbox') { return el.checked ? 1 : 0; }
    return parseFloat(String(el.value).replace(',', '.')) || 0;
  }

  function radio(name, fallback) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : fallback;
  }

  function berechne() {
    var flaeche = Math.max(1, val('flaeche'));
    var hoehe   = Math.max(2, val('hoehe') || 2.5);
    var volumen = flaeche * hoehe;

    var daemmung = radio('daemmung', 'saniert');
    var grund = volumen * (DAEMMUNG[daemmung] || DAEMMUNG.saniert);

    var fensterFlaeche = Math.max(0, val('fenster'));
    var orient  = radio('orientierung', 'sued');
    var schatten = radio('verschattung', 'innen');
    var fenster = fensterFlaeche
      * (ORIENTIERUNG[orient] || ORIENTIERUNG.sued)
      * (VERSCHATTUNG[schatten] || 1);

    var personen = Math.max(0, val('personen')) * 95;   // sitzende Tätigkeit
    var geraete  = Math.max(0, val('geraete'));         // Watt, direkt eingegeben

    /* Zuschläge */
    var zuschlag = 1;
    if (form.elements.dachgeschoss && form.elements.dachgeschoss.checked) { zuschlag += 0.18; }
    if (form.elements.kueche && form.elements.kueche.checked) { zuschlag += 0.10; }

    var summe = (grund + fenster + personen + geraete) * zuschlag;
    var reserve = summe * 0.10;                          // Sicherheitszuschlag
    var gesamt = summe + reserve;

    return {
      grund: grund * zuschlag,
      fenster: fenster * zuschlag,
      personen: personen * zuschlag,
      geraete: geraete * zuschlag,
      reserve: reserve,
      gesamt: gesamt
    };
  }

  function w(v) { return Math.round(v) + ' W'; }

  function render() {
    var r = berechne();
    var kw = r.gesamt / 1000;

    if (out.kw)  { out.kw.textContent = kw.toFixed(1).replace('.', ','); }
    if (out.btu) { out.btu.textContent = new Intl.NumberFormat('de-DE').format(Math.round(kw * 3412 / 100) * 100); }
    if (out.grund)    { out.grund.textContent = w(r.grund); }
    if (out.fenster)  { out.fenster.textContent = w(r.fenster); }
    if (out.personen) { out.personen.textContent = w(r.personen); }
    if (out.geraete)  { out.geraete.textContent = w(r.geraete); }
    if (out.reserve)  { out.reserve.textContent = w(r.reserve); }

    /* Stromkosten: Kühlleistung / SEER × Betriebsstunden × Strompreis.
       Annahme 350 Betriebsstunden pro Sommer, SEER 7,0, 0,35 €/kWh. */
    if (out.strom) {
      var kosten = (kw / 7.0) * 350 * 0.35;
      out.strom.textContent = new Intl.NumberFormat('de-DE', {
        style: 'currency', currency: 'EUR', maximumFractionDigits: 0
      }).format(kosten);
    }

    empfehle(kw);
  }

  function empfehle(kw) {
    if (!out.empfehlung) { return; }
    var produkte = window.ARKTIK_PRODUKTE || [];
    var passend = produkte
      .filter(function (p) { return p.kw >= kw * 0.92; })
      .sort(function (a, b) { return a.kw - b.kw || a.preis - b.preis; })
      .slice(0, 3);

    if (!passend.length) {
      out.empfehlung.innerHTML =
        '<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>' +
        '<div><b>Über unserem Standardsortiment</b>Für mehr als 8 kW Kühllast planen wir die Anlage individuell. ' +
        'Schreiben Sie uns die Werte aus diesem Rechner – wir melden uns mit einem Vorschlag.</div></div>';
      return;
    }

    var root = document.body.dataset.root || '';
    out.empfehlung.innerHTML =
      '<h3 class="mt-0">Passende Geräte</h3>' +
      '<div class="product-grid">' + passend.map(function (p) {
        return '<article class="product-card">' +
          '<a class="thumb" href="' + root + p.url + '" tabindex="-1" aria-hidden="true">' +
            '<img src="' + root + p.img + '" alt="" loading="lazy" width="320" height="240">' +
          '</a>' +
          '<div class="body">' +
            '<h3><a href="' + root + p.url + '">' + p.name + '</a></h3>' +
            '<p class="sub">' + p.kurz + '</p>' +
            '<div class="price-row"><span class="price">' +
              new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.preis) +
            '</span></div>' +
          '</div>' +
        '</article>';
      }).join('') + '</div>';
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  render();
})();
