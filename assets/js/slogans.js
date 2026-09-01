/* Wechselnde Hauptüberschrift.
   Alle Aussagen liegen im selben Rasterfeld übereinander; sichtbar ist die mit
   .is-active. Ohne JavaScript bleibt die erste Aussage stehen — die Überschrift
   ist also nie leer. Wer Animationen abgeschaltet hat, bekommt keinen Wechsel. */
(function () {
  var host = document.querySelector('.rotator');
  if (!host) return;

  var slides = host.querySelectorAll('.slogan');
  if (slides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var INTERVAL = 5200;
  var current = 0;
  var paused = false;

  host.addEventListener('mouseenter', function () { paused = true; });
  host.addEventListener('mouseleave', function () { paused = false; });

  setInterval(function () {
    if (paused || document.hidden) return;
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, INTERVAL);
})();
