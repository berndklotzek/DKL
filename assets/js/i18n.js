/* Sprachumschaltung DE / RU.
   Die Inhalte stehen doppelt im HTML (lang="de" / lang="ru"); sichtbar ist,
   was das data-lang-Attribut am <html>-Element freigibt. Ohne JavaScript
   bleibt die im Markup gesetzte Standardsprache stehen. */
(function () {
  var SUPPORTED = ['de', 'ru'];
  var STORE_KEY = 'sf-lang';
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }

  function remember(lang) {
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* Privatmodus: egal */ }
  }

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });
  }

  var initial = stored() || (navigator.language || '').slice(0, 2).toLowerCase();
  apply(SUPPORTED.indexOf(initial) === -1 ? 'de' : initial);

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-set-lang]');
    if (!btn) return;
    apply(btn.dataset.setLang);
    remember(btn.dataset.setLang);
  });
})();
