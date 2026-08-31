#!/usr/bin/env python3
"""
ARKTIK Klimasysteme — Statischer Seitengenerator
================================================

Erzeugt aus

    src/layout.html      Rahmen (Kopf, Navigation, Fusszeile, Warenkorb)
    src/products.json    Produktkatalog
    src/pages/*.html     Seiteninhalte mit Kopfblock
    src/artikel/*.html   Ratgeberartikel mit Kopfblock

die fertige, statische Website im Ordner  klimaanlagen/ .

Aufruf:   python3 tools/build.py
Abhängigkeiten: keine, nur die Standardbibliothek.
"""

import html
import json
import os
import re
import shutil
from datetime import date

# ---------------------------------------------------------------------------
# Konfiguration — hier steht alles, was beim Rebranding angefasst wird
# ---------------------------------------------------------------------------

SITE = {
    # Geschäftsbezeichnung. Ein Einzelunternehmen darf unter einem Fantasienamen
    # auftreten, im Impressum, in den AGB und auf Rechnungen muss aber der
    # bürgerliche Name des Inhabers stehen — deshalb beide Angaben getrennt.
    "brand":    "ARKTIK Klimasysteme",
    "company":  "ARKTIK Klimasysteme",
    "inhaber":  "Daniel Klotzek",
    "rechtsform": "Einzelunternehmen",
    "url":      "https://www.arktik-klima.de",     # ohne Schrägstrich am Ende
    "email":    "info@arktik-klima.de",
    "phone":    "+49 000 0000000",                 # TODO echte Rufnummer eintragen
    "phone_href": "+490000000000",
    "street":   "Am Danielsbrunnen 28",
    "zip":      "60168",
    "city":     "Liesloch",
    "country":  "DE",
}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "klimaanlagen")

KATEGORIEN = {
    "monoblock":     ("Monoblock-Klimaanlagen",  "Ohne Aussengerät – nur zwei Kernbohrungen. Montage ohne Kälteschein."),
    "quick-connect": ("Quick-Connect-Split",     "Split-Effizienz mit vorbefüllter Schnellkupplung. Selbstmontage möglich."),
    "split":         ("Split-Klimaanlagen",      "Höchste Effizienz und niedrigste Geräuschwerte. Montage durch Fachbetrieb."),
    "multisplit":    ("Multi-Split-Anlagen",     "Mehrere Räume an einem Aussengerät – eine Genehmigung genügt."),
    "mobil":         ("Klimageräte ohne Montage", "Aufstellen und einschalten. Mit Zweikanal-Technik ohne den Unterdruck-Nachteil einfacher Geräte."),
    "zubehoer":      ("Zubehör",                 "Fensterabdichtung, Montagematerial und Nachrüstteile."),
}

MONTAGE_LABEL = {
    "selbst":      "Selbstmontage möglich",
    "fachbetrieb": "Montage durch Fachbetrieb",
    "keine":       "Keine Montage nötig",
}

# ---------------------------------------------------------------------------
# Symbole (inline, damit keine Icon-Bibliothek geladen werden muss)
# ---------------------------------------------------------------------------

def _svg(path, size=24, extra=""):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"%s>%s</svg>' % (extra, path))

ICONS = {
    "check":  _svg('<path d="m4.5 12.5 5 5 10-11"/>'),
    "truck":  _svg('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
    "shield": _svg('<path d="M12 3 5 6v6c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    "bolt":   _svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
    "cart":   _svg('<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.5 12h11L21 7H6"/>'),
    "menu":   _svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    "close":  _svg('<path d="m6 6 12 12M18 6 6 18"/>'),
    "arrow":  _svg('<path d="M5 12h13m-5-6 6 6-6 6"/>'),
    "snow":   _svg('<path d="M12 2v20M4.2 6.5l15.6 9M19.8 6.5l-15.6 9"/><path d="M9 4.2 12 6l3-1.8M9 19.8 12 18l3 1.8"/>'),
    "phone":  _svg('<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/>'),
    "mail":   _svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    "tools":  _svg('<path d="M14.5 5.5a4 4 0 0 0 5 5L21 9v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h9z"/><path d="m8 13 3 3"/>'),
    "leaf":   _svg('<path d="M4 20c0-9 6-14 16-15 1 10-4 16-13 16H4z"/><path d="M9 15c2-3 5-5 8-6"/>'),
    "clock":  _svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
    "star":   ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
               '<path d="M12 2.5 14.9 9l7 .6-5.3 4.6 1.6 6.9L12 17.4 5.8 21l1.6-6.9L2.1 9.6 9.1 9z"/></svg>'),
    "warn":   _svg('<path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>'),
    "info":   _svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>'),
    "euro":   _svg('<path d="M17.5 6.5A7 7 0 0 0 7 12a7 7 0 0 0 10.5 5.5"/><path d="M4 10.5h8M4 13.5h8"/>'),
}

# ---------------------------------------------------------------------------
# Produktbilder erzeugen
# ---------------------------------------------------------------------------

def _shade(hex_color, factor):
    """Hellt eine Farbe auf (factor > 1) oder dunkelt sie ab (factor < 1)."""
    hex_color = hex_color.lstrip("#")
    rgb = [int(hex_color[i:i + 2], 16) for i in (0, 2, 4)]
    out = []
    for c in rgb:
        v = c * factor if factor <= 1 else c + (255 - c) * (factor - 1)
        out.append(max(0, min(255, int(v))))
    return "#%02x%02x%02x" % tuple(out)


def product_svg(p):
    """Zeichnet eine stilisierte Produktdarstellung als SVG (320 × 240)."""
    c = p["farbe"]
    light, dark = _shade(c, 1.55), _shade(c, 0.62)
    kat = p["kategorie"]
    gid = "g-" + p["slug"]

    head = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240" '
        'role="img" aria-label="%s">'
        '<defs>'
        '<linearGradient id="%s" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
        '<linearGradient id="%s-b" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9f1f7"/></linearGradient>'
        '</defs>'
        '<ellipse cx="160" cy="212" rx="112" ry="14" fill="%s" opacity=".13"/>'
        % (html.escape(p["name"]), gid, light, c, gid, dark)
    )

    if kat in ("split", "quick-connect", "multisplit"):
        body = (
            # Innengerät
            '<g>'
            '<rect x="40" y="52" width="240" height="72" rx="20" fill="url(#%s-b)" stroke="%s" stroke-opacity=".25"/>'
            '<path d="M40 100h240v4a20 20 0 0 1-20 20H60a20 20 0 0 1-20-20z" fill="url(#%s)"/>'
            '<rect x="60" y="106" width="200" height="7" rx="3.5" fill="#0c1a26" opacity=".22"/>'
            '<circle cx="256" cy="70" r="4" fill="%s"/>'
            '<rect x="62" y="66" width="46" height="5" rx="2.5" fill="%s" opacity=".28"/>'
            '</g>'
            # Luftstrom
            '<g stroke="%s" stroke-width="3" stroke-linecap="round" fill="none" opacity=".55">'
            '<path d="M96 140c14 10 30 10 44 0"/>'
            '<path d="M140 156c14 10 30 10 44 0"/>'
            '<path d="M184 140c14 10 30 10 44 0"/>'
            '</g>' % (gid, dark, gid, c, dark, c)
        )
        if kat != "monoblock":
            body += (
                # Aussengerät klein daneben angedeutet
                '<g opacity=".9">'
                '<rect x="228" y="150" width="66" height="48" rx="8" fill="#ffffff" stroke="%s" stroke-opacity=".3"/>'
                '<circle cx="261" cy="174" r="16" fill="none" stroke="%s" stroke-width="2.5"/>'
                '<path d="M261 160v28M247 174h28" stroke="%s" stroke-width="2.5" stroke-linecap="round"/>'
                '</g>' % (dark, c, c)
            )
        if kat == "multisplit":
            body += ('<rect x="40" y="20" width="150" height="24" rx="10" fill="url(#%s-b)" '
                     'stroke="%s" stroke-opacity=".25"/>' % (gid, dark))

    elif kat == "monoblock":
        body = (
            '<rect x="30" y="60" width="260" height="86" rx="18" fill="url(#%s-b)" stroke="%s" stroke-opacity=".25"/>'
            '<path d="M30 122h260v6a18 18 0 0 1-18 18H48a18 18 0 0 1-18-18z" fill="url(#%s)"/>'
            '<g fill="#0c1a26" opacity=".16">'
            '<rect x="52" y="128" width="216" height="6" rx="3"/></g>'
            '<g stroke="%s" stroke-width="2" opacity=".35" fill="none">'
            '<circle cx="252" cy="86" r="13"/><circle cx="252" cy="86" r="5"/></g>'
            '<rect x="52" y="78" width="120" height="6" rx="3" fill="%s" opacity=".22"/>'
            '<rect x="52" y="92" width="80" height="6" rx="3" fill="%s" opacity=".14"/>'
            '<g stroke="%s" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5">'
            '<path d="M104 162c14 10 30 10 44 0"/><path d="M170 162c14 10 30 10 44 0"/></g>'
            % (gid, dark, gid, dark, dark, dark, c)
        )

    elif kat == "mobil":
        # Zweikanalgeräte bekommen einen zweiten Schlauch — genau der Unterschied,
        # auf den es bei Geräten ohne Montage ankommt.
        zweiter_schlauch = (
            '<path d="M216 104c26 0 30 14 30 30v46" stroke="%s" stroke-width="13" fill="none" '
            'stroke-linecap="round" opacity=".22" stroke-dasharray="3 9"/>' % dark
        ) if p.get("kanaele") == 2 else ""

        body = (
            '<rect x="104" y="44" width="112" height="150" rx="18" fill="url(#%s-b)" stroke="%s" stroke-opacity=".28"/>'
            '<path d="M104 150h112v26a18 18 0 0 1-18 18h-76a18 18 0 0 1-18-18z" fill="url(#%s)"/>'
            '<rect x="122" y="62" width="76" height="34" rx="8" fill="%s" opacity=".16"/>'
            '<g fill="#0c1a26" opacity=".2">'
            '<rect x="124" y="112" width="72" height="5" rx="2.5"/>'
            '<rect x="124" y="124" width="72" height="5" rx="2.5"/>'
            '<rect x="124" y="136" width="72" height="5" rx="2.5"/></g>'
            '<path d="M216 74c40 0 44 16 44 34v58" stroke="%s" stroke-width="13" fill="none" '
            'stroke-linecap="round" opacity=".35" stroke-dasharray="3 9"/>'
            '<circle cx="132" cy="200" r="7" fill="%s" opacity=".5"/>'
            '<circle cx="188" cy="200" r="7" fill="%s" opacity=".5"/>'
            % (gid, dark, gid, dark, dark, dark, dark)
        ) + zweiter_schlauch

    else:  # Zubehör
        body = (
            '<rect x="76" y="66" width="168" height="118" rx="16" fill="url(#%s-b)" stroke="%s" stroke-opacity=".28"/>'
            '<path d="M76 108h168" stroke="%s" stroke-opacity=".3" stroke-width="2"/>'
            '<rect x="140" y="66" width="40" height="42" fill="url(#%s)" opacity=".8"/>'
            '<circle cx="160" cy="146" r="22" fill="none" stroke="%s" stroke-width="3" opacity=".6"/>'
            '<path d="M160 134v24M148 146h24" stroke="%s" stroke-width="3" stroke-linecap="round" opacity=".6"/>'
            % (gid, dark, dark, gid, c, c)
        )

    return head + body + "</svg>"


def favicon_svg():
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">'
        '<defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#2ec9e8"/><stop offset="1" stop-color="#0b6fa8"/>'
        '</linearGradient></defs>'
        '<rect width="48" height="48" rx="12" fill="url(#f)"/>'
        '<g stroke="#ffffff" stroke-width="3" stroke-linecap="round">'
        '<path d="M24 10v28M12.6 16.5l22.8 15M35.4 16.5l-22.8 15"/>'
        '<path d="M19 12.5 24 15l5-2.5M19 35.5 24 33l5 2.5"/>'
        '<path d="M14.5 21.5 14 27l-4.8 2.6M33.5 26.5l.5-5.5 4.8-2.6"/>'
        '</g></svg>'
    )


def og_svg():
    """Vorschaubild für soziale Netzwerke (1200 × 630).
    tools/make-og.sh rendert daraus die PNG-Fassung, die in den Meta-Tags steht."""
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" '
        'font-family="Inter, Segoe UI, system-ui, sans-serif">'
        '<defs>'
        '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#08131d"/><stop offset="1" stop-color="#0d2f47"/></linearGradient>'
        '<radialGradient id="glow" cx="0.82" cy="0.12" r="0.75">'
        '<stop offset="0" stop-color="#2ec9e8" stop-opacity=".5"/>'
        '<stop offset="1" stop-color="#2ec9e8" stop-opacity="0"/></radialGradient>'
        '</defs>'
        '<rect width="1200" height="630" fill="url(#bg)"/>'
        '<rect width="1200" height="630" fill="url(#glow)"/>'
        # Schneeflocke als Wortmarke
        '<g transform="translate(80,74) scale(1.15)" stroke="#2ec9e8" stroke-width="3.4" '
        'stroke-linecap="round" fill="none">'
        '<path d="M20 4v32M6.9 11.6l26.2 15M33.1 11.6l-26.2 15"/>'
        '<path d="M15 6.4 20 9l5-2.6M15 33.6 20 31l5 2.6"/>'
        '<path d="M9.8 15.2 9.4 21l-5 2.8M30.2 21.8l.4-5.8 5-2.8"/>'
        '</g>'
        '<text x="146" y="105" fill="#ffffff" font-size="28" font-weight="700" letter-spacing="7">'
        'ARKTIK KLIMASYSTEME</text>'
        '<text x="80" y="256" fill="#ffffff" font-size="76" font-weight="800" letter-spacing="-2">'
        'Klimaanlagen, die zum</text>'
        '<text x="80" y="344" fill="#2ec9e8" font-size="76" font-weight="800" letter-spacing="-2">'
        'Raum passen.</text>'
        '<text x="80" y="416" fill="#a9c6d9" font-size="31">'
        'Monoblock · Quick-Connect · Split · Multi-Split</text>'
        '<g transform="translate(80,470)">'
        '<rect width="322" height="60" rx="30" fill="#2ec9e8"/>'
        '<text x="161" y="39" fill="#04222c" font-size="25" font-weight="700" text-anchor="middle">'
        'Kühllast berechnen</text>'
        '<text x="356" y="39" fill="#a9c6d9" font-size="23">Lieferung aus dem EU-Lager</text>'
        '</g>'
        '</svg>'
    )


# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def eur(v):
    s = "%.2f" % v
    ganz, dez = s.split(".")
    ganz = re.sub(r"(?<=\d)(?=(\d{3})+$)", ".", ganz)
    return ganz + "," + dez + " €"


def num_de(v, dez=1):
    return ("%." + str(dez) + "f") % v if isinstance(v, float) else str(v)


def kw_de(v):
    return ("%.1f" % v).replace(".", ",")


def depth_prefix(url):
    return "../" * url.count("/")


def read_frontmatter(text):
    """Liest den Kopfblock  ---\nkey: wert\n---  am Dateianfang."""
    meta, body = {}, text
    if text.startswith("---"):
        end = text.find("\n---", 3)
        raw = text[3:end]
        body = text[end + 4:].lstrip("\n")
        for line in raw.strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
    return meta, body

# ---------------------------------------------------------------------------
# Bausteine
# ---------------------------------------------------------------------------

def product_card(p, rel="", rang=0):
    """Produktkarte für Übersicht, Startseite und ähnliche Produkte."""
    url = rel + "produkte/" + p["slug"] + ".html"
    img = rel + "assets/img/produkt-" + p["slug"] + ".svg"
    chips = []
    if p["kw"]:
        chips.append("%s kW" % kw_de(p["kw"]))
    if p["raum_max"]:
        chips.append("bis %d m²" % p["raum_max"])
    if p["seer"]:
        chips.append("%s %s" % (p["kennzahl"], kw_de(p["seer"])))
    if p.get("kanaele"):
        chips.append("1 Schlauch" if p["kanaele"] == 1 else "2 Schläuche")
    if p["db"]:
        chips.append("%d dB(A)" % p["db"])
    if p["wifi"]:
        chips.append("WLAN")

    save = ""
    if p.get("uvp") and p["uvp"] > p["preis"]:
        pct = round((1 - p["preis"] / p["uvp"]) * 100)
        save = '<span class="badge badge-save">−%d %%</span>' % pct

    return """<article class="product-card" data-kategorie="%(kat)s" data-preis="%(preis)s" data-kw="%(kw)s"
    data-seer="%(seer)s" data-db="%(db)s" data-raum-min="%(rmin)s" data-raum-max="%(rmax)s"
    data-montage="%(mont)s" data-wifi="%(wifi)s" data-heizen="%(heiz)s" data-rang="%(rang)d">
  <a class="thumb" href="%(url)s" tabindex="-1" aria-hidden="true">
    <span class="badge badge-float">%(badge)s</span>%(save)s
    <img src="%(img)s" alt="%(name)s" width="320" height="240" loading="lazy" decoding="async">
  </a>
  <div class="body">
    <h3><a href="%(url)s">%(name)s</a></h3>
    <p class="sub">%(kurz)s</p>
    <ul class="spec-chips">%(chips)s</ul>
    <div class="price-row">
      <span class="price">%(preis_f)s</span>%(uvp_f)s
    </div>
    <p class="price-note">inkl. MwSt. · %(versand)s</p>
    <div class="card-actions">
      <button type="button" class="btn btn-sm" data-add-to-cart data-sku="%(sku)s" data-name="%(name)s"
              data-price="%(preis)s" data-url="produkte/%(slug)s.html" data-img="assets/img/produkt-%(slug)s.svg">
        In den Warenkorb
      </button>
      <a class="btn btn-sm btn-ghost" href="%(url)s">Details</a>
    </div>
  </div>
</article>""" % {
        "kat": p["kategorie"], "preis": p["preis"], "kw": p["kw"], "seer": p["seer"], "db": p["db"],
        "rmin": p["raum_min"], "rmax": p["raum_max"], "mont": p["montage"],
        "wifi": "1" if p["wifi"] else "0", "heiz": "1" if p["heizen"] else "0", "rang": rang,
        "url": url, "img": img, "name": html.escape(p["name"]), "kurz": html.escape(p["kurz"]),
        "badge": html.escape(p["badge"]), "save": save,
        "chips": "".join("<li>%s</li>" % html.escape(c) for c in chips),
        "preis_f": eur(p["preis"]),
        # Ein durchgestrichener Preis muss erkennen lassen, worauf er sich bezieht.
        # Bezugsgrösse ist hier durchgängig die UVP, nicht ein eigener Vorpreis –
        # für einen eigenen Vorpreis gilt § 11 PAngV (niedrigster Preis der letzten 30 Tage).
        "uvp_f": ('<span class="price-old">UVP %s</span>' % eur(p["uvp"])) if p.get("uvp") and p["uvp"] > p["preis"] else "",
        "versand": "versandkostenfrei" if p["preis"] >= 499 else "zzgl. Versand",
        "sku": p["sku"], "slug": p["slug"],
    }


def breadcrumb_html(trail, rel):
    """trail: Liste von (Titel, Ziel oder None)."""
    if not trail:
        return ""
    items = ['<li><a href="%sindex.html">Start</a></li>' % rel]
    for title, target in trail:
        if target:
            items.append('<li><a href="%s%s">%s</a></li>' % (rel, target, html.escape(title)))
        else:
            items.append('<li><span aria-current="page">%s</span></li>' % html.escape(title))
    return ('<nav class="breadcrumb" aria-label="Sie sind hier"><div class="wrap"><ol>%s</ol></div></nav>'
            % "".join(items))


def breadcrumb_ld(trail, rel_url):
    items = [{"@type": "ListItem", "position": 1, "name": "Start", "item": SITE["url"] + "/"}]
    pos = 2
    for title, target in trail:
        entry = {"@type": "ListItem", "position": pos, "name": title}
        if target:
            entry["item"] = SITE["url"] + "/" + target
        else:
            entry["item"] = SITE["url"] + "/" + rel_url
        items.append(entry)
        pos += 1
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}


def org_ld():
    return {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "@id": SITE["url"] + "/#organisation",
        "name": SITE["brand"],
        "legalName": SITE["inhaber"],
        "founder": {"@type": "Person", "name": SITE["inhaber"]},
        "url": SITE["url"] + "/",
        "logo": SITE["url"] + "/assets/img/favicon.svg",
        "image": SITE["url"] + "/assets/img/og-arktik.png",
        "description": "Onlineshop für Klimaanlagen: Monoblock, Quick-Connect-Split, "
                       "Split- und Multi-Split-Anlagen sowie mobile Klimageräte.",
        "email": SITE["email"],
        "telephone": SITE["phone"],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": SITE["street"],
            "postalCode": SITE["zip"],
            "addressLocality": SITE["city"],
            "addressCountry": SITE["country"],
        },
        "areaServed": [{"@type": "Country", "name": "Deutschland"},
                       {"@type": "Country", "name": "Österreich"}],
        "currenciesAccepted": "EUR",
        "paymentAccepted": "PayPal, Kreditkarte, Klarna, SEPA-Lastschrift, Vorkasse",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "telephone": SITE["phone"],
            "email": SITE["email"],
            "availableLanguage": ["de"],
        },
    }


def jsonld_tag(data):
    return '<script type="application/ld+json">%s</script>' % json.dumps(
        data, ensure_ascii=False, separators=(",", ":"))

# ---------------------------------------------------------------------------
# Rendern
# ---------------------------------------------------------------------------

LAYOUT = open(os.path.join(SRC, "layout.html"), encoding="utf-8").read()


def render_page(url, title, description, body, *, trail=None, jsonld=None, scripts="",
                headextra="", nav=None, ogtype="website", robots="index,follow", ogtitle=None):
    rel = depth_prefix(url)
    trail = trail or []
    lds = list(jsonld or [])
    if trail:
        lds.append(breadcrumb_ld(trail, url))

    out = LAYOUT
    repl = {
        "{{TITLE}}": html.escape(title),
        "{{OGTITLE}}": html.escape(ogtitle or title),
        "{{DESCRIPTION}}": html.escape(description, quote=True),
        "{{CANONICAL}}": SITE["url"] + "/" + ("" if url == "index.html" else url),
        "{{ROBOTS}}": robots,
        "{{OGTYPE}}": ogtype,
        "{{OGIMAGE}}": SITE["url"] + "/assets/img/og-arktik.png",
        "{{ROOT}}": rel,
        "{{BRAND}}": SITE["brand"],
        "{{COMPANY}}": SITE["company"],
        "{{INHABER}}": SITE["inhaber"],
        "{{BREADCRUMB}}": breadcrumb_html(trail, rel),
        "{{BODY}}": body,
        "{{SCRIPTS}}": scripts,
        "{{HEADEXTRA}}": headextra,
        "{{ORGLD}}": json.dumps(org_ld(), ensure_ascii=False, separators=(",", ":")),
        "{{JSONLD}}": "\n".join(jsonld_tag(d) for d in lds),
        "{{ICON_CART}}": ICONS["cart"],
        "{{ICON_MENU}}": ICONS["menu"],
        "{{ICON_CLOSE}}": ICONS["close"],
        "{{ICON_TRUCK}}": ICONS["truck"],
        "{{ICON_SHIELD}}": ICONS["shield"],
        "{{ICON_BOLT}}": ICONS["bolt"],
    }
    for key in ("shop", "calc", "guide", "montage", "about", "contact"):
        repl["{{NAV_%s}}" % key.upper()] = ' aria-current="page"' if nav == key else ""

    for k, v in repl.items():
        out = out.replace(k, v)

    path = os.path.join(OUT, url)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    return url


def expand(text, rel, produkte):
    """Ersetzt Platzhalter in Inhaltsdateien."""
    text = text.replace("{{ROOT}}", rel)
    for name, svg in ICONS.items():
        text = text.replace("{{ICON:%s}}" % name, svg)
    text = (text.replace("{{TEL}}", SITE["phone"])
                .replace("{{TEL_HREF}}", SITE["phone_href"])
                .replace("{{MAIL}}", SITE["email"])
                .replace("{{COMPANY}}", SITE["company"])
                .replace("{{INHABER}}", SITE["inhaber"])
                .replace("{{RECHTSFORM}}", SITE["rechtsform"])
                .replace("{{ANSCHRIFT}}", "%s<br>Inhaber %s<br>%s<br>%s %s"
                         % (SITE["company"], SITE["inhaber"], SITE["street"],
                            SITE["zip"], SITE["city"]))
                .replace("{{ANSCHRIFT_ZEILE}}", "%s, Inhaber %s, %s, %s %s"
                         % (SITE["company"], SITE["inhaber"], SITE["street"],
                            SITE["zip"], SITE["city"]))
                .replace("{{BRAND}}", SITE["brand"])
                .replace("{{STREET}}", SITE["street"])
                .replace("{{ZIP}}", SITE["zip"])
                .replace("{{CITY}}", SITE["city"])
                .replace("{{DOMAIN}}", SITE["url"].replace("https://", "")))

    # {{PRODUKTE:slug,slug,slug}} → Produktkarten
    def cards(m):
        slugs = [s.strip() for s in m.group(1).split(",")]
        idx = {p["slug"]: p for p in produkte}
        return "\n".join(product_card(idx[s], rel, i) for i, s in enumerate(slugs) if s in idx)
    text = re.sub(r"\{\{PRODUKTE:([^}]+)\}\}", cards, text)
    return text


# ---------------------------------------------------------------------------
# Produktdetailseiten
# ---------------------------------------------------------------------------

EEK_FARBEN = {
    "A+++": "#0f7a3d", "A++": "#2f9e46", "A+": "#67b032",
    "A": "#a9c11f", "B": "#e0d000", "C": "#f2a03d", "D": "#e2662a",
}


def eek_block(p):
    """Energieeffizienzklasse im Angebot anzeigen.

    Die Energieverbrauchskennzeichnung verlangt bei Onlineangeboten von
    Raumklimageräten die Anzeige der Effizienzklasse und den Zugang zum
    Produktdatenblatt. TODO vor dem Livegang: die offizielle Labelgrafik des
    Herstellers einbinden und den EPREL-Link je Gerät hinterlegen
    (Registrierung in der EU-Produktdatenbank ist Pflicht des Lieferanten).
    """
    if p["eek_kuehlen"] == "–":
        return ""
    farbe = EEK_FARBEN.get(p["eek_kuehlen"], "#2f9e46")
    heiz = ('<span class="eek-label" style="background:%s">%s</span> Heizen'
            % (EEK_FARBEN.get(p["eek_heizen"], "#2f9e46"), p["eek_heizen"])) \
        if p["eek_heizen"] != "–" else ""
    return ('<p class="eek-row">'
            '<span class="eek-label" style="background:%s">%s</span> Kühlen %s'
            '· <a href="#panel-tech" class="small" data-open-tab="tab-tech">Produktdatenblatt</a>'
            '</p>' % (farbe, p["eek_kuehlen"], heiz))


def seo_titel(p, kat_name):
    """Title unter 60 Zeichen halten – darüber kürzt Google in den Suchergebnissen."""
    zusatz = "%s kW Klimaanlage" % kw_de(p["kw"]) if p["kw"] else kat_name
    for variante in ("%s – %s kaufen | ARKTIK" % (p["name"], zusatz),
                     "%s – %s | ARKTIK" % (p["name"], zusatz),
                     "%s kaufen | ARKTIK" % p["name"],
                     p["name"]):
        if len(variante) <= 60:
            return variante
    return p["name"]


def seo_description(p):
    """Description im Bereich 110–175 Zeichen, weil Google dort abschneidet."""
    fakten = []
    if p["kw"]:
        fakten.append("%s kW" % kw_de(p["kw"]))
    if p["raum_max"]:
        fakten.append("für %d–%d m²" % (p["raum_min"], p["raum_max"]))
    if p["seer"]:
        fakten.append("%s %s" % (p["kennzahl"], kw_de(p["seer"])))
    if p["db"]:
        fakten.append("ab %d dB(A)" % p["db"])
    text = "%s: %s. %s. Lieferung in 3–5 Werktagen aus dem EU-Lager." % (
        p["name"], p["kurz"], ", ".join(fakten) if fakten else p["badge"])
    if len(text) < 110:
        text += " Preis %s inkl. MwSt." % eur(p["preis"])
    if len(text) > 175:
        text = text[:172].rsplit(" ", 1)[0] + " …"
    return text


def product_page(p, produkte):
    url = "produkte/" + p["slug"] + ".html"
    rel = "../"
    kat_name = KATEGORIEN[p["kategorie"]][0]
    img_rel = rel + "assets/img/produkt-" + p["slug"] + ".svg"
    img_abs = SITE["url"] + "/assets/img/produkt-" + p["slug"] + ".svg"

    specs = []
    if p["kw"]:
        specs.append(("Kühlleistung", "%s kW (%s BTU/h)" % (kw_de(p["kw"]), "{:,}".format(p["btu"]).replace(",", "."))))
    if p["raum_max"]:
        specs.append(("Empfohlene Raumgrösse", "%d bis %d m²" % (p["raum_min"], p["raum_max"])))
    if p["seer"]:
        # Split-Geräte werden nach EN 14825 mit SEER bewertet, Einkanal- und
        # Zweikanal-Geräte nach Verordnung 626/2011 mit EER. Die Werte liegen
        # auf verschiedenen Skalen und dürfen nicht verglichen werden.
        specs.append(("%s (Kühlen)" % p["kennzahl"], kw_de(p["seer"])))
    if p.get("kanaele"):
        specs.append(("Bauart", "Einkanal (ein Schlauch)" if p["kanaele"] == 1
                                else "Zweikanal (zwei Schläuche)"))
    if p["scop"]:
        specs.append(("%s (Heizen)" % ("SCOP" if p["kennzahl"] == "SEER" else "COP"),
                      kw_de(p["scop"])))
    specs.append(("Energieeffizienzklasse", "%s (Kühlen) · %s (Heizen)" % (p["eek_kuehlen"], p["eek_heizen"])))
    if p["db"]:
        specs.append(("Schalldruckpegel innen", "ab %d dB(A)" % p["db"]))
    if p["kaeltemittel"] != "–":
        specs.append(("Kältemittel", "%s, Füllmenge %s kg" % (p["kaeltemittel"], kw_de(p["fuellmenge"]))))
    specs.append(("Heizfunktion", "ja" if p["heizen"] else "nein"))
    specs.append(("WLAN / App", "ja" if p["wifi"] else "nein"))
    specs.append(("Abmessungen", p["masse"]))
    specs.append(("Gewicht", "%s kg" % kw_de(float(p["gewicht"]))))
    specs.append(("Montage", MONTAGE_LABEL[p["montage"]]))
    specs.append(("Artikelnummer", p["sku"]))

    spec_rows = "".join("<tr><th scope=\"row\">%s</th><td>%s</td></tr>" % (html.escape(k), html.escape(v))
                        for k, v in specs)

    features = "".join('<li>%s<span>%s</span></li>' % (ICONS["check"], html.escape(f)) for f in p["features"])
    beschreibung = "".join("<p>%s</p>" % html.escape(t) for t in p["beschreibung"])

    if p["montage"] == "fachbetrieb":
        montage_notice = (
            '<div class="notice">%s<div><b>Montage durch einen zertifizierten Betrieb</b>'
            'Diese Split-Anlage wird mit evakuierten Kältemittelleitungen in Betrieb genommen. '
            'Nach EU-Verordnung 2024/573 darf das nur Personal mit Sachkundenachweis (Kategorie I) '
            'ausführen. Wir nennen Ihnen auf Wunsch einen Partnerbetrieb in Ihrer Nähe; '
            'die Montage kostet je nach Aufwand üblicherweise 600 bis 1.200 €.</div></div>'
            % ICONS["warn"])
    elif p["montage"] == "selbst":
        montage_notice = (
            '<div class="notice ok">%s<div><b>Ohne Kälteschein montierbar</b>'
            'Der Kältekreis ist werkseitig geschlossen und geprüft. Für Aufstellung und '
            'Inbetriebnahme wird kein Sachkundenachweis benötigt. Den Elektroanschluss sollte '
            'dennoch eine Elektrofachkraft ausführen.</div></div>' % ICONS["check"])
    elif p.get("kanaele") == 2:
        montage_notice = (
            '<div class="notice ok">%s<div><b>Sofort einsatzbereit – und ohne Unterdruck</b>'
            'Auspacken, beide Schläuche durch die mitgelieferte Doppel-Abdichtung ins Fenster, '
            'Stecker in die Dose. Weil die Luft für den Kühlkreislauf von aussen kommt und dort '
            'wieder abgegeben wird, zieht das Gerät keine warme Luft in den Raum nach. '
            'Keine bauliche Veränderung, in jeder Mietwohnung zulässig.</div></div>'
            % ICONS["check"])
    else:
        montage_notice = (
            '<div class="notice ok">%s<div><b>Sofort einsatzbereit</b>'
            'Auspacken, Abluftschlauch ins Fenster, Stecker in die Dose. Keine bauliche '
            'Veränderung, damit auch in Mietwohnungen ohne Zustimmung des Vermieters nutzbar. '
            'Einkanalgeräte erzeugen dabei Unterdruck im Raum – die Fensterabdichtung ist '
            'deshalb nicht optional.</div></div>'
            % ICONS["check"])

    verwandt = [q for q in produkte if q["kategorie"] == p["kategorie"] and q["slug"] != p["slug"]]
    if len(verwandt) < 3:
        verwandt += [q for q in produkte if q["slug"] != p["slug"] and q not in verwandt]
    verwandt = verwandt[:3]

    body = """
<section class="tight">
  <div class="wrap">
    <div class="pdp">
      <div class="pdp-media">
        <span class="badge badge-float">%(badge)s</span>
        <img src="%(img)s" alt="%(name)s – %(kurz)s" width="460" height="345" fetchpriority="high" decoding="async">
      </div>

      <div>
        <p class="section-eyebrow">%(kat)s</p>
        <h1>%(name)s</h1>
        <p class="sub">%(kurz)s</p>

        <ul class="spec-chips">%(chips)s</ul>

        <div class="buy-box">
          <div class="price-row">
            <span class="price">%(preis)s</span>%(uvp)s
          </div>
          <p class="price-note">inkl. 19 %% MwSt. %(versandhinweis)s ·
            <a href="%(rel)srecht/versand-und-lieferung.html">Lieferzeit 3–5 Werktage</a></p>
          %(eek)s

          <div class="buy-row">
            <div class="qty">
              <button type="button" data-qty-dec aria-label="Menge verringern">−</button>
              <input type="text" inputmode="numeric" value="1" data-qty-main aria-label="Menge">
              <button type="button" data-qty-inc aria-label="Menge erhöhen">+</button>
            </div>
            <button type="button" class="btn btn-accent" data-add-to-cart data-sku="%(sku)s"
                    data-name="%(name)s" data-price="%(preis_num)s"
                    data-url="produkte/%(slug)s.html" data-img="assets/img/produkt-%(slug)s.svg">
              %(cart_icon)s In den Warenkorb
            </button>
          </div>

          <ul class="checklist mt-2">
            <li>%(check)s<span>Auf Lager – Versand aus dem EU-Lager</span></li>
            <li>%(check)s<span>2 Jahre gesetzliche Gewährleistung, Abwicklung über uns</span></li>
            <li>%(check)s<span>14 Tage Widerrufsrecht, Rücksendung nach Absprache</span></li>
          </ul>
        </div>

        %(montage_notice)s

        <h2 class="mt-3" style="font-size:1.2rem">Auf einen Blick</h2>
        <ul class="checklist">%(features)s</ul>
      </div>
    </div>
  </div>
</section>

<section class="bg-soft">
  <div class="wrap">
    <div data-tabs>
      <div class="tabs" role="tablist" aria-label="Produktinformationen">
        <button role="tab" id="tab-desc" aria-controls="panel-desc" aria-selected="true" tabindex="0">Beschreibung</button>
        <button role="tab" id="tab-tech" aria-controls="panel-tech" aria-selected="false" tabindex="-1">Technische Daten</button>
        <button role="tab" id="tab-lief" aria-controls="panel-lief" aria-selected="false" tabindex="-1">Lieferumfang &amp; Montage</button>
      </div>

      <div class="tab-panel" id="panel-desc" role="tabpanel" aria-labelledby="tab-desc">
        <div style="max-width:70ch">%(beschreibung)s</div>
      </div>

      <div class="tab-panel" id="panel-tech" role="tabpanel" aria-labelledby="tab-tech" hidden>
        <div class="table-scroll" style="max-width:760px">
          <table class="spec-table">%(spec_rows)s</table>
        </div>
        <p class="small muted mt-2">%(kennzahl_hinweis)s Die Angaben beziehen sich auf
        Normbedingungen; der reale Verbrauch hängt von Dämmung, Verschattung und Nutzung ab.</p>
      </div>

      <div class="tab-panel" id="panel-lief" role="tabpanel" aria-labelledby="tab-lief" hidden>
        <div class="grid-2" style="align-items:start">
          <div>
            <h3 class="mt-0">Lieferumfang</h3>
            <ul class="checklist">%(lieferumfang)s</ul>
          </div>
          <div>
            <h3 class="mt-0">Montage</h3>
            %(montage_text)s
            <a class="btn btn-ghost btn-sm mt-1" href="%(rel)smontage.html">Montage im Detail ansehen</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head-row">
      <div class="section-head">
        <span class="section-eyebrow">Alternativen</span>
        <h2>Ähnliche Geräte</h2>
      </div>
      <a class="btn btn-ghost btn-sm" href="%(rel)sprodukte.html">Alle Klimaanlagen</a>
    </div>
    <div class="product-grid">%(verwandt)s</div>
  </div>
</section>
""" % {
        "badge": html.escape(p["badge"]), "img": img_rel, "name": html.escape(p["name"]),
        "kurz": html.escape(p["kurz"]), "kat": html.escape(kat_name),
        "chips": "".join("<li>%s</li>" % c for c in filter(None, [
            "%s kW" % kw_de(p["kw"]) if p["kw"] else "",
            "bis %d m²" % p["raum_max"] if p["raum_max"] else "",
            "%s %s" % (p["kennzahl"], kw_de(p["seer"])) if p["seer"] else "",
            ("1 Schlauch" if p["kanaele"] == 1 else "2 Schläuche") if p.get("kanaele") else "",
            "%d dB(A)" % p["db"] if p["db"] else "",
            "Heizen" if p["heizen"] else "",
            "WLAN" if p["wifi"] else "",
        ])),
        "preis": eur(p["preis"]), "preis_num": p["preis"],
        "uvp": ('<span class="price-old">UVP %s</span>' % eur(p["uvp"])) if p.get("uvp") and p["uvp"] > p["preis"] else "",
        "versandhinweis": "· versandkostenfrei" if p["preis"] >= 499 else "· zzgl. 29,90 € Versand",
        "sku": p["sku"], "slug": p["slug"], "rel": rel,
        "cart_icon": ICONS["cart"], "check": ICONS["check"],
        "montage_notice": montage_notice, "features": features, "eek": eek_block(p),
        "kennzahl_hinweis": (
            "SEER und SCOP nach EN 14825."
            if p["kennzahl"] == "SEER" else
            "EER nach Verordnung (EU) 626/2011. Einkanal- und Zweikanalger\u00e4te werden auf "
            "einer eigenen A+++\u2013D-Skala bewertet; ihr EER ist nicht mit dem SEER einer "
            "Split-Anlage vergleichbar."),
        "beschreibung": beschreibung, "spec_rows": spec_rows,
        "lieferumfang": "".join('<li>%s<span>%s</span></li>' % (ICONS["check"], t) for t in lieferumfang(p)),
        "montage_text": montage_text(p),
        "verwandt": "".join(product_card(q, rel, i) for i, q in enumerate(verwandt)),
    }

    offer = {
        "@type": "Offer",
        "url": SITE["url"] + "/" + url,
        "priceCurrency": "EUR",
        "price": "%.2f" % p["preis"],
        "priceValidUntil": "%d-12-31" % date.today().year,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {"@id": SITE["url"] + "/#organisation"},
        "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0.00" if p["preis"] >= 499 else "29.90",
                "currency": "EUR",
            },
            "shippingDestination": {"@type": "DefinedRegion", "addressCountry": "DE"},
            "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {"@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY"},
                "transitTime": {"@type": "QuantitativeValue", "minValue": 2, "maxValue": 4, "unitCode": "DAY"},
            },
        },
        "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "DE",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 14,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/ReturnShippingFees",
        },
    }

    props = []
    if p["kw"]:
        props.append({"@type": "PropertyValue", "name": "Kühlleistung", "value": p["kw"], "unitText": "kW"})
    if p["seer"]:
        props.append({"@type": "PropertyValue", "name": "SEER", "value": p["seer"]})
    if p["scop"]:
        props.append({"@type": "PropertyValue", "name": "SCOP", "value": p["scop"]})
    if p["db"]:
        props.append({"@type": "PropertyValue", "name": "Schalldruckpegel", "value": p["db"], "unitText": "dB(A)"})
    if p["raum_max"]:
        props.append({"@type": "PropertyValue", "name": "Empfohlene Raumgrösse", "value": p["raum_max"], "unitText": "MTK"})

    product_ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": SITE["url"] + "/" + url + "#produkt",
        "name": p["name"],
        "sku": p["sku"],
        "mpn": p["sku"],
        "description": p["beschreibung"][0],
        "image": [img_abs],
        "brand": {"@type": "Brand", "name": "ARKTIK"},
        "category": kat_name,
        "offers": offer,
        "additionalProperty": props,
        # HINWEIS: aggregateRating und review bewusst nicht gesetzt.
        # Bewertungsauszeichnungen dürfen nur mit echten, nachweisbaren
        # Kundenbewertungen ausgeliefert werden (Google-Richtlinien, UWG).
    }
    if p["eek_kuehlen"] != "–":
        product_ld["hasEnergyConsumptionDetails"] = {
            "@type": "EnergyConsumptionDetails",
            "hasEnergyEfficiencyCategory": "https://schema.org/EUEnergyEfficiencyCategory" +
                                           p["eek_kuehlen"].replace("+", "Plus").replace("A", "A"),
        }

    trail = [(kat_name, "produkte.html?kategorie=" + p["kategorie"]), (p["name"], None)]

    return render_page(
        url,
        seo_titel(p, kat_name),
        seo_description(p),
        body,
        trail=trail,
        jsonld=[product_ld],
        nav="shop",
        ogtype="product",
        ogtitle="%s – %s" % (p["name"], p["kurz"]),
    )


def lieferumfang(p):
    base = {
        "monoblock": ["Innengerät mit integriertem Kältekreis", "Zwei Mauerdurchführungen mit Aussenblenden",
                      "Wandhalterung und Befestigungsmaterial", "Infrarot-Fernbedienung mit Batterien",
                      "Kondensatschlauch 1,5 m", "Bedienungsanleitung in deutscher Sprache"],
        "quick-connect": ["Innen- und Aussengerät", "Vorbefüllte Kältemittelleitung 5 m mit Schnellkupplung",
                          "Wandkonsole für das Aussengerät", "Infrarot-Fernbedienung mit Batterien",
                          "Kondensatschlauch und Mauerdurchführung", "Bedienungsanleitung in deutscher Sprache"],
        "split": ["Innen- und Aussengerät", "Montageplatte für das Innengerät",
                  "Infrarot-Fernbedienung mit Batterien", "Kondensatschlauch 1,5 m",
                  "Kältemittelleitungen und Wandkonsole sind nicht enthalten",
                  "Bedienungsanleitung in deutscher Sprache"],
        "multisplit": ["Aussengerät und alle Innengeräte", "Montageplatten für die Innengeräte",
                       "Fernbedienung je Innengerät", "Kondensatschläuche",
                       "Kältemittelleitungen und Konsole sind nicht enthalten",
                       "Bedienungsanleitung in deutscher Sprache"],
        "mobil": ["Mobiles Klimagerät",
                  "Zwei Schläuche à 1,5 m und Doppel-Fensterabdichtung" if p.get("kanaele") == 2
                  else "Abluftschlauch 1,5 m mit Fensteradapter",
                  "Infrarot-Fernbedienung mit Batterien", "Abtropfschale und Ablaufschlauch",
                  "Bedienungsanleitung in deutscher Sprache"],
        "zubehoer": ["Artikel wie beschrieben", "Montagematerial, soweit erforderlich",
                     "Anleitung in deutscher Sprache"],
    }
    return base[p["kategorie"]]


def montage_text(p):
    if p["montage"] == "fachbetrieb":
        return ("<p>Die Anlage wird mit evakuierten Leitungen in Betrieb genommen. Das darf nach "
                "EU-Verordnung 2024/573 nur ein Betrieb mit Sachkundenachweis der Kategorie I. "
                "Rechnen Sie je nach Leitungsweg mit 600 bis 1.200 € Montagekosten.</p>"
                "<p>Auf Anfrage vermitteln wir einen Partnerbetrieb in Ihrer Region und stimmen "
                "den Liefertermin direkt mit ihm ab.</p>")
    if p["montage"] == "selbst":
        return ("<p>Der Kältekreis ist werkseitig befüllt und hermetisch verschlossen. Für die "
                "Montage genügen Kernbohrgerät oder Bohrhammer, Wasserwaage und Schraubendreher – "
                "ein Kälteschein ist nicht erforderlich.</p>"
                "<p>Den elektrischen Anschluss sollte eine Elektrofachkraft übernehmen, "
                "insbesondere wenn ein eigener Stromkreis gelegt wird.</p>")
    if p.get("kanaele") == 2:
        return ("<p>Keine Montage nötig. Beide Schläuche werden durch die mitgelieferte "
                "Doppel-Abdichtung ins Fenster geführt – der eine holt Aussenluft, der andere "
                "gibt sie erwärmt wieder ab.</p>"
                "<p>Achten Sie darauf, beide Durchführungen tatsächlich zu nutzen. Wer den "
                "Zuluftschlauch weglässt, macht aus dem Zweikanalgerät ein Einkanalgerät und "
                "verschenkt genau den Vorteil, für den er es gekauft hat.</p>")
    return ("<p>Keine Montage nötig. Stellen Sie das Gerät auf, führen Sie den Abluftschlauch nach "
            "draussen und schliessen Sie die Fensteröffnung ab – ohne Abdichtung verliert jedes "
            "mobile Gerät einen erheblichen Teil seiner Wirkung.</p>")


# ---------------------------------------------------------------------------
# Produktübersicht
# ---------------------------------------------------------------------------

def listing_page(produkte):
    def counter(key, value):
        return sum(1 for p in produkte if p[key] == value)

    kat_opts = "".join(
        '<label class="filter-opt"><input type="checkbox" name="kategorie" value="%s">'
        '<span>%s</span><span class="count">%d</span></label>' % (k, v[0], counter("kategorie", k))
        for k, v in KATEGORIEN.items())

    mont_opts = "".join(
        '<label class="filter-opt"><input type="checkbox" name="montage" value="%s">'
        '<span>%s</span><span class="count">%d</span></label>' % (k, v, counter("montage", k))
        for k, v in MONTAGE_LABEL.items())

    raum_opts = "".join(
        '<label class="filter-opt"><input type="checkbox" name="raum" value="%s"><span>%s</span></label>' % (k, v)
        for k, v in [("klein", "bis 25 m²"), ("mittel", "25 – 45 m²"), ("gross", "ab 45 m²")])

    preis_opts = "".join(
        '<label class="filter-opt"><input type="checkbox" name="preis" value="%s"><span>%s</span></label>' % (k, v)
        for k, v in [("u500", "unter 500 €"), ("500-900", "500 – 900 €"), ("ab900", "ab 900 €")])

    reihenfolge = sorted(produkte, key=lambda p: (
        {"quick-connect": 0, "monoblock": 1, "split": 2, "multisplit": 3, "mobil": 4, "zubehoer": 5}[p["kategorie"]],
        -p["kw"]))
    cards = "".join(product_card(p, "", i) for i, p in enumerate(reihenfolge))

    kat_teaser = "".join(
        '<a class="cat-card" href="produkte.html?kategorie=%s"><h3>%s</h3><p>%s</p>'
        '<span class="more">%d Geräte %s</span></a>' % (k, v[0], v[1], counter("kategorie", k), ICONS["arrow"])
        for k, v in KATEGORIEN.items())

    itemlist = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Klimaanlagen bei ARKTIK",
        "numberOfItems": len(produkte),
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": p["name"],
             "url": SITE["url"] + "/produkte/" + p["slug"] + ".html"}
            for i, p in enumerate(reihenfolge)
        ],
    }

    body = """
<section class="tight">
  <div class="wrap">
    <div class="section-head">
      <span class="section-eyebrow">Sortiment</span>
      <h1>Klimaanlagen kaufen – %(n)d Geräte für jeden Grundriss</h1>
      <p>Vom mobilen Gerät für die Mietwohnung bis zur Multi-Split-Anlage für die
      komplette Etage. Alle Geräte lagern in der EU und sind in drei bis fünf
      Werktagen bei Ihnen – auch mitten im Hochsommer.</p>
    </div>
    <div class="cat-grid">%(kat_teaser)s</div>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="shop-layout">
      <form class="filters" data-filters aria-label="Produkte filtern">
        <h2>Filter</h2>
        <div class="filter-group"><b>Bauart</b>%(kat_opts)s</div>
        <div class="filter-group"><b>Montage</b>%(mont_opts)s</div>
        <div class="filter-group"><b>Raumgrösse</b>%(raum_opts)s</div>
        <div class="filter-group"><b>Preis</b>%(preis_opts)s</div>
        <div class="filter-group"><b>Ausstattung</b>
          <label class="filter-opt"><input type="checkbox" name="wifi" value="1"><span>WLAN / App</span></label>
          <label class="filter-opt"><input type="checkbox" name="heizen" value="1"><span>Heizfunktion</span></label>
        </div>
        <button type="button" class="btn btn-ghost btn-sm btn-block mt-1" data-filter-reset>Filter zurücksetzen</button>
        <noscript><p class="small muted mt-1">Die Filter benötigen JavaScript.
        Alle Geräte sind rechts vollständig aufgeführt.</p></noscript>
      </form>

      <div>
        <div class="shop-toolbar">
          <span class="result-count" data-result-count>%(n)d Geräte</span>
          <label>Sortieren
            <select data-sort>
              <option value="empfohlen">Empfehlung</option>
              <option value="preis-auf">Preis aufsteigend</option>
              <option value="preis-ab">Preis absteigend</option>
              <option value="leistung">Kühlleistung</option>
              <option value="effizienz">Energieeffizienz</option>
              <option value="leise">Lautstärke</option>
            </select>
          </label>
        </div>

        <div class="product-grid" data-product-grid>%(cards)s</div>

        <div class="empty-state" data-empty hidden>
          <p><strong>Kein Gerät passt zu dieser Kombination.</strong></p>
          <p>Setzen Sie einzelne Filter zurück – oder lassen Sie uns die passende Anlage heraussuchen.</p>
          <a class="btn btn-ghost" href="kontakt.html">Beratung anfragen</a>
        </div>

        <div class="notice info mt-3">%(info)s<div>
          <b>Nicht sicher, welche Leistung Sie brauchen?</b>
          Ein zu grosses Gerät taktet und verbraucht unnötig Strom, ein zu kleines läuft dauerhaft am Anschlag.
          Der <a href="kuehllast-rechner.html">Kühllastrechner</a> liefert in einer Minute die passende Kilowattzahl.
        </div></div>
      </div>
    </div>
  </div>
</section>
""" % {"n": len(produkte), "kat_teaser": kat_teaser, "kat_opts": kat_opts, "mont_opts": mont_opts,
       "raum_opts": raum_opts, "preis_opts": preis_opts, "cards": cards, "info": ICONS["info"]}

    return render_page(
        "produkte.html",
        "Klimaanlagen kaufen – Split, Monoblock & mobil | ARKTIK",
        "Monoblock ohne Aussengerät, Quick-Connect-Split zur Selbstmontage, leise "
        "Split-Anlagen und mobile Klimageräte. Lieferung in 3–5 Werktagen aus dem EU-Lager.",
        body,
        trail=[("Klimaanlagen", None)],
        jsonld=[itemlist],
        scripts='<script src="assets/js/shop.js" defer></script>',
        nav="shop",
    )


# ---------------------------------------------------------------------------
# Inhaltsseiten und Artikel
# ---------------------------------------------------------------------------

def content_pages(produkte):
    urls = []
    quellen = ([(os.path.join(SRC, "pages"), f) for f in sorted(os.listdir(os.path.join(SRC, "pages")))] +
               [(os.path.join(SRC, "artikel"), f) for f in sorted(os.listdir(os.path.join(SRC, "artikel")))])

    for ordner, fname in quellen:
        if not fname.endswith(".html"):
            continue
        raw = open(os.path.join(ordner, fname), encoding="utf-8").read()
        meta, body = read_frontmatter(raw)
        url = meta["url"]
        rel = depth_prefix(url)

        trail = []
        for part in filter(None, [s.strip() for s in meta.get("breadcrumb", "").split("|")]):
            if ">" in part:
                titel, ziel = part.split(">", 1)
                trail.append((titel.strip(), ziel.strip()))
            else:
                trail.append((part, None))

        jsonld = []
        if meta.get("jsonld"):
            jsonld.append(json.loads(expand(meta["jsonld"], rel, produkte)))

        # FAQ-Auszeichnung automatisch aus <details data-faq>
        faqs = re.findall(
            r'<details[^>]*data-faq[^>]*>\s*<summary>(.*?)</summary>(.*?)</details>',
            body, re.S)
        if faqs:
            jsonld.append({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [{
                    "@type": "Question",
                    "name": re.sub(r"<[^>]+>", "", q).strip(),
                    "acceptedAnswer": {"@type": "Answer",
                                       "text": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", a)).strip()},
                } for q, a in faqs],
            })

        if meta.get("typ") == "artikel":
            jsonld.append({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": meta["h1"] if "h1" in meta else meta["title"].split("|")[0].strip(),
                "description": meta["description"],
                "image": SITE["url"] + "/assets/img/og-arktik.png",
                "datePublished": meta.get("datum", "2026-03-01"),
                "dateModified": meta.get("aktualisiert", meta.get("datum", "2026-03-01")),
                "author": {"@type": "Organization", "name": SITE["company"], "url": SITE["url"] + "/"},
                "publisher": {"@id": SITE["url"] + "/#organisation"},
                "mainEntityOfPage": {"@type": "WebPage", "@id": SITE["url"] + "/" + url},
                "inLanguage": "de-DE",
            })

        inhalt = expand(body, rel, produkte)
        if url.startswith("recht/"):
            # Paragrafenprosa braucht kleinere Überschriften als eine Verkaufsseite
            inhalt = '<div class="rechtstext">%s</div>' % inhalt

        urls.append(render_page(
            url,
            meta["title"],
            meta["description"],
            inhalt,
            trail=trail,
            jsonld=jsonld,
            scripts=("".join('<script src="%s%s" defer></script>' % (rel, s.strip())
                             for s in meta.get("scripts", "").split(",") if s.strip())),
            nav=meta.get("nav"),
            ogtype=meta.get("ogtype", "website"),
            robots=meta.get("robots", "index,follow"),
        ))
        if meta.get("sitemap") == "nein":
            urls.pop()
    return urls


# ---------------------------------------------------------------------------
# Nebendateien
# ---------------------------------------------------------------------------

def write_sitemap(urls):
    heute = date.today().isoformat()
    prio = {"index.html": "1.0", "produkte.html": "0.9", "kuehllast-rechner.html": "0.9"}
    entries = []
    for u in urls:
        loc = SITE["url"] + "/" + ("" if u == "index.html" else u)
        p = prio.get(u, "0.7" if u.startswith("produkte/") else
                        "0.4" if u.startswith("recht/") else "0.6")
        freq = "weekly" if u in ("index.html", "produkte.html") else "monthly"
        entries.append("  <url><loc>%s</loc><lastmod>%s</lastmod>"
                       "<changefreq>%s</changefreq><priority>%s</priority></url>"
                       % (html.escape(loc), heute, freq, p))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(entries) + "\n</urlset>\n")
    open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8").write(xml)


def write_robots():
    open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8").write(
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /warenkorb.html\n"
        "Disallow: /*?sortierung=\n\n"
        "Sitemap: %s/sitemap.xml\n" % SITE["url"])


def write_manifest():
    data = {
        "name": SITE["brand"],
        "short_name": "ARKTIK",
        "description": "Klimaanlagen für Wohnräume – Monoblock, Split und mobil.",
        "start_url": "/index.html",
        "scope": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#08131d",
        "lang": "de",
        "icons": [{"src": "/assets/img/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"}],
    }
    open(os.path.join(OUT, "manifest.webmanifest"), "w", encoding="utf-8").write(
        json.dumps(data, ensure_ascii=False, indent=2))


def write_headers():
    """Sicherheits- und Cache-Regeln für Netlify/Cloudflare Pages."""
    open(os.path.join(OUT, "_headers"), "w", encoding="utf-8").write(
        "/*\n"
        "  X-Content-Type-Options: nosniff\n"
        "  X-Frame-Options: SAMEORIGIN\n"
        "  Referrer-Policy: strict-origin-when-cross-origin\n"
        "  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()\n"
        "  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; "
        "script-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'self'\n"
        "\n/assets/*\n"
        "  Cache-Control: public, max-age=31536000, immutable\n")


# ---------------------------------------------------------------------------
# Hauptlauf
# ---------------------------------------------------------------------------

def main():
    produkte = json.load(open(os.path.join(SRC, "products.json"), encoding="utf-8"))

    img_dir = os.path.join(OUT, "assets", "img")
    os.makedirs(img_dir, exist_ok=True)
    for p in produkte:
        open(os.path.join(img_dir, "produkt-%s.svg" % p["slug"]), "w", encoding="utf-8").write(product_svg(p))
    open(os.path.join(img_dir, "favicon.svg"), "w", encoding="utf-8").write(favicon_svg())
    open(os.path.join(img_dir, "og-arktik.svg"), "w", encoding="utf-8").write(og_svg())

    # Produktdaten für den Kühllastrechner
    kompakt = [{
        "slug": p["slug"], "name": p["name"], "kurz": p["kurz"], "kw": p["kw"], "preis": p["preis"],
        "url": "produkte/%s.html" % p["slug"], "img": "assets/img/produkt-%s.svg" % p["slug"],
    } for p in produkte if p["kw"] > 0]
    open(os.path.join(OUT, "assets", "js", "produkte.js"), "w", encoding="utf-8").write(
        "/* Automatisch erzeugt von tools/build.py — nicht von Hand ändern. */\n"
        "window.ARKTIK_PRODUKTE = %s;\n" % json.dumps(kompakt, ensure_ascii=False, indent=0))

    urls = []
    urls += content_pages(produkte)
    urls.append(listing_page(produkte))
    for p in produkte:
        urls.append(product_page(p, produkte))

    urls = [u for u in urls if u]
    write_sitemap(sorted(set(urls)))
    write_robots()
    write_manifest()
    write_headers()

    print("%d Seiten erzeugt in %s" % (len(urls), os.path.relpath(OUT, ROOT)))
    for u in sorted(set(urls)):
        print("  ", u)


if __name__ == "__main__":
    main()
