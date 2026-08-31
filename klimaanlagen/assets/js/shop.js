/* ============================================================================
   ARKTIK — Filter und Sortierung der Produktübersicht
   Die Produktkarten stehen vollständig im HTML (wichtig für Suchmaschinen und
   für Besucher ohne JavaScript). Dieses Skript blendet nur ein und aus.
   ========================================================================= */
(function () {
  'use strict';

  var grid = document.querySelector('[data-product-grid]');
  if (!grid) { return; }

  var cards   = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
  var form    = document.querySelector('[data-filters]');
  var sortSel = document.querySelector('[data-sort]');
  var countEl = document.querySelector('[data-result-count]');
  var emptyEl = document.querySelector('[data-empty]');
  var resetBtn = document.querySelector('[data-filter-reset]');

  function checkedValues(name) {
    if (!form) { return []; }
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (i) { return i.value; });
  }

  function matches(card) {
    var kat = checkedValues('kategorie');
    if (kat.length && kat.indexOf(card.dataset.kategorie) === -1) { return false; }

    var mont = checkedValues('montage');
    if (mont.length && mont.indexOf(card.dataset.montage) === -1) { return false; }

    var raum = checkedValues('raum');
    if (raum.length) {
      var max = parseFloat(card.dataset.raumMax) || 0;
      var min = parseFloat(card.dataset.raumMin) || 0;
      var hit = raum.some(function (r) {
        if (r === 'klein')  { return min <= 25 && max >= 12; }
        if (r === 'mittel') { return min <= 45 && max >= 25; }
        if (r === 'gross')  { return max >= 45; }
        return true;
      });
      if (!hit) { return false; }
    }

    var preis = checkedValues('preis');
    if (preis.length) {
      var p = parseFloat(card.dataset.preis) || 0;
      var hitP = preis.some(function (r) {
        if (r === 'u500')     { return p < 500; }
        if (r === '500-900')  { return p >= 500 && p < 900; }
        if (r === 'ab900')    { return p >= 900; }
        return true;
      });
      if (!hitP) { return false; }
    }

    if (form && form.querySelector('input[name="wifi"]:checked') && card.dataset.wifi !== '1') { return false; }
    if (form && form.querySelector('input[name="heizen"]:checked') && card.dataset.heizen !== '1') { return false; }

    return true;
  }

  function sortCards(list) {
    var mode = sortSel ? sortSel.value : 'empfohlen';
    var sorted = list.slice();
    if (mode === 'preis-auf')  { sorted.sort(function (a, b) { return num(a, 'preis') - num(b, 'preis'); }); }
    if (mode === 'preis-ab')   { sorted.sort(function (a, b) { return num(b, 'preis') - num(a, 'preis'); }); }
    if (mode === 'leistung')   { sorted.sort(function (a, b) { return num(b, 'kw') - num(a, 'kw'); }); }
    if (mode === 'effizienz')  { sorted.sort(function (a, b) { return num(b, 'seer') - num(a, 'seer'); }); }
    if (mode === 'leise')      { sorted.sort(function (a, b) { return (num(a, 'db') || 999) - (num(b, 'db') || 999); }); }
    if (mode === 'empfohlen')  { sorted.sort(function (a, b) { return num(a, 'rang') - num(b, 'rang'); }); }
    return sorted;
  }

  function num(card, key) { return parseFloat(card.dataset[key]) || 0; }

  function apply() {
    var visible = 0;
    cards.forEach(function (card) {
      var show = matches(card);
      card.hidden = !show;
      if (show) { visible++; }
    });

    sortCards(cards).forEach(function (card) { grid.appendChild(card); });

    if (countEl) {
      countEl.textContent = visible === 1 ? '1 Gerät' : visible + ' Geräte';
    }
    if (emptyEl) { emptyEl.hidden = visible > 0; }

    syncUrl();
  }

  function syncUrl() {
    if (!form || !window.history || !window.history.replaceState) { return; }
    var params = new URLSearchParams();
    ['kategorie', 'montage', 'raum', 'preis'].forEach(function (name) {
      checkedValues(name).forEach(function (v) { params.append(name, v); });
    });
    if (sortSel && sortSel.value !== 'empfohlen') { params.set('sortierung', sortSel.value); }
    var qs = params.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  function readUrl() {
    if (!form) { return; }
    var params = new URLSearchParams(location.search);
    ['kategorie', 'montage', 'raum', 'preis'].forEach(function (name) {
      var values = params.getAll(name);
      form.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
        input.checked = values.indexOf(input.value) !== -1;
      });
    });
    if (sortSel && params.get('sortierung')) { sortSel.value = params.get('sortierung'); }
  }

  if (form) { form.addEventListener('change', apply); }
  if (sortSel) { sortSel.addEventListener('change', apply); }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
      if (sortSel) { sortSel.value = 'empfohlen'; }
      apply();
    });
  }

  readUrl();
  apply();
})();
