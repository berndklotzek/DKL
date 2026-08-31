/* ============================================================================
   ARKTIK — Basisverhalten der Seite
   Kein Framework, keine externen Abhängigkeiten. Alles, was hier passiert,
   ist Progressive Enhancement: Ohne JavaScript bleibt die Seite vollständig
   lesbar und alle Inhalte sind im HTML vorhanden.
   ========================================================================= */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* --- Preisformatierung ------------------------------------------------ */
  var euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  function fmt(v) { return euro.format(v); }

  /* ==========================================================================
     Navigation
     ======================================================================= */
  var header = $('.site-header');
  var nav = $('.nav');
  var navToggle = $('[data-nav-toggle]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================================
     Einblenden beim Scrollen
     ======================================================================= */
  var revealables = $$('.reveal');
  if (revealables.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ==========================================================================
     Warenkorb
     Persistiert in localStorage. Struktur:
     [{ sku, name, price, qty, url, img }]
     ======================================================================= */
  var KEY = 'arktik.cart.v1';

  function readCart() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(function (i) { return i && i.sku; }) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* privater Modus */ }
    render();
  }

  function count(items) {
    return items.reduce(function (n, i) { return n + (i.qty || 0); }, 0);
  }

  function subtotal(items) {
    return items.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
  }

  function add(item, qty) {
    var items = readCart();
    var found = items.filter(function (i) { return i.sku === item.sku; })[0];
    if (found) {
      found.qty += qty;
    } else {
      item.qty = qty;
      items.push(item);
    }
    writeCart(items);
    openDrawer();
  }

  function setQty(sku, qty) {
    var items = readCart().map(function (i) {
      if (i.sku === sku) { i.qty = Math.max(0, qty); }
      return i;
    }).filter(function (i) { return i.qty > 0; });
    writeCart(items);
  }

  function remove(sku) { setQty(sku, 0); }

  /* --- Zeilen-Markup ---------------------------------------------------- */
  function lineHTML(item, opts) {
    var base = (document.body.dataset.root || '');
    var img = item.img ? base + item.img : '';
    return '' +
      '<div class="cart-line" data-sku="' + esc(item.sku) + '">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" width="92" height="74">' : '<div></div>') +
        '<div>' +
          '<h3><a href="' + esc(base + item.url) + '">' + esc(item.name) + '</a></h3>' +
          '<div class="sku">Art.-Nr. ' + esc(item.sku) + ' · ' + fmt(item.price) + '</div>' +
        '</div>' +
        '<div class="qty" role="group" aria-label="Menge ' + esc(item.name) + '">' +
          '<button type="button" data-qty-dec aria-label="Menge verringern">−</button>' +
          '<input type="text" inputmode="numeric" value="' + item.qty + '" data-qty-input aria-label="Menge">' +
          '<button type="button" data-qty-inc aria-label="Menge erhöhen">+</button>' +
        '</div>' +
        '<div class="line-actions">' +
          (opts && opts.showTotal ? '<b>' + fmt(item.price * item.qty) + '</b>' : '') +
          '<button type="button" class="link-btn" data-remove>Entfernen</button>' +
        '</div>' +
      '</div>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* --- Darstellung aktualisieren ---------------------------------------- */
  function render() {
    var items = readCart();
    var n = count(items);
    var sum = subtotal(items);

    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      el.hidden = n === 0;
    });

    var drawerItems = $('[data-drawer-items]');
    if (drawerItems) {
      drawerItems.innerHTML = items.length
        ? items.map(function (i) { return lineHTML(i, {}); }).join('')
        : '<p class="muted mt-2">Ihr Warenkorb ist noch leer.</p>';
    }

    $$('[data-cart-subtotal]').forEach(function (el) { el.textContent = fmt(sum); });

    var pageItems = $('[data-cart-page-items]');
    if (pageItems) {
      if (items.length) {
        pageItems.innerHTML = items.map(function (i) { return lineHTML(i, { showTotal: true }); }).join('');
      } else {
        pageItems.innerHTML = '<div class="empty-state"><p><strong>Ihr Warenkorb ist leer.</strong></p>' +
          '<p>Sehen Sie sich unsere Klimaanlagen an oder ermitteln Sie zuerst die passende Kühlleistung.</p>' +
          '<div class="flex-actions" style="justify-content:center">' +
          '<a class="btn" href="' + esc(document.body.dataset.root || '') + 'produkte.html">Zu den Klimaanlagen</a>' +
          '<a class="btn btn-ghost" href="' + esc(document.body.dataset.root || '') + 'kuehllast-rechner.html">Kühlleistung berechnen</a>' +
          '</div></div>';
      }
    }

    // Versandkosten- und Summenblock der Warenkorbseite
    var shipEl = $('[data-cart-shipping]');
    var totalEl = $('[data-cart-total]');
    var freeFrom = 499;
    if (shipEl) {
      var ship = (sum === 0 || sum >= freeFrom) ? 0 : 29.9;
      shipEl.textContent = ship === 0 ? 'kostenlos' : fmt(ship);
      if (totalEl) { totalEl.textContent = fmt(sum + ship); }
      var hint = $('[data-cart-freehint]');
      if (hint) {
        if (sum > 0 && sum < freeFrom) {
          hint.hidden = false;
          hint.textContent = 'Noch ' + fmt(freeFrom - sum) + ' bis zum versandkostenfreien Speditionsversand.';
        } else {
          hint.hidden = true;
        }
      }
    }

    var summaryBox = $('[data-cart-summary]');
    if (summaryBox) { summaryBox.hidden = items.length === 0; }
  }

  /* --- „In den Warenkorb“ ------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-cart]');
    if (!btn) { return; }
    e.preventDefault();

    var qtyInput = btn.closest('form, .buy-box, .product-card')
      ? $('[data-qty-main]', btn.closest('form, .buy-box, .product-card'))
      : null;
    var qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

    add({
      sku:   btn.dataset.sku,
      name:  btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      url:   btn.dataset.url,
      img:   btn.dataset.img
    }, qty);
  });

  /* --- Mengen und Entfernen --------------------------------------------- */
  document.addEventListener('click', function (e) {
    var line = e.target.closest('.cart-line');
    if (!line) { return; }
    var sku = line.dataset.sku;
    var input = $('[data-qty-input]', line);
    var cur = parseInt(input && input.value, 10) || 1;

    if (e.target.closest('[data-qty-inc]')) { setQty(sku, cur + 1); }
    else if (e.target.closest('[data-qty-dec]')) { setQty(sku, cur - 1); }
    else if (e.target.closest('[data-remove]')) { remove(sku); }
  });

  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-qty-input]');
    if (!input) { return; }
    var line = input.closest('.cart-line');
    if (line) { setQty(line.dataset.sku, parseInt(input.value, 10) || 0); }
  });

  /* --- Mengenwähler auf der Produktseite --------------------------------- */
  document.addEventListener('click', function (e) {
    var box = e.target.closest('.buy-box, .product-card');
    if (!box || e.target.closest('.cart-line')) { return; }
    var input = $('[data-qty-main]', box);
    if (!input) { return; }
    var cur = Math.max(1, parseInt(input.value, 10) || 1);
    if (e.target.closest('[data-qty-inc]')) { input.value = cur + 1; }
    else if (e.target.closest('[data-qty-dec]')) { input.value = Math.max(1, cur - 1); }
  });

  /* --- Schublade --------------------------------------------------------- */
  var drawer = $('[data-drawer]');
  var backdrop = $('[data-drawer-backdrop]');
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) { return; }
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) { backdrop.classList.add('is-open'); }
    var close = $('[data-drawer-close]', drawer);
    if (close) { close.focus(); }
  }

  function closeDrawer() {
    if (!drawer) { return; }
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) { backdrop.classList.remove('is-open'); }
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-drawer-open]')) { e.preventDefault(); openDrawer(); }
    if (e.target.closest('[data-drawer-close]') || e.target.closest('[data-drawer-backdrop]')) { closeDrawer(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) { closeDrawer(); }
  });

  /* ==========================================================================
     Registerkarten (Produktdetailseite)
     ======================================================================= */
  $$('[data-tabs]').forEach(function (group) {
    var buttons = $$('[role="tab"]', group);
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-selected', String(on));
          b.setAttribute('tabindex', on ? '0' : '-1');
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) { panel.hidden = !on; }
        });
      });
      btn.addEventListener('keydown', function (e) {
        var i = buttons.indexOf(btn);
        var next = e.key === 'ArrowRight' ? buttons[i + 1] : e.key === 'ArrowLeft' ? buttons[i - 1] : null;
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });
  });

  /* ==========================================================================
     Formulare
     Die Seite ist statisch: Ohne Backend werden Kontakt- und Newsletter-
     Formulare per mailto weitergereicht. In der README steht, wie man auf
     einen echten Endpunkt umstellt (data-endpoint am <form>).
     ======================================================================= */
  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var endpoint = form.dataset.endpoint;
      if (endpoint) { return; }          // echter Endpunkt: normal absenden
      e.preventDefault();

      var data = new FormData(form);
      var lines = [];
      data.forEach(function (v, k) { if (String(v).trim()) { lines.push(k + ': ' + v); } });

      var to = form.dataset.mailto || 'info@arktik-klima.de';
      var subject = form.dataset.subject || 'Anfrage über arktik-klima.de';
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      var ok = form.querySelector('[data-form-success]');
      if (ok) { ok.hidden = false; }
    });
  });

  /* --- Jahreszahl in der Fusszeile --------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  render();

  /* Für andere Module (shop.js, calc.js) freigeben */
  window.ARKTIK = { fmt: fmt, readCart: readCart, add: add, $: $, $$: $$ };
})();
