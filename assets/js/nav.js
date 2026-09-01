/* Menü auf schmalen Schirmen. Ohne JavaScript bleibt die Navigation über
   den Sprungmarken erreichbar, der Knopf verschwindet dann wirkungslos. */
(function () {
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('mainnav');
  if (!burger || !nav) return;

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (ev) {
    if (ev.target.closest('a')) {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();
