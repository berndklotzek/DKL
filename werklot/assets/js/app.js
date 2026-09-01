/* =====================================================================
   WERKLOT — Anwendungslogik
   Kein Framework. Reihenfolge: data.js zuerst, dann diese Datei.
   ===================================================================== */
(function () {
  "use strict";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     Erscheinungsbild
     ------------------------------------------------------------------ */
  function initTheme() {
    var root = document.documentElement;
    var stored = null;
    try { stored = localStorage.getItem("werklot-theme"); } catch (e) { /* Privater Modus */ }
    if (stored === "dark" || stored === "light") root.setAttribute("data-theme", stored);

    var btn = $("#theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var dunkelJetzt = root.getAttribute("data-theme") === "dark" ||
        (!root.hasAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dunkelJetzt ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("werklot-theme", next); } catch (e) { /* egal */ }
    });
  }

  /* ------------------------------------------------------------------
     Einblenden beim Scrollen
     ------------------------------------------------------------------ */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Hero-Instrument
     ------------------------------------------------------------------ */
  function initGauge() {
    var rows = $$("[data-gauge]");
    window.setTimeout(function () {
      rows.forEach(function (fill, i) {
        window.setTimeout(function () {
          fill.style.width = fill.getAttribute("data-gauge") + "%";
        }, i * 130);
      });
    }, 260);
  }

  /* ------------------------------------------------------------------
     Slogan-Wechsler im Hero
     ------------------------------------------------------------------ */
  function initSlogans() {
    var zone = $("#slogan-zone");
    var rotor = $("#rotor");
    var slogans = $$(".slogan");
    if (!zone || !rotor || slogans.length < 2) return;

    var ticks = $$(".tick", rotor);
    var STANDZEIT = 5200;
    var reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var aktuell = -1, timer = null, pausiert = false;

    rotor.style.setProperty("--dwell", (STANDZEIT / 1000) + "s");

    function zeige(n) {
      if (n === aktuell) return;
      var alt = slogans[aktuell];
      if (alt) {
        alt.classList.remove("is-on");
        alt.classList.add("is-out");
        alt.setAttribute("aria-hidden", "true");
        window.setTimeout(function () { alt.classList.remove("is-out"); }, 400);
      }
      aktuell = n;
      slogans[n].removeAttribute("aria-hidden");
      slogans[n].classList.add("is-on");
      skalaNeu();
    }

    /* Klasse abnehmen, Umbruch erzwingen, wieder anlegen: nur so startet
       die Füll-Animation der Skala von vorn. */
    function skalaNeu() {
      ticks.forEach(function (t, i) {
        t.classList.remove("is-on");
        t.setAttribute("aria-current", i === aktuell ? "true" : "false");
      });
      if (ticks[aktuell]) {
        void ticks[aktuell].offsetWidth;
        ticks[aktuell].classList.add("is-on");
      }
    }

    function planen() {
      window.clearTimeout(timer);
      if (reduziert || pausiert) return;
      timer = window.setTimeout(function () {
        zeige((aktuell + 1) % slogans.length);
        planen();
      }, STANDZEIT);
    }

    function anhalten() {
      pausiert = true;
      rotor.classList.add("is-paused");
      window.clearTimeout(timer);
    }
    function weiterlaufen() {
      if (!pausiert) return;
      pausiert = false;
      rotor.classList.remove("is-paused");
      skalaNeu();
      planen();
    }

    zone.addEventListener("mouseenter", anhalten);
    zone.addEventListener("mouseleave", weiterlaufen);
    zone.addEventListener("focusin", anhalten);
    zone.addEventListener("focusout", function (e) {
      if (!zone.contains(e.relatedTarget)) weiterlaufen();
    });

    ticks.forEach(function (t, i) {
      t.addEventListener("click", function () { zeige(i); planen(); });
    });

    /* Der erste Slogan steht schon im Markup; kurz abnehmen, damit er beim
       Laden genauso einläuft wie alle folgenden. */
    slogans.forEach(function (el, i) {
      el.classList.remove("is-on");
      if (i > 0) el.setAttribute("aria-hidden", "true");
    });
    void slogans[0].offsetWidth;
    zeige(0);
    planen();
  }

  /* ------------------------------------------------------------------
     Diagramm: Zukunfts-Index
     ------------------------------------------------------------------ */
  function renderChart() {
    var host = $("#index-bars");
    if (!host) return;
    host.innerHTML = "";

    INDEX_VERGLEICH.forEach(function (d) {
      var row = document.createElement("div");
      row.className = "bar-row";
      row.setAttribute("role", "listitem");
      row.title = d.label + ": Index " + d.value + " von 100 (" +
        (d.serie === 1 ? "Handwerk" : "Vergleichsberuf") + ")";

      var name = document.createElement("span");
      name.className = "bar-name";
      name.textContent = d.label;

      var track = document.createElement("span");
      track.className = "bar-track";
      var fill = document.createElement("span");
      fill.className = "bar-fill" + (d.serie === 2 ? " s2" : "");
      fill.setAttribute("data-w", d.value);
      track.appendChild(fill);

      var val = document.createElement("span");
      val.className = "bar-val";
      val.textContent = d.value;

      row.appendChild(name); row.appendChild(track); row.appendChild(val);
      host.appendChild(row);
    });

    var start = function () {
      $$(".bar-fill", host).forEach(function (f, i) {
        window.setTimeout(function () { f.style.width = f.getAttribute("data-w") + "%"; }, i * 55);
      });
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(host);
    } else { start(); }
  }

  /* ------------------------------------------------------------------
     Vergleichsrechnung
     Pearson-Korrelation zwischen Antwortprofil und Berufsprofil.
     ------------------------------------------------------------------ */
  function korrelation(a, b) {
    var n = a.length, i, ma = 0, mb = 0;
    for (i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
    ma /= n; mb /= n;
    var num = 0, da = 0, db = 0, x, y;
    for (i = 0; i < n; i++) {
      x = a[i] - ma; y = b[i] - mb;
      num += x * y; da += x * x; db += y * y;
    }
    if (da === 0 || db === 0) return 0;
    return num / Math.sqrt(da * db);
  }

  function beitraege(a, b) {
    var n = a.length, i, ma = 0, mb = 0;
    for (i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
    ma /= n; mb /= n;
    var liste = [];
    for (i = 0; i < n; i++) {
      /* Nur Merkmale, die bei beiden Seiten überdurchschnittlich sind — sonst
         würde eine gemeinsame Schwäche als Begründung angezeigt. */
      if (a[i] > ma && b[i] > mb) liste.push({ key: DIM_KEYS[i], v: (a[i] - ma) * (b[i] - mb) });
    }
    liste.sort(function (p, q) { return q.v - p.v; });
    return liste.slice(0, 2).map(function (e) { return DIMENSIONEN[e.key]; });
  }

  /* ------------------------------------------------------------------
     Talent-Check
     ------------------------------------------------------------------ */
  var check = { i: 0, antworten: [], ergebnis: null };

  function checkVektor() {
    var v = {};
    DIM_KEYS.forEach(function (k) { v[k] = 0; });
    check.antworten.forEach(function (idx, qi) {
      if (idx === null || idx === undefined) return;
      var w = FRAGEN[qi].optionen[idx].w;
      Object.keys(w).forEach(function (k) { v[k] += w[k]; });
    });
    return DIM_KEYS.map(function (k) { return v[k]; });
  }

  function berechneErgebnis() {
    var user = checkVektor();
    var treffer = BERUFE.map(function (b) {
      var bv = DIM_KEYS.map(function (k) { return b.profil[k]; });
      var r = korrelation(user, bv);
      return {
        beruf: b,
        score: Math.max(8, Math.min(99, Math.round(50 + 50 * r))),
        gruende: beitraege(user, bv)
      };
    });
    treffer.sort(function (a, b) { return b.score - a.score; });
    check.ergebnis = treffer;
    return treffer;
  }

  function scoreFuerBeruf(berufId) {
    if (!check.ergebnis) return null;
    for (var i = 0; i < check.ergebnis.length; i++) {
      if (check.ergebnis[i].beruf.id === berufId) return check.ergebnis[i].score;
    }
    return null;
  }

  function renderFrage() {
    var f = FRAGEN[check.i];
    $("#check-step").textContent = "Frage " + (check.i + 1) + " von " + FRAGEN.length;
    $("#check-progress").style.width = ((check.i) / FRAGEN.length * 100) + "%";
    $("#check-frage").textContent = f.frage;
    var hint = $("#check-hinweis");
    hint.textContent = f.hinweis || "";
    hint.hidden = !f.hinweis;

    var host = $("#check-optionen");
    host.innerHTML = "";
    f.optionen.forEach(function (o, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.setAttribute("aria-pressed", check.antworten[check.i] === i ? "true" : "false");
      btn.innerHTML =
        '<span class="opt-key" aria-hidden="true">' + String.fromCharCode(65 + i) + "</span>" +
        '<span class="opt-text">' + o.text + "<small>" + o.sub + "</small></span>";
      btn.addEventListener("click", function () {
        check.antworten[check.i] = i;
        $$(".opt", host).forEach(function (b, bi) {
          b.setAttribute("aria-pressed", bi === i ? "true" : "false");
        });
        window.setTimeout(weiter, 190);
      });
      host.appendChild(btn);
    });

    $("#check-zurueck").disabled = check.i === 0;
    $("#check-weiter").disabled = check.antworten[check.i] === undefined;
    $("#check-weiter").textContent = check.i === FRAGEN.length - 1 ? "Ergebnis ansehen" : "Weiter";
  }

  function weiter() {
    if (check.antworten[check.i] === undefined) return;
    if (check.i < FRAGEN.length - 1) { check.i++; renderFrage(); }
    else { renderErgebnis(); }
  }

  function renderErgebnis() {
    var treffer = berechneErgebnis();
    $("#check-fragen").hidden = true;
    $("#check-ergebnis").hidden = false;
    $("#check-step").textContent = "Ergebnis";
    $("#check-progress").style.width = "100%";

    var host = $("#match-list");
    host.innerHTML = "";
    treffer.slice(0, 4).forEach(function (t, i) {
      var el = document.createElement("article");
      el.className = "match" + (i === 0 ? " top" : "");
      el.innerHTML =
        '<div class="match-rank">' + (i + 1) + "</div>" +
        "<div><h4>" + t.beruf.name + "</h4>" +
        "<p>" + t.beruf.warum + "</p>" +
        '<div class="tags">' +
          '<span class="tag sig">Index ' + t.beruf.index + "</span>" +
          '<span class="tag">' + t.beruf.dauer + "</span>" +
          '<span class="tag">' + t.beruf.verguetung + "</span>" +
          t.gruende.map(function (g) { return '<span class="tag">' + g + "</span>"; }).join("") +
        "</div></div>" +
        '<div class="match-score"><b>' + t.score + "% Passung</b>" +
        '<span class="meter"><i style="width:0"></i></span></div>';
      host.appendChild(el);
      window.setTimeout(function () {
        var m = $(".meter i", el);
        if (m) m.style.width = t.score + "%";
      }, 90 + i * 110);
    });

    $("#ergebnis-satz").textContent =
      "Dein stärkster Treffer ist " + treffer[0].beruf.name +
      ". In deiner Region gibt es dafür " +
      BETRIEBE.filter(function (b) { return b.beruf === treffer[0].beruf.id; })
        .reduce(function (s, b) { return s + b.plaetze; }, 0) +
      " freie Lehrstellen.";

    /* Nicht auf ein Gewerk einengen — alle Betriebe bleiben sichtbar,
       nur die Reihenfolge richtet sich nach dem Ergebnis. */
    var sort = $("#filter-sort");
    if (sort) sort.value = "match";
    renderFirms();
    setMatchHinweis(true);
  }

  function checkZuruecksetzen() {
    check = { i: 0, antworten: [], ergebnis: null };
    $("#check-ergebnis").hidden = true;
    $("#check-fragen").hidden = false;
    renderFrage();
    var f = $("#filter-gewerk"); if (f) f.value = "alle";
    setMatchHinweis(false);
    renderFirms();
  }

  function setMatchHinweis(an) {
    var el = $("#firm-hinweis");
    if (!el) return;
    el.textContent = an
      ? "Sortiert nach deinem Talent-Check."
      : "Talent-Check ausfüllen, um die Passung je Betrieb zu sehen.";
  }

  function initCheck() {
    renderFrage();
    $("#check-weiter").addEventListener("click", weiter);
    $("#check-zurueck").addEventListener("click", function () {
      if (check.i > 0) { check.i--; renderFrage(); }
    });
    $("#check-neu").addEventListener("click", checkZuruecksetzen);
  }

  /* ------------------------------------------------------------------
     Betriebe
     ------------------------------------------------------------------ */
  function berufVon(id) {
    for (var i = 0; i < BERUFE.length; i++) if (BERUFE[i].id === id) return BERUFE[i];
    return null;
  }

  function firmenMatch(b) {
    var s = scoreFuerBeruf(b.beruf);
    if (s === null) return null;
    var bonus = 0;
    if (b.km <= 10) bonus += 4; else if (b.km <= 20) bonus += 2;
    if (b.plaetze >= 3) bonus += 2;
    return Math.min(99, s + bonus);
  }

  function euroZahl(s) { return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0; }

  function gefiltert() {
    var gewerk = $("#filter-gewerk").value;
    var maxKm  = parseInt($("#filter-km").value, 10);
    var start  = $("#filter-start").value;
    var sort   = $("#filter-sort").value;
    var suche  = $("#filter-suche").value.trim().toLowerCase();

    var liste = BETRIEBE.filter(function (b) {
      if (gewerk !== "alle" && b.beruf !== gewerk) return false;
      if (b.km > maxKm) return false;
      if (start !== "alle" && b.start.indexOf(start) === -1) return false;
      if (suche) {
        var heu = (b.name + " " + b.ort + " " + b.kurz + " " +
          (berufVon(b.beruf) || {}).name).toLowerCase();
        if (heu.indexOf(suche) === -1) return false;
      }
      return true;
    });

    liste.sort(function (a, b) {
      if (sort === "km") return a.km - b.km;
      if (sort === "geld") return euroZahl(b.verguetung) - euroZahl(a.verguetung);
      if (sort === "uebernahme") return b.uebernahme - a.uebernahme;
      var ma = firmenMatch(a), mb = firmenMatch(b);
      if (ma === null || mb === null) return a.km - b.km;
      return mb - ma;
    });
    return liste;
  }

  function initialen(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("");
  }

  function renderFirms() {
    var host = $("#firm-grid");
    if (!host) return;
    var liste = gefiltert();
    host.innerHTML = "";

    $("#filter-count").textContent =
      liste.length + (liste.length === 1 ? " Betrieb" : " Betriebe") + " · " +
      liste.reduce(function (s, b) { return s + b.plaetze; }, 0) + " freie Lehrstellen";

    if (!liste.length) {
      var leer = document.createElement("p");
      leer.className = "empty";
      leer.textContent = "Kein Betrieb passt zu diesen Filtern. Umkreis vergrößern oder Gewerk auf „alle“ stellen.";
      host.appendChild(leer);
      return;
    }

    liste.forEach(function (b) {
      var beruf = berufVon(b.beruf);
      var m = firmenMatch(b);
      var card = document.createElement("button");
      card.type = "button";
      card.className = "firm";
      card.setAttribute("aria-label", b.name + ", " + beruf.name + " in " + b.ort + " — Profil öffnen");
      card.innerHTML =
        '<div class="firm-top">' +
          '<div class="firm-logo" aria-hidden="true">' + initialen(b.name) + "</div>" +
          (m !== null ? '<span class="firm-match">' + m + "% Passung</span>" : "") +
        "</div>" +
        "<div><h3>" + b.name + "</h3>" +
          '<p class="firm-meta">' + beruf.name + " · " + b.ort + " · " + b.km + " km</p></div>" +
        '<div class="firm-facts">' +
          "<div><b>" + b.plaetze + "</b><span>Lehrstellen</span></div>" +
          "<div><b>" + b.verguetung + "</b><span>1. Jahr</span></div>" +
          "<div><b>" + b.uebernahme + "%</b><span>Übernahme</span></div>" +
        "</div>";
      card.addEventListener("click", function () { oeffnePanel(b.id); });
      host.appendChild(card);
    });
  }

  function initFilter() {
    var sel = $("#filter-gewerk");
    BERUFE.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "de"); })
      .forEach(function (b) {
        if (!BETRIEBE.some(function (x) { return x.beruf === b.id; })) return;
        var o = document.createElement("option");
        o.value = b.id; o.textContent = b.name;
        sel.appendChild(o);
      });

    ["filter-gewerk", "filter-start", "filter-sort"].forEach(function (id) {
      $("#" + id).addEventListener("change", renderFirms);
    });
    $("#filter-suche").addEventListener("input", renderFirms);
    $("#filter-km").addEventListener("input", function () {
      $("#km-wert").textContent = this.value + " km";
      renderFirms();
    });
    renderFirms();
  }

  /* ------------------------------------------------------------------
     Betriebsprofil
     ------------------------------------------------------------------ */
  var letzterFokus = null;

  function haken() {
    return '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" aria-hidden="true"><path d="M3 8.5 6.3 12 13 4.5"/></svg>';
  }

  function oeffnePanel(id) {
    var b = null, i;
    for (i = 0; i < BETRIEBE.length; i++) if (BETRIEBE[i].id === id) b = BETRIEBE[i];
    if (!b) return;
    var beruf = berufVon(b.beruf);
    var m = firmenMatch(b);
    letzterFokus = document.activeElement;

    $("#panel-titel").textContent = b.name;
    $("#panel-meta").textContent = beruf.name + " · " + b.ort + " · " + b.km + " km · seit " + b.gegruendet;

    $("#panel-body").innerHTML =
      '<p class="lead">' + b.kurz + "</p>" +

      '<div class="panel-block"><h4>Die Eckdaten</h4><div class="kv">' +
        "<div><b>" + b.plaetze + "</b><span>freie Lehrstellen</span></div>" +
        "<div><b>" + b.start + "</b><span>Ausbildungsstart</span></div>" +
        "<div><b>" + b.verguetung + "</b><span>1. Lehrjahr</span></div>" +
        "<div><b>" + b.uebernahme + "%</b><span>Übernahmequote</span></div>" +
        "<div><b>" + b.team + "</b><span>Beschäftigte</span></div>" +
        "<div><b>" + beruf.dauer + "</b><span>Ausbildungsdauer</span></div>" +
      "</div></div>" +

      (m !== null
        ? '<div class="panel-block"><h4>Deine Passung</h4>' +
          '<div class="match-score"><b>' + m + "% Passung</b>" +
          '<span class="meter"><i style="width:' + m + '%"></i></span></div>' +
          '<p style="font-size:.88rem;color:var(--ink-2)">Berechnet aus deinem Talent-Check, der Entfernung und der Zahl freier Plätze.</p></div>'
        : "") +

      '<div class="panel-block"><h4>Was du hier lernst</h4><ul class="ticks">' +
        b.lernen.map(function (t) { return "<li>" + haken() + "<span>" + t + "</span></li>"; }).join("") +
      "</ul></div>" +

      '<div class="panel-block"><h4>Das gibt es dazu</h4><div class="tags">' +
        b.benefits.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("") +
      "</div></div>" +

      '<div class="panel-block"><h4>Stimme aus dem Betrieb</h4>' +
        '<blockquote class="quote">„' + b.stimme.text + "“<footer>" + b.stimme.autor + "</footer></blockquote></div>" +

      '<div class="panel-block"><h4>Zukunfts-Index des Berufs</h4>' +
        '<div class="match-score"><b>' + beruf.index + " / 100</b>" +
        '<span class="meter"><i style="width:' + beruf.index + '%"></i></span></div>' +
        '<p style="font-size:.88rem;color:var(--ink-2)">' + beruf.warum + "</p></div>" +

      '<div class="panel-block"><h4>Ansprechperson</h4><p>' + b.ansprech + "</p></div>";

    $("#panel").hidden = false;
    document.body.style.overflow = "hidden";
    $("#panel-close").focus();
  }

  function schliessePanel() {
    $("#panel").hidden = true;
    document.body.style.overflow = "";
    if (letzterFokus && letzterFokus.focus) letzterFokus.focus();
  }

  function initPanel() {
    $("#panel-close").addEventListener("click", schliessePanel);
    $("#panel").addEventListener("click", function (e) {
      if (e.target === this) schliessePanel();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("#panel").hidden) schliessePanel();
    });
    $("#panel-bewerben").addEventListener("click", function () {
      melde("Prototyp: Hier startet die Kurzbewerbung — Profil, Sprachnachricht, absenden.");
    });
    $("#panel-merken").addEventListener("click", function () {
      melde("Prototyp: Betrieb wurde auf deine Merkliste gelegt.");
    });
  }

  /* ------------------------------------------------------------------
     Kurzmeldung
     ------------------------------------------------------------------ */
  var meldeTimer = null;
  function melde(text) {
    var el = $("#toast");
    el.textContent = text;
    el.hidden = false;
    window.clearTimeout(meldeTimer);
    meldeTimer = window.setTimeout(function () { el.hidden = true; }, 3800);
  }

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  function start() {
    initTheme();
    initReveal();
    initGauge();
    initSlogans();
    renderChart();
    initCheck();
    initFilter();
    initPanel();
    setMatchHinweis(false);

    $$("[data-scroll]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = document.getElementById(a.getAttribute("data-scroll"));
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    $("#jahr").textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
