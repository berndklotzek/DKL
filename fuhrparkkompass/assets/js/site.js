/* Fuhrparkkompass — Seitenlogik: Kopfzeile, Menü, Einblendungen, Zähler, Inhaltsverzeichnis */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Kopfzeile: verdichtet nach dem Scrollen */
  const topbar = $(".topbar");
  const onScroll = () => topbar && topbar.classList.toggle("is-stuck", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menü auf schmalen Schirmen */
  const burger = $(".burger"), nav = $(".mainnav");
  if (burger && nav) {
    const set = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      topbar.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  /* Telefon/E-Mail aus der Konfiguration einsetzen */
  const cfg = window.FPK || {};
  $$("[data-fpk-mail]").forEach((a) => { a.href = "mailto:" + cfg.email; a.textContent = cfg.email; });
  $$("[data-fpk-phone]").forEach((a) => { a.href = "tel:" + (cfg.phone || "").replace(/[^+\d]/g, ""); a.textContent = cfg.phoneDisplay || cfg.phone; });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Einblendungen beim Scrollen */
  const reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("is-in"));

  /* Zähler in den Kennzahlen */
  const counters = $$("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "", dur = 1400, t0 = performance.now();
      const fmt = (v) => Math.round(v).toLocaleString("de-DE");
      if (reduced) { el.textContent = fmt(target) + suffix; return; }
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * e) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: .5 });
      counters.forEach((el) => io.observe(el));
    } else counters.forEach(run);
  }

  /* Inhaltsverzeichnis auf Unterseiten: aktuellen Abschnitt markieren */
  const tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("is-current"));
        const a = map.get(en.target.id); if (a) a.classList.add("is-current");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* Fester Buchungs-Button auf dem Handy: erscheint nach dem Hero, verschwindet bei der Buchung */
  const mobileCta = $(".mobile-cta"), booking = $("#buchung");
  if (mobileCta) {
    let bookingSeen = false;
    if (booking && "IntersectionObserver" in window) new IntersectionObserver(([en]) => { bookingSeen = en.isIntersecting; update(); }, { threshold: .05 }).observe(booking);
    const update = () => mobileCta.classList.toggle("is-visible", scrollY > innerHeight * .7 && !bookingSeen && !(nav && nav.classList.contains("is-open")));
    addEventListener("scroll", update, { passive: true }); update();
  }

  /* Wechselnde Slogans in der Hauptüberschrift */
  const rotator = $(".rotator");
  if (rotator && !reduced) {
    const slogans = $$(".slogan", rotator);
    if (slogans.length > 1) {
      let i = 0, timer = null, paused = false;
      const show = (n) => {
        slogans[i].classList.remove("is-active"); slogans[i].classList.add("is-leaving");
        const old = slogans[i]; setTimeout(() => old.classList.remove("is-leaving"), 700);
        i = n % slogans.length; slogans[i].classList.add("is-active");
      };
      const tick = () => { if (!paused && !document.hidden) show(i + 1); };
      const start = () => { clearInterval(timer); timer = setInterval(tick, 5200); };
      rotator.addEventListener("mouseenter", () => { paused = true; });
      rotator.addEventListener("mouseleave", () => { paused = false; });
      start();
    }
  }

  /* Nur ein FAQ-Eintrag zugleich offen */
  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) $$(".faq details[open]").forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
