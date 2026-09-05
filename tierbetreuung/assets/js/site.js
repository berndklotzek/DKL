/* ---------------------------------------------------------------------------
   Kleinteile der Seite: Menue, Kopfzeile beim Scrollen, Einblenden der
   Abschnitte, Lightbox der Galerie, Jahreszahl in der Fusszeile.
   Alles ohne Bibliothek; ohne JavaScript bleibt die Seite vollstaendig lesbar.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Menue auf schmalen Schirmen -------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav    = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* --- Kopfzeile verdichtet sich, sobald man scrollt -------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.pageYOffset > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Abschnitte blenden beim Erreichen ein ---------------------------- */
  var targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduce.matches) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  /* --- Galerie: Bild gross ---------------------------------------------- */
  var gallery = document.querySelector('[data-gallery]');
  var box     = document.querySelector('[data-lightbox]');

  if (gallery && box) {
    var boxImg   = box.querySelector('img');
    var boxCap   = box.querySelector('figcaption');
    var opener   = null;
    var figures  = Array.prototype.slice.call(gallery.querySelectorAll('button[data-full]'));

    var show = function (btn) {
      var img = btn.querySelector('img');
      boxImg.src = btn.getAttribute('data-full');
      boxImg.alt = img ? img.alt : '';
      boxCap.textContent = btn.getAttribute('data-caption') || '';
      box.hidden = false;
      document.body.classList.add('nav-open');
      box.querySelector('[data-close]').focus();
      opener = btn;
    };

    var hide = function () {
      box.hidden = true;
      document.body.classList.remove('nav-open');
      boxImg.removeAttribute('src');
      if (opener) opener.focus();
    };

    var step = function (delta) {
      if (!opener) return;
      var idx = (figures.indexOf(opener) + delta + figures.length) % figures.length;
      show(figures[idx]);
    };

    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-full]');
      if (btn) show(btn);
    });

    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || e.target === box) hide();
      if (e.target.closest('[data-prev]')) step(-1);
      if (e.target.closest('[data-next]')) step(1);
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape')     hide();
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* --- Jahreszahl -------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
