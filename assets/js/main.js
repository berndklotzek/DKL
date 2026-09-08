/* Verhalten der Seite: Kopfzeile, Menü, Einblenden, Zähler, Logo-Karussell,
   Leistungs-Tabs, Terminbuchung (Google Meet), Kontaktdaten und Formular. */
(function () {
  const S = window.SITE || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* --- Kopfzeile: kompakt nach dem Scrollen ---------------------------- */
  const topbar = $("#topbar");
  const onScroll = () => topbar && topbar.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* --- Menü auf schmalen Schirmen ------------------------------------- */
  const toggle = $("#navToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    $$("#nav a").forEach(a => a.addEventListener("click", () => {
      document.body.classList.remove("nav-open"); toggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* --- Einblenden beim Scrollen ---------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* --- Zähler in den Kennzahlen ---------------------------------------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      cio.unobserve(el);
      if (reduce || end === 0) { el.textContent = pre + end + suf; return; }
      const t0 = performance.now(), dur = 1400;
      (function tick(now) {
        const p = Math.min(1, (now - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + v + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .5 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* --- Logo-Karussell: Kacheln aus data-logos bauen, Gruppe verdoppeln --- */
  $$(".marquee-group[data-logos]").forEach(group => {
    group.dataset.logos.split(",").map(s => s.trim()).filter(Boolean).forEach(slug => {
      const tile = document.createElement("div"); tile.className = "logo-tile";
      const img = document.createElement("img");
      img.src = `assets/logos/${slug}.svg`; img.alt = slug.replace(/-/g, " "); img.loading = "lazy"; img.decoding = "async";
      tile.appendChild(img); group.appendChild(tile);
    });
    const clone = group.cloneNode(true); clone.setAttribute("aria-hidden", "true");
    group.parentElement.appendChild(clone);
  });

  /* --- Leistungs-Tabs --------------------------------------------------- */
  const tabs = $$('.services-tabs [role="tab"]');
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => { t.setAttribute("aria-selected", "false"); $("#" + t.getAttribute("aria-controls")).hidden = true; });
    tab.setAttribute("aria-selected", "true");
    const panel = $("#" + tab.getAttribute("aria-controls")); panel.hidden = false;
    $$(".service", panel).forEach((card, i) => {
      card.classList.remove("reveal", "is-visible"); card.classList.add("reveal");
      requestAnimationFrame(() => setTimeout(() => card.classList.add("is-visible"), i * 60));
    });
  }));

  /* --- Kontaktdaten aus config.js einsetzen ----------------------------- */
  const o = S.owner || {};
  const setText = (id, v) => { const el = document.getElementById(id); if (el && v) el.textContent = v; };
  const setLink = (id, href, text) => { const el = document.getElementById(id); if (el && href) { el.href = href; el.textContent = text; } };
  setLink("contactPhone", "tel:" + (o.phone || "").replace(/\s/g, ""), o.phoneDisplay || o.phone);
  setLink("footerPhone", "tel:" + (o.phone || "").replace(/\s/g, ""), o.phoneDisplay || o.phone);
  setLink("contactMail", "mailto:" + o.email, o.email);
  setLink("footerMail", "mailto:" + o.email, o.email);
  setText("contactAddress", [o.street, [o.zip, o.city].filter(Boolean).join(" ")].filter(Boolean).join(", "));
  setText("contactHours", o.hours);
  setText("footerRegister", (S.legal || {}).registerNumber);
  setText("year", String(new Date().getFullYear()));
  if (S.booking && S.booking.duration) setText("bookingDuration", S.booking.duration);

  /* --- Terminbuchung über Google Kalender (Google Meet) ------------------ */
  const booking = S.booking || {};
  const configured = booking.url && !/TODO/.test(booking.url);
  const openBtn = $("#bookingOpen"), loadBtn = $("#bookingLoad"), frame = $("#bookingFrame"), todo = $("#bookingTodo");
  if (openBtn) openBtn.href = configured ? booking.url : "#kontakt";
  if (!configured) {
    if (todo) todo.hidden = false;
    if (openBtn) { openBtn.removeAttribute("target"); openBtn.textContent = "Termin per E-Mail anfragen"; }
    if (loadBtn) loadBtn.disabled = true;
  } else if (loadBtn && frame) {
    loadBtn.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = booking.url; iframe.title = "Terminbuchung – Google Kalender";
      iframe.setAttribute("loading", "lazy"); iframe.setAttribute("allow", "camera; microphone");
      frame.appendChild(iframe); frame.classList.add("is-loaded");
    });
  }

  /* --- Kontaktformular: öffnet das E-Mail-Programm ------------------------ */
  const form = $("#contactForm");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    if (form.website && form.website.value) return;          /* Spam-Falle */
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    const subject = `Anfrage über die Website: ${f.get("topic")}`;
    const body = [
      `Name: ${f.get("name")}`, `E-Mail: ${f.get("email")}`, `Telefon: ${f.get("phone") || "—"}`,
      `Thema: ${f.get("topic")}`, "", f.get("message")
    ].join("\n");
    window.location.href = `mailto:${o.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
