/* Kopfzeile: Glas nach dem ersten Scrollen, Menü auf schmalen Schirmen.
   Ohne JavaScript bleibt die Navigation über die Sprungmarken erreichbar. */
(function () {
  var bar = document.querySelector('.topbar');
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('mainnav');
  if (!bar) return;

  function onScroll() { bar.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!burger || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    bar.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }

  burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (ev) { if (ev.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
})();
