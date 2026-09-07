/* =========================================================
   Fuhrparkkompass — Terminbuchung
   Vier Schritte: Terminart → Datum & Uhrzeit → Kontakt → Bestätigung.
   Ohne Server: Die Anfrage geht per POST an FPK.bookingEndpoint oder,
   wenn keiner gesetzt ist, als vorausgefüllte E-Mail. Zusätzlich gibt
   es eine .ics-Datei für den Kalender des Kunden.
   ========================================================= */
(function () {
  "use strict";
  const host = document.querySelector(".booking-widget");
  if (!host) return;
  const cfg = window.FPK || {};
  const types = cfg.types || [];
  const workdays = cfg.workdays || [1, 2, 3, 4, 5];
  const hours = cfg.hours || { start: 9, end: 17 };
  const lunch = cfg.lunch || { start: 12.5, end: 13.5 };
  const holidays = new Set(cfg.holidays || []);
  const leadMs = (cfg.leadHours || 20) * 3600e3;
  const horizonMs = (cfg.horizonDays || 42) * 864e5;

  const state = { step: 0, type: null, date: null, time: null, month: null, form: {} };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const fmtDate = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtMonth = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const now = () => new Date();
  const slotsFor = (dateStr, minutes) => {
    const out = [], [y, m, dd] = dateStr.split("-").map(Number);
    const earliest = now().getTime() + leadMs;
    for (let h = hours.start; h + minutes / 60 <= hours.end + 1e-9; h += .5) {
      const end = h + minutes / 60;
      if (h < lunch.end && end > lunch.start) continue;
      const d = new Date(y, m - 1, dd, Math.floor(h), (h % 1) * 60);
      if (d.getTime() < earliest) continue;
      out.push(pad(d.getHours()) + ":" + pad(d.getMinutes()));
    }
    return out;
  };
  const dayAvailable = (d) => {
    if (d.getTime() > now().getTime() + horizonMs) return false;
    if (!workdays.includes(d.getDay())) return false;
    if (holidays.has(iso(d))) return false;
    return slotsFor(iso(d), state.type ? state.type.minutes : 30).length > 0;
  };
  const firstAvailable = () => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 70; i++) { if (dayAvailable(d)) return new Date(d); d.setDate(d.getDate() + 1); }
    return new Date();
  };

  const icons = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  };
  const labels = ["Terminart", "Zeitpunkt", "Kontakt", "Bestätigung"];

  /* ---------- Rendern ---------- */
  const render = () => {
    const progress = '<div class="bw-progress" aria-hidden="true">' + labels.map((l, i) => `<span class="${i <= state.step ? "done" : ""}" data-label="${l}"></span>`).join("") + "</div>";
    let body = "";
    if (state.step === 0) body = stepType();
    else if (state.step === 1) body = stepWhen();
    else if (state.step === 2) body = stepForm();
    else if (state.step === 3) body = stepConfirm();
    else body = stepDone();
    const info = state.step < 4 ? `<p class="bw-stepinfo">Schritt ${state.step + 1} von 4 · ${labels[state.step]}</p>` : "";
    host.innerHTML = progress + info + `<div class="bw-step is-active" role="region" aria-live="polite">${body}</div>`;
    bind();
  };

  const stepType = () => `
    <h3>Welchen Termin wünschen Sie?</h3>
    <p>Alle Termine sind kostenlos und unverbindlich.</p>
    <div class="bw-types">${types.map((t) => `
      <button type="button" class="bw-type" data-type="${t.id}" aria-pressed="${state.type && state.type.id === t.id}">
        <b>${esc(t.name)}</b><span class="dur">${t.minutes} Min.</span><small>${esc(t.desc)}</small>
      </button>`).join("")}
    </div>
    ${cfg.calendarLink ? `<p class="bw-alt" style="margin-top:18px;font-size:14px"><a href="${esc(cfg.calendarLink)}" target="_blank" rel="noopener" style="color:var(--amber);text-decoration:underline">Lieber direkt im Kalender buchen?</a></p>` : ""}`;

  const stepWhen = () => {
    if (!state.month) { const f = state.date ? new Date(state.date) : firstAvailable(); state.month = new Date(f.getFullYear(), f.getMonth(), 1); }
    const m = state.month, first = new Date(m.getFullYear(), m.getMonth(), 1);
    const startDow = (first.getDay() + 6) % 7;                  /* Montag = 0 */
    const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const todayStr = iso(now());
    let cells = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => `<span class="dow">${d}</span>`).join("");
    for (let i = 0; i < startDow; i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const date = new Date(m.getFullYear(), m.getMonth(), d), s = iso(date), ok = dayAvailable(date);
      cells += `<button type="button" class="cal-day ${ok ? "avail" : ""} ${s === todayStr ? "today" : ""} ${s === state.date ? "sel" : ""}" data-date="${s}" ${ok ? "" : "disabled"} aria-label="${fmtDate.format(date)}${ok ? "" : " (nicht verfügbar)"}">${d}</button>`;
    }
    const minMonth = new Date(now().getFullYear(), now().getMonth(), 1);
    const maxDate = new Date(now().getTime() + horizonMs), maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const slots = state.date ? slotsFor(state.date, state.type.minutes) : [];
    return `
      <h3>Wann passt es Ihnen?</h3>
      <p>${esc(state.type.name)} · ${state.type.minutes} Minuten · Zeiten in Ihrer Zeitzone (${esc(Intl.DateTimeFormat().resolvedOptions().timeZone || cfg.timezone)})</p>
      <div class="bw-cal">
        <div>
          <div class="cal-head">
            <button type="button" class="cal-nav" data-nav="-1" aria-label="Vorheriger Monat" ${m <= minMonth ? "disabled" : ""}>${icons.prev}</button>
            <b>${fmtMonth.format(m)}</b>
            <button type="button" class="cal-nav" data-nav="1" aria-label="Nächster Monat" ${m >= maxMonth ? "disabled" : ""}>${icons.fwd}</button>
          </div>
          <div class="cal-grid">${cells}</div>
        </div>
        <div>
          <div class="slots-head">${state.date ? `<b>${fmtDate.format(new Date(state.date))}</b>Freie Zeiten` : "<b>Bitte wählen Sie einen Tag.</b>Danach erscheinen hier die freien Zeiten."}</div>
          ${state.date ? (slots.length ? `<div class="slots">${slots.map((s) => `<button type="button" class="slot ${s === state.time ? "sel" : ""}" data-time="${s}">${s} Uhr</button>`).join("")}</div>` : `<p class="slots-empty">An diesem Tag ist leider nichts mehr frei.</p>`) : ""}
        </div>
      </div>
      <div class="bw-actions">
        <button type="button" class="back" data-back>${icons.back} Zurück</button>
        <button type="button" class="btn btn-primary" data-next ${state.date && state.time ? "" : "disabled"}>Weiter ${icons.next}</button>
      </div>`;
  };

  const stepForm = () => {
    const f = state.form;
    const fleet = ["1–4", "5–9", "10–24", "25–49", "50–99", "100–249", "250+"];
    return `
      <h3>Wer nimmt teil?</h3>
      <p>${esc(state.type.name)} am ${fmtDate.format(new Date(state.date))} um ${state.time} Uhr.</p>
      <form class="bw-form" novalidate>
        <div><label for="bk-name">Name *</label><input class="input" id="bk-name" name="name" autocomplete="name" required value="${esc(f.name || "")}"></div>
        <div><label for="bk-company">Unternehmen *</label><input class="input" id="bk-company" name="company" autocomplete="organization" required value="${esc(f.company || "")}"></div>
        <div><label for="bk-email">E-Mail *</label><input class="input" id="bk-email" name="email" type="email" autocomplete="email" required value="${esc(f.email || "")}"></div>
        <div><label for="bk-phone">Telefon *</label><input class="input" id="bk-phone" name="phone" type="tel" autocomplete="tel" required value="${esc(f.phone || "")}"></div>
        <div><label for="bk-vehicles">Fahrzeuge im Fuhrpark</label><select class="input" id="bk-vehicles" name="vehicles">${fleet.map((o) => `<option ${f.vehicles === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>
        <div><label for="bk-branch">Branche</label><select class="input" id="bk-branch" name="branch">${["Spedition / Transport", "Logistikdienstleister", "Handwerk / Bau", "Handel / Vertrieb", "Kurier / Express", "Vermietung", "Sonstige"].map((o) => `<option ${f.branch === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>
        <div class="full"><label for="bk-msg">Was sollen wir vorab wissen? (optional)</label><textarea class="input" id="bk-msg" name="message" placeholder="z. B. aktueller Versicherer, Vertragsende, besondere Fahrzeuge">${esc(f.message || "")}</textarea></div>
        <div class="full"><label class="check"><input type="checkbox" id="bk-privacy" required ${f.privacy ? "checked" : ""}> <span>Ich habe die <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a> gelesen und bin einverstanden, dass meine Angaben zur Terminvereinbarung verarbeitet werden. *</span></label></div>
        <p class="bw-error full" id="bk-error">Bitte füllen Sie alle Pflichtfelder korrekt aus.</p>
        <div class="bw-actions full">
          <button type="button" class="back" data-back>${icons.back} Zurück</button>
          <button type="submit" class="btn btn-primary">Zur Übersicht ${icons.next}</button>
        </div>
      </form>`;
  };

  const summary = () => `
    <div class="bw-summary">
      <div><span>Termin</span><b>${esc(state.type.name)} (${state.type.minutes} Min.)</b></div>
      <div><span>Datum</span><b>${fmtDate.format(new Date(state.date))}</b></div>
      <div><span>Uhrzeit</span><b>${state.time} Uhr</b></div>
      <div><span>Teilnehmer</span><b>${esc(state.form.name)}, ${esc(state.form.company)}</b></div>
      <div><span>Kontakt</span><b>${esc(state.form.email)} · ${esc(state.form.phone)}</b></div>
      <div><span>Fuhrpark</span><b>${esc(state.form.vehicles)} Fahrzeuge · ${esc(state.form.branch)}</b></div>
    </div>`;

  const stepConfirm = () => `
    <h3>Alles richtig?</h3>
    <p>Sie erhalten eine Bestätigung per E-Mail. Der Termin ist erst verbindlich, wenn wir ihn bestätigt haben.</p>
    ${summary()}
    <p class="bw-error" id="bk-error">Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.</p>
    <div class="bw-actions">
      <button type="button" class="back" data-back>${icons.back} Ändern</button>
      <button type="button" class="btn btn-primary" data-submit>Termin verbindlich anfragen ${icons.next}</button>
    </div>`;

  const stepDone = () => `
    <div class="bw-done">
      <div class="icon">${icons.check}</div>
      <h3>Vielen Dank, ${esc(state.form.name.split(" ")[0])}!</h3>
      <p style="color:var(--on-dark-2)">${state.sentVia === "mail"
        ? "Ihr E-Mail-Programm hat sich mit der fertigen Anfrage geöffnet. Bitte senden Sie die E-Mail ab, dann bestätigen wir den Termin."
        : "Ihre Anfrage ist bei uns eingegangen. Wir bestätigen den Termin in der Regel innerhalb eines Werktags."}</p>
      ${summary()}
      <div class="actions">
        <a class="btn btn-ghost btn-sm" href="${icsHref()}" download="fuhrparkkompass-termin.ics">In den Kalender (.ics)</a>
        <button type="button" class="btn btn-ghost btn-sm" data-restart>Weiteren Termin buchen</button>
      </div>
    </div>`;

  /* ---------- Kalenderdatei ---------- */
  const icsHref = () => {
    const [y, m, d] = state.date.split("-").map(Number), [hh, mm] = state.time.split(":").map(Number);
    const start = new Date(y, m - 1, d, hh, mm), end = new Date(start.getTime() + state.type.minutes * 60e3);
    const z = (dt) => dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + "T" + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + "00Z";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fuhrparkkompass//Terminbuchung//DE", "BEGIN:VEVENT",
      "UID:" + Date.now() + "@fuhrparkkompass.de", "DTSTAMP:" + z(new Date()), "DTSTART:" + z(start), "DTEND:" + z(end),
      "SUMMARY:Fuhrparkkompass – " + state.type.name, "DESCRIPTION:Termin mit Fuhrparkkompass. Kontakt: " + (cfg.email || ""),
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  };

  /* ---------- Senden ---------- */
  const payload = () => ({
    type: state.type.id, typeName: state.type.name, minutes: state.type.minutes, date: state.date, time: state.time,
    ...state.form, page: location.href, sentAt: new Date().toISOString()
  });
  const send = async (btn) => {
    const err = host.querySelector("#bk-error"); err.classList.remove("is-visible");
    if (cfg.bookingEndpoint) {
      btn.disabled = true; btn.textContent = "Wird gesendet …";
      try {
        const r = await fetch(cfg.bookingEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload()) });
        if (!r.ok) throw new Error(r.status);
        state.sentVia = "endpoint"; state.step = 4; render(); return;
      } catch (e) { btn.disabled = false; btn.innerHTML = "Erneut senden " + icons.next; err.classList.add("is-visible"); return; }
    }
    const p = payload();
    const body = [`Terminanfrage: ${p.typeName} (${p.minutes} Min.)`, `Datum: ${fmtDate.format(new Date(p.date))}`, `Uhrzeit: ${p.time} Uhr`, "",
      `Name: ${p.name}`, `Unternehmen: ${p.company}`, `E-Mail: ${p.email}`, `Telefon: ${p.phone}`, `Fahrzeuge: ${p.vehicles}`, `Branche: ${p.branch}`, "",
      `Nachricht: ${p.message || "-"}`].join("\n");
    location.href = "mailto:" + (cfg.email || "") + "?subject=" + encodeURIComponent("Terminanfrage " + p.typeName + " – " + p.company) + "&body=" + encodeURIComponent(body);
    state.sentVia = "mail"; state.step = 4; render();
  };

  /* ---------- Ereignisse ---------- */
  const bind = () => {
    host.querySelectorAll(".bw-type").forEach((b) => b.addEventListener("click", () => {
      state.type = types.find((t) => t.id === b.dataset.type); state.time = null; state.step = 1; render();
    }));
    host.querySelectorAll("[data-nav]").forEach((b) => b.addEventListener("click", () => {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + Number(b.dataset.nav), 1); render();
    }));
    host.querySelectorAll(".cal-day.avail").forEach((b) => b.addEventListener("click", () => { state.date = b.dataset.date; state.time = null; render(); }));
    host.querySelectorAll(".slot").forEach((b) => b.addEventListener("click", () => { state.time = b.dataset.time; render(); }));
    host.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => { state.step = Math.max(0, state.step - 1); render(); }));
    const next = host.querySelector("[data-next]");
    if (next) next.addEventListener("click", () => { state.step = 2; render(); });
    const form = host.querySelector("form.bw-form");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((el) => {
        const valid = el.type === "checkbox" ? el.checked : el.type === "email" ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()) : el.value.trim().length > 1;
        el.classList.toggle("invalid", !valid); if (!valid) ok = false;
      });
      form.querySelector("#bk-error").classList.toggle("is-visible", !ok);
      if (!ok) { form.querySelector(".invalid").focus(); return; }
      const g = (id) => form.querySelector("#" + id).value.trim();
      state.form = { name: g("bk-name"), company: g("bk-company"), email: g("bk-email"), phone: g("bk-phone"), vehicles: g("bk-vehicles"), branch: g("bk-branch"), message: g("bk-msg"), privacy: true };
      state.step = 3; render();
    });
    const submit = host.querySelector("[data-submit]");
    if (submit) submit.addEventListener("click", () => send(submit));
    const restart = host.querySelector("[data-restart]");
    if (restart) restart.addEventListener("click", () => { Object.assign(state, { step: 0, type: null, date: null, time: null, month: null, form: {}, sentVia: null }); render(); });
    /* Zurück zum Anfang des Widgets scrollen, wenn es oben aus dem Bild ist */
    const top = host.getBoundingClientRect().top;
    if (top < 0) host.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* Sprung aus dem Rechner: Fahrzeugzahl vormerken */
  document.querySelectorAll("[data-book-type]").forEach((a) => a.addEventListener("click", () => {
    const t = types.find((x) => x.id === a.dataset.bookType);
    if (t) { state.type = t; state.step = 1; render(); }
  }));

  render();
})();
