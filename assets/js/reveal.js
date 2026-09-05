/* Einblenden beim Scrollen, Zähler in den Kennzahlen, aktiver Menüpunkt.
   Ohne JavaScript ist alles sichtbar (Klasse no-js am <html>). */
(function () {
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Einblenden */
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Zähler: data-count="200" zählt von 0 hoch, Präfix/Suffix bleiben Text. */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, end = parseFloat(el.dataset.count), t0 = null, dur = 1400;
        var suffix = el.dataset.suffix || '', prefix = el.dataset.prefix || '';
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Aktiver Menüpunkt beim Scrollen (nur auf der Startseite). */
  var links = Array.prototype.slice.call(document.querySelectorAll('.mainnav a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* Inhaltsverzeichnis auf Unterseiten. */
  var toc = document.querySelectorAll('.toc a[href^="#"]');
  if (toc.length && 'IntersectionObserver' in window) {
    var heads = Array.prototype.map.call(toc, function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        toc.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    heads.forEach(function (h) { tio.observe(h); });
  }

  /* Jahreszahl in der Fusszeile. */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
