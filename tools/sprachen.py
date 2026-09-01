#!/usr/bin/env python3
"""Erzeugt aus quelle.html je eine Seite pro Sprache — plus sitemap.xml und robots.txt.

    python3 tools/sprachen.py            # schreibt index.html, ru/index.html, sitemap.xml, robots.txt
    python3 tools/sprachen.py --pruefen  # meldet nur, ob die erzeugten Dateien aktuell sind

Warum überhaupt zwei Dateien? Eine URL kann nur in einer Sprache ranken. Solange
beide Fassungen im selben Dokument stehen und per CSS umgeschaltet werden, sieht
eine Suchmaschine eine gemischtsprachige Seite ohne russische Adresse. Getrennte
URLs mit hreflang sind der einzige Weg, in beiden Sprachen gefunden zu werden.

Geschrieben wird weiterhin nur in quelle.html — dort stehen wie bisher beide
Sprachfassungen nebeneinander. Dieses Skript trennt sie.
"""
import html
import json
import re
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent

# TODO: endgültige Domain bestätigen. Punycode-Form, weil sie überall eindeutig ist.
BASIS = "https://xn--seelenfrieden-urnenrckfhrung-l7cd.ch"

# TODO: sobald die echte Rufnummer feststeht, hier eintragen und in den
# strukturierten Daten ergänzen. Solange die Platzhalternummer auf der Seite
# steht, darf sie nicht in die strukturierten Daten — eine falsche Nummer dort
# landet in der Google-Visitenkarte.
TELEFON = None

EMAIL = "info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch"

SPRACHEN = {
    "de": {
        "pfad": "index.html",
        "url": BASIS + "/",
        "titel": "Urnenrückführung weltweit — Seelenfrieden GmbH, Zug",
        "beschreibung": (
            "Urnenrückführung aus der Schweiz in die ganze Welt: Dokumente, Konsulate, "
            "Transport und Übergabe aus einer Hand. Beratung auf Deutsch und Russisch, "
            "rund um die Uhr erreichbar."
        ),
        "og_locale": "de_CH",
        "og_bild": BASIS + "/assets/img/og-de.png",
        "wahl": (
            '    <div class="langswitch" role="group" aria-label="Sprache / Язык">\n'
            '      <span aria-current="true">DE</span>\n'
            '      <a href="/ru/" hreflang="ru" lang="ru">RU</a>\n'
            '    </div>'
        ),
    },
    "ru": {
        "pfad": "ru/index.html",
        "url": BASIS + "/ru/",
        "titel": "Репатриация урны с прахом по всему миру — Seelenfrieden, Цуг",
        "beschreibung": (
            "Перевозка урны с прахом из Швейцарии в любую страну: документы, консульства, "
            "транспорт и передача — под ключ. Консультация на русском и немецком, "
            "круглосуточно."
        ),
        "og_locale": "ru_RU",
        "og_bild": BASIS + "/assets/img/og-ru.png",
        "wahl": (
            '    <div class="langswitch" role="group" aria-label="Sprache / Язык">\n'
            '      <a href="/" hreflang="de" lang="de">DE</a>\n'
            '      <span aria-current="true">RU</span>\n'
            '    </div>'
        ),
    },
}


def entferne_sprache(text: str, sprache: str) -> str:
    """Schneidet alle Elemente mit lang="<sprache>" samt Inhalt heraus.

    Arbeitet auf der Zeichenkette statt über einen Parser, damit der Rest der
    Datei Byte für Byte erhalten bleibt — inklusive der SVG-Attribute, die ein
    HTML-Parser kleinschreiben würde.
    """
    # (?<![-\w]) schliesst data-lang und hreflang aus; das <html>-Element bleibt
    # ohnehin aussen vor, weil sonst das ganze Dokument verschwände.
    muster = re.compile(r'<(?!html\b)(\w+)[^>]*(?<![-\w])lang="%s"[^>]*>' % sprache)
    while True:
        treffer = muster.search(text)
        if not treffer:
            return text
        tag = treffer.group(1)
        auf = re.compile(r"<%s\b" % tag, re.I)
        zu = re.compile(r"</%s\s*>" % tag, re.I)
        i, tiefe = treffer.end(), 1
        while tiefe:
            n_auf, n_zu = auf.search(text, i), zu.search(text, i)
            if n_zu is None:
                raise SystemExit("Kein schliessendes </%s> gefunden." % tag)
            if n_auf and n_auf.start() < n_zu.start():
                tiefe += 1
                i = n_auf.end()
            else:
                tiefe -= 1
                i = n_zu.end()
        text = text[: treffer.start()] + text[i:]


def nur_text(roh: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", roh)).strip()


def fragen_sammeln(seite: str) -> list:
    """Liest die Frage-Antwort-Paare aus dem fertigen Dokument.

    So steht der Text für die strukturierten Daten an genau einer Stelle: im
    Markup. Wer die Frage auf der Seite ändert, ändert sie automatisch mit.
    """
    abschnitt = re.search(r'<section id="fragen">(.*?)</section>', seite, re.S)
    if not abschnitt:
        return []
    paare = re.findall(
        r'<article class="card">\s*<h3>(.*?)</h3>\s*<p[^>]*>(.*?)</p>',
        abschnitt.group(1),
        re.S,
    )
    return [(nur_text(f), nur_text(a)) for f, a in paare]


def strukturierte_daten(sprache: str, cfg: dict, fragen: list) -> str:
    betrieb = {
        "@type": "LocalBusiness",
        "@id": BASIS + "/#betrieb",
        "name": "Seelenfrieden Urnenrückführung GmbH",
        "description": cfg["beschreibung"],
        "url": cfg["url"],
        "image": cfg["og_bild"],
        "email": EMAIL,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Gotthardstrasse 14",
            "postalCode": "6300",
            "addressLocality": "Zug",
            "addressRegion": "ZG",
            "addressCountry": "CH",
        },
        "areaServed": {"@type": "Place", "name": "Weltweit"},
        "availableLanguage": [
            {"@type": "Language", "name": "Deutsch", "alternateName": "de"},
            {"@type": "Language", "name": "Русский", "alternateName": "ru"},
        ],
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday",
                          "Friday", "Saturday", "Sunday"],
            "opens": "00:00",
            "closes": "23:59",
        }],
        "knowsLanguage": ["de", "ru"],
    }
    if TELEFON:
        betrieb["telephone"] = TELEFON

    bloecke = [{"@context": "https://schema.org", **betrieb}]

    if fragen:
        bloecke.append({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "inLanguage": sprache,
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": frage,
                    "acceptedAnswer": {"@type": "Answer", "text": antwort},
                }
                for frage, antwort in fragen
            ],
        })

    return "\n".join(
        '<script type="application/ld+json">\n%s\n</script>'
        % json.dumps(b, ensure_ascii=False, indent=2)
        for b in bloecke
    )


def kopf(sprache: str, cfg: dict, fragen: list) -> str:
    alternates = "\n".join(
        '<link rel="alternate" hreflang="%s" href="%s">' % (s, SPRACHEN[s]["url"])
        for s in SPRACHEN
    )
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{cfg["titel"]}</title>
<meta name="description" content="{cfg["beschreibung"]}">
<link rel="canonical" href="{cfg["url"]}">
{alternates}
<link rel="alternate" hreflang="x-default" href="{SPRACHEN["de"]["url"]}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Seelenfrieden Urnenrückführung GmbH">
<meta name="geo.region" content="CH-ZG">
<meta name="geo.placename" content="Zug">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Seelenfrieden Urnenrückführung GmbH">
<meta property="og:locale" content="{cfg["og_locale"]}">
<meta property="og:title" content="{cfg["titel"]}">
<meta property="og:description" content="{cfg["beschreibung"]}">
<meta property="og:url" content="{cfg["url"]}">
<meta property="og:image" content="{cfg["og_bild"]}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{cfg["titel"]}">
<meta name="twitter:description" content="{cfg["beschreibung"]}">
<meta name="twitter:image" content="{cfg["og_bild"]}">

<link rel="icon" href="{{FAVICON}}">
<link rel="stylesheet" href="{{CSS}}">

{strukturierte_daten(sprache, cfg, fragen)}"""


def baue(sprache: str) -> tuple:
    quelle = (WURZEL / "quelle.html").read_text(encoding="utf-8")
    andere = "ru" if sprache == "de" else "de"
    seite = entferne_sprache(quelle, andere)

    cfg = SPRACHEN[sprache]
    tiefe = "../" if "/" in cfg["pfad"] else ""

    favicon = re.search(r'<link rel="icon" href="([^"]+)">', quelle).group(1)
    neuer_kopf = (
        kopf(sprache, cfg, fragen_sammeln(seite))
        .replace("{FAVICON}", favicon)
        .replace("{CSS}", tiefe + "assets/css/style.css")
    )

    seite = re.sub(r"(?s)<head>\n.*?\n</head>", "<head>\n%s\n</head>" % neuer_kopf, seite, count=1)
    seite = seite.replace('<html lang="de" data-lang="de">', '<html lang="%s" data-lang="%s">' % (sprache, sprache), 1)
    seite = seite.replace("    <!--SPRACHWAHL-->", cfg["wahl"], 1)
    if tiefe:
        seite = seite.replace('src="assets/', 'src="%sassets/' % tiefe)

    return cfg["pfad"], seite


def sitemap() -> str:
    eintraege = []
    for sprache, cfg in SPRACHEN.items():
        alt = "\n".join(
            '    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (s, SPRACHEN[s]["url"])
            for s in SPRACHEN
        )
        eintraege.append(
            "  <url>\n    <loc>%s</loc>\n%s\n"
            '    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>\n'
            "    <changefreq>monthly</changefreq>\n    <priority>%s</priority>\n  </url>"
            % (cfg["url"], alt, SPRACHEN["de"]["url"], "1.0" if sprache == "de" else "0.9")
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(eintraege)
        + "\n</urlset>\n"
    )


def robots() -> str:
    return "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % BASIS


def main() -> int:
    pruefen = "--pruefen" in sys.argv
    dateien = dict(baue(s) for s in SPRACHEN)
    dateien["sitemap.xml"] = sitemap()
    dateien["robots.txt"] = robots()

    veraltet = []
    for pfad, inhalt in dateien.items():
        ziel = WURZEL / pfad
        aktuell = ziel.read_text(encoding="utf-8") if ziel.exists() else None
        if aktuell == inhalt:
            continue
        veraltet.append(pfad)
        if not pruefen:
            ziel.parent.mkdir(parents=True, exist_ok=True)
            ziel.write_text(inhalt, encoding="utf-8")
            print("geschrieben:", pfad)

    if pruefen:
        if veraltet:
            print("Nicht aktuell:", ", ".join(veraltet))
            print("Bitte 'python3 tools/sprachen.py' ausführen.")
            return 1
        print("Alle erzeugten Dateien sind aktuell.")
    elif not veraltet:
        print("Nichts zu tun — alles war bereits aktuell.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
