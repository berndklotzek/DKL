#!/usr/bin/env python3
"""
Packt die gebaute Website in eine einzige HTML-Datei zur Vorschau.

Die fertige Datei enthält alle Seiten, Stile, Skripte und Grafiken und läuft
ohne Webserver — per Doppelklick, als E-Mail-Anhang oder als Artifact. Jede
Seite wird in einem eigenen Dokument (iframe mit srcdoc) angezeigt, damit die
Seitenskripte genauso laufen wie im Echtbetrieb. Verweise innerhalb der Seite
werden abgefangen und auf die eingebettete Fassung umgeleitet.

    python3 tools/build.py && python3 tools/bundle.py

Ergebnis: vorschau/kaltstart-vorschau.html
"""

import base64
import html
import json
import os
import re

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUS = os.path.join(WURZEL, "klimaanlagen")
ZIEL_ORDNER = os.path.join(WURZEL, "vorschau")
ZIEL = os.path.join(ZIEL_ORDNER, "vorschau.html")

GRUPPEN = [
    ("Hauptseiten", lambda u: "/" not in u),
    ("Klimaanlagen", lambda u: u.startswith("produkte/")),
    ("Ratgeber", lambda u: u.startswith("ratgeber/")),
    ("Rechtliches", lambda u: u.startswith("recht/")),
]

REIHENFOLGE_HAUPT = ["index.html", "produkte.html", "kuehllast-rechner.html", "montage.html",
                     "ratgeber/index.html", "faq.html", "ueber-uns.html", "kontakt.html",
                     "warenkorb.html", "kasse.html", "404.html"]


def lies(pfad):
    return open(os.path.join(AUS, pfad), encoding="utf-8").read()


def datauri_svg(pfad):
    roh = open(os.path.join(AUS, pfad), "rb").read()
    return "data:image/svg+xml;base64," + base64.b64encode(roh).decode("ascii")


def seiten_sammeln():
    seiten = []
    for wurzel, _, dateien in os.walk(AUS):
        for d in sorted(dateien):
            if d.endswith(".html"):
                seiten.append(os.path.relpath(os.path.join(wurzel, d), AUS).replace(os.sep, "/"))
    return seiten


def kurzname(titel):
    """Aus dem Seitentitel eine knappe Bezeichnung für die Auswahlliste machen."""
    for trenner in (" | KALTSTART Klimasysteme", " | KALTSTART", " – KALTSTART"):
        if trenner in titel:
            titel = titel.split(trenner)[0]
    return titel.strip()


def main():
    # --- gemeinsame Bestandteile ------------------------------------------
    css = lies("assets/css/style.css")
    skripte = {name: lies("assets/js/%s.js" % name)
               for name in ("app", "shop", "calc", "produkte")}

    # Alle Grafiken als Data-URI, damit nichts nachgeladen werden muss.
    bilder = {}
    for datei in sorted(os.listdir(os.path.join(AUS, "assets", "img"))):
        if datei.endswith(".svg"):
            bilder["assets/img/" + datei] = datauri_svg("assets/img/" + datei)

    seiten = {}
    for url in seiten_sammeln():
        roh = lies(url)
        tiefe = url.count("/")
        rel = "../" * tiefe

        titel = re.search(r"<title>(.*?)</title>", roh, re.S).group(1)
        rumpf = re.search(r"<body[^>]*>(.*)</body>", roh, re.S).group(1)

        # Reihenfolge der Seitenskripte übernehmen, JSON-LD entfällt in der Vorschau.
        benoetigt = [os.path.basename(m).replace(".js", "")
                     for m in re.findall(r'<script src="([^"]+\.js)"', rumpf)]
        rumpf = re.sub(r'<script src="[^"]+"[^>]*></script>\s*', "", rumpf)
        rumpf = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', "", rumpf, flags=re.S)

        # Bildverweise durch Data-URIs ersetzen.
        def bild(m):
            pfad = m.group(2).replace(rel, "", 1) if rel and m.group(2).startswith(rel) else m.group(2)
            return '%s="%s"' % (m.group(1), bilder.get(pfad, m.group(2)))
        rumpf = re.sub(r'(src)="((?:\.\./)*assets/img/[^"]+)"', bild, rumpf)

        seiten[url] = {
            "titel": html.unescape(titel),
            "label": kurzname(html.unescape(titel)),
            "rumpf": rumpf,
            "skripte": benoetigt,
            "wurzel": rel,
        }

    # Reihenfolge für die Auswahlliste
    liste = []
    for name, passt in GRUPPEN:
        gruppe = [u for u in seiten if passt(u)]
        if name == "Hauptseiten":
            gruppe = ([u for u in REIHENFOLGE_HAUPT if u in gruppe] +
                      sorted(u for u in gruppe if u not in REIHENFOLGE_HAUPT))
        else:
            gruppe = sorted(gruppe, key=lambda u: seiten[u]["label"])
        liste.append({"gruppe": name, "seiten": gruppe})

    daten = json.dumps({"seiten": seiten, "liste": liste, "css": css,
                        "skripte": skripte, "bilder": bilder},
                       ensure_ascii=False, separators=(",", ":"))
    daten = daten.replace("</", "<\\/")     # damit kein </script> die Datei zerlegt

    os.makedirs(ZIEL_ORDNER, exist_ok=True)
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write(SCHALE.replace("/*DATEN*/null", daten))

    print("vorschau/vorschau.html geschrieben: %d Seiten, %d kB"
          % (len(seiten), os.path.getsize(ZIEL) // 1024))


SCHALE = r"""<meta charset="utf-8">
<title>Vorschau</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>
/* ============================================================================
   Vorschau-Werkbank
   Bewusst zurückhaltend: Die Website im Rahmen ist der Inhalt, die Umgebung
   nur Werkzeug. Graphit als Grundton, Messing als einziger Akzent — deutlich
   abgesetzt vom kühlen Cyan der Website, damit Rahmen und Inhalt nicht
   miteinander konkurrieren.
   ========================================================================= */
:root {
  --chrome:   #e8ecef;
  --panel:    #f8fafb;
  --edge:     #ccd5dc;
  --ink:      #172027;
  --dim:      #5d6d7a;
  --brass:    #8a6519;
  --brass-bg: #f0e6d0;
  --stage:    #dde3e8;
  --ui:  "IBM Plex Sans", "Segoe UI", system-ui, -apple-system, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --chrome:   #141b22;
    --panel:    #1c262f;
    --edge:     #2f3d49;
    --ink:      #dde6ee;
    --dim:      #8ba0b2;
    --brass:    #d8b165;
    --brass-bg: #33291446;
    --stage:    #0c1218;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --chrome:   #141b22;
  --panel:    #1c262f;
  --edge:     #2f3d49;
  --ink:      #dde6ee;
  --dim:      #8ba0b2;
  --brass:    #d8b165;
  --brass-bg: #33291446;
  --stage:    #0c1218;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0; background: var(--stage); color: var(--ink);
  font-family: var(--ui); font-size: 14px;
  display: flex; flex-direction: column; overflow: hidden;
}

/* --- Werkzeugleiste --------------------------------------------------- */
.bar {
  flex: none; display: flex; align-items: center; gap: 12px;
  padding: 9px 14px; background: var(--chrome);
  border-bottom: 1px solid var(--edge); flex-wrap: wrap;
}
.mark { display: flex; align-items: center; gap: 8px; flex: none; }
.mark svg { width: 22px; height: 22px; color: var(--brass); }
.mark b { font-weight: 600; letter-spacing: .04em; font-size: 13px; }
.mark span {
  font-family: var(--mono); font-size: 10px; color: var(--dim);
  border: 1px solid var(--edge); border-radius: 3px; padding: 1px 5px;
  text-transform: uppercase; letter-spacing: .08em;
}

button, select {
  font: inherit; color: var(--ink); background: var(--panel);
  border: 1px solid var(--edge); border-radius: 6px;
  padding: 6px 10px; cursor: pointer;
}
button:hover, select:hover { border-color: var(--brass); }
button:disabled { opacity: .4; cursor: default; }
button:disabled:hover { border-color: var(--edge); }
:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }

.nav-btn { width: 32px; padding: 6px 0; line-height: 1; font-size: 15px; }
select.pages { max-width: 300px; }

.path {
  font-family: var(--mono); font-size: 12px; color: var(--dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  flex: 1 1 120px; min-width: 0;
}

.seg { display: flex; gap: 0; flex: none; }
.seg button {
  border-radius: 0; border-left-width: 0; padding: 6px 11px; font-size: 13px;
}
.seg button:first-child { border-radius: 6px 0 0 6px; border-left-width: 1px; }
.seg button:last-child  { border-radius: 0 6px 6px 0; }
.seg button[aria-pressed="true"] {
  background: var(--brass-bg); color: var(--brass); border-color: var(--brass);
  font-weight: 600;
}
.px {
  font-family: var(--mono); font-size: 12px; color: var(--dim);
  font-variant-numeric: tabular-nums; flex: none; min-width: 62px; text-align: right;
}

/* --- Bühne ------------------------------------------------------------- */
.stage {
  flex: 1; min-height: 0; display: flex; justify-content: center;
  padding: 0; background: var(--stage);
}
.device {
  width: 100%; max-width: 100%; height: 100%;
  background: #fff; overflow: hidden;
}
.device.framed {
  margin: 16px; height: calc(100% - 32px);
  border: 1px solid var(--edge); border-radius: 12px;
  box-shadow: 0 18px 48px -18px rgba(0,0,0,.45);
}
iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }

/* --- Hinweis ----------------------------------------------------------- */
.toast {
  position: fixed; left: 50%; bottom: 22px; transform: translate(-50%, 14px);
  background: var(--panel); color: var(--ink);
  border: 1px solid var(--edge); border-left: 3px solid var(--brass);
  border-radius: 7px; padding: 10px 15px; font-size: 13px; max-width: 460px;
  box-shadow: 0 12px 30px -12px rgba(0,0,0,.5);
  opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;
}
.toast.on { opacity: 1; transform: translate(-50%, 0); }

@media (prefers-reduced-motion: reduce) {
  .toast { transition: none; }
}
@media (max-width: 720px) {
  .path { display: none; }
  select.pages { max-width: 160px; flex: 1; }
}
</style>

<div class="bar">
  <span class="mark">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <path d="M12 2v20M4.2 6.5l15.6 9M19.8 6.5l-15.6 9"/>
      <path d="M9 4.2 12 6l3-1.8M9 19.8 12 18l3 1.8"/>
    </svg>
    <b>KALTSTART</b><span>Vorschau</span>
  </span>

  <button class="nav-btn" id="zurueck" title="Eine Seite zurück" aria-label="Zurück" disabled>&larr;</button>

  <select class="pages" id="auswahl" aria-label="Seite auswählen"></select>
  <span class="path" id="pfad"></span>

  <div class="seg" role="group" aria-label="Ansichtsbreite">
    <button data-w="0"   aria-pressed="true">Desktop</button>
    <button data-w="834" aria-pressed="false">Tablet</button>
    <button data-w="390" aria-pressed="false">Mobil</button>
  </div>
  <span class="px" id="breite"></span>
</div>

<div class="stage">
  <div class="device" id="device"><iframe id="rahmen" title="Seitenvorschau"></iframe></div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function () {
  'use strict';
  var D = /*DATEN*/null;

  var rahmen  = document.getElementById('rahmen');
  var auswahl = document.getElementById('auswahl');
  var pfadEl  = document.getElementById('pfad');
  var breiteEl = document.getElementById('breite');
  var device  = document.getElementById('device');
  var zurueck = document.getElementById('zurueck');
  var toastEl = document.getElementById('toast');
  var verlauf = [];
  var aktuell = null;
  var bilderJSON = JSON.stringify(D.bilder);

  /* --- Auswahlliste aufbauen ------------------------------------------ */
  D.liste.forEach(function (g) {
    var grp = document.createElement('optgroup');
    grp.label = g.gruppe;
    g.seiten.forEach(function (u) {
      var o = document.createElement('option');
      o.value = u;
      o.textContent = D.seiten[u].label;
      grp.appendChild(o);
    });
    auswahl.appendChild(grp);
  });

  /* --- Hinweise -------------------------------------------------------- */
  var toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 3800);
  }

  /* --- Brücke in das eingebettete Dokument -----------------------------
     Bewusst nur über postMessage und ein mitgeliefertes Bildverzeichnis:
     Ein direkter Zugriff auf das Elterndokument würde brechen, sobald die
     Vorschau in einem abgeschotteten Rahmen läuft. */
  window.addEventListener('message', function (e) {
    if (e.source !== rahmen.contentWindow) { return; }
    var n = e.data || {};
    if (n.kaltstart === 'nav') { laden(n.ziel, true); }
    if (n.kaltstart === 'toast') { toast(n.text); }
  });

  /* Läuft vor den Seitenskripten: history.replaceState funktioniert in einem
     srcdoc-Dokument nicht und würde die Filterlogik abbrechen lassen. */
  var VOR = 'try{history.replaceState=function(){};history.pushState=function(){};}catch(e){}';

  /* Läuft nach den Seitenskripten: Verweise umleiten, Formulare abfangen,
     nachträglich eingefügte Bilder auflösen, Filter aus der Abfrage setzen. */
  var NACH = [
    '(function(){',
    '  var bilder = window.__BILDER || {};',
    '  function melden(n){ try { parent.postMessage(n, "*"); } catch (e) {} }',
    '  function aufloesen(el){',
    '    var q = el.getAttribute("src") || "";',
    '    var k = q.replace(/^(\\.\\.\\/)+/, "");',
    '    if (bilder[k]) { el.setAttribute("src", bilder[k]); }',
    '  }',
    '  function alle(){ document.querySelectorAll("img[src]").forEach(aufloesen); }',
    '  alle();',
    '  new MutationObserver(alle).observe(document.body, {childList:true, subtree:true});',
    '',
    '  document.addEventListener("click", function(e){',
    '    var a = e.target.closest("a[href]"); if (!a) return;',
    '    var href = a.getAttribute("href");',
    '    if (!href || href.charAt(0) === "#") return;',
    '    e.preventDefault();',
    '    if (/^(mailto:|tel:)/.test(href)) {',
    '      melden({kaltstart:"toast", text:"In der Vorschau deaktiviert: " + href});',
    '      return;',
    '    }',
    '    if (/^https?:/.test(href)) { window.open(href, "_blank", "noopener"); return; }',
    '    var z = new URL(href, "http://x/" + document.body.dataset.basis);',
    '    melden({kaltstart:"nav", ziel: z.pathname.slice(1) + z.search});',
    '  }, true);',
    '',
    '  document.addEventListener("submit", function(e){',
    '    e.preventDefault(); e.stopPropagation();',
    '    melden({kaltstart:"toast", text:"Formulare sind in der Vorschau abgeschaltet \\u2014 im Echtbetrieb geht hier eine E-Mail raus."});',
    '  }, true);',
    '',
    '  var abfrage = window.__ABFRAGE;',
    '  if (abfrage) {',
    '    var f = document.querySelector("[data-filters]");',
    '    if (f) {',
    '      new URLSearchParams(abfrage).forEach(function(v, k){',
    '        var i = f.querySelector("input[name=\\"" + k + "\\"][value=\\"" + v + "\\"]");',
    '        if (i) { i.checked = true; }',
    '      });',
    '      f.dispatchEvent(new Event("change", {bubbles:true}));',
    '    }',
    '  }',
    '})();'
  ].join('\n');

  /* --- Seite laden ----------------------------------------------------- */
  function laden(ziel, merken) {
    var teile = ziel.split('?');
    var url = teile[0] || 'index.html';
    var abfrage = teile[1] || '';
    if (!D.seiten[url]) {
      toast('Diese Seite gibt es in der Vorschau nicht: ' + url);
      return;
    }
    if (merken && aktuell) { verlauf.push(aktuell); }
    aktuell = ziel;

    var s = D.seiten[url];
    var vorspann = 'window.__BILDER=' + bilderJSON + ';window.__ABFRAGE=' +
                   JSON.stringify(abfrage) + ';' + VOR;
    var js = ['<scr' + 'ipt>' + vorspann + '</scr' + 'ipt>'];
    s.skripte.forEach(function (n) {
      if (D.skripte[n]) { js.push('<scr' + 'ipt>' + D.skripte[n] + '</scr' + 'ipt>'); }
    });
    js.push('<scr' + 'ipt>' + NACH + '</scr' + 'ipt>');

    rahmen.srcdoc =
      '<!doctype html><html lang="de"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>' + D.css + '</style></head>' +
      '<body data-root="' + s.wurzel + '" data-basis="' + url + '">' +
      s.rumpf + js.join('') + '</body></html>';

    auswahl.value = url;
    pfadEl.textContent = '/' + ziel;
    zurueck.disabled = verlauf.length === 0;
    document.title = s.titel + ' — Vorschau';
  }

  auswahl.addEventListener('change', function () { laden(auswahl.value, true); });
  zurueck.addEventListener('click', function () {
    var vorher = verlauf.pop();
    if (vorher) { laden(vorher, false); }
  });

  /* --- Ansichtsbreite --------------------------------------------------- */
  function breiteSetzen(w, knopf) {
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === knopf));
    });
    if (w) {
      device.style.maxWidth = w + 'px';
      device.classList.add('framed');
    } else {
      device.style.maxWidth = '100%';
      device.classList.remove('framed');
    }
    messen();
  }
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () { breiteSetzen(parseInt(b.dataset.w, 10), b); });
  });

  function messen() {
    breiteEl.textContent = Math.round(rahmen.getBoundingClientRect().width) + ' px';
  }
  window.addEventListener('resize', messen);

  laden('index.html', false);
  messen();
})();
</script>
"""

if __name__ == "__main__":
    main()
