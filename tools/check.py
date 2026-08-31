#!/usr/bin/env python3
"""Prüft die erzeugte Website auf tote Links, kaputtes JSON-LD und SEO-Grundlagen."""
import json, os, re, sys
from html.parser import HTMLParser

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "klimaanlagen")
fehler, warnungen = [], []

seiten = []
for wurzel, _, dateien in os.walk(OUT):
    for d in dateien:
        if d.endswith(".html"):
            seiten.append(os.path.join(wurzel, d))

for pfad in sorted(seiten):
    rel = os.path.relpath(pfad, OUT)
    text = open(pfad, encoding="utf-8").read()

    # 1. Nicht ersetzte Platzhalter
    for m in set(re.findall(r"\{\{[A-Z_:a-z]+\}\}", text)):
        fehler.append("%s: Platzhalter nicht ersetzt: %s" % (rel, m))

    # 2. Interne Links
    for href in re.findall(r'(?:href|src)="([^"]+)"', text):
        if href.startswith(("http", "mailto:", "tel:", "data:", "#")):
            continue
        ziel = href.split("#")[0].split("?")[0]
        if not ziel:
            continue
        voll = os.path.normpath(os.path.join(os.path.dirname(pfad), ziel))
        if not os.path.exists(voll):
            fehler.append("%s: toter Link -> %s" % (rel, href))

    # 3. JSON-LD
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        try:
            json.loads(block)
        except Exception as e:
            fehler.append("%s: JSON-LD ungültig (%s)" % (rel, e))

    # 4. SEO-Grundlagen
    noindex = 'name="robots" content="noindex' in text
    titel = re.search(r"<title>(.*?)</title>", text, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', text)
    h1 = re.findall(r"<h1[^>]*>", text)
    if not titel or not titel.group(1).strip():
        fehler.append("%s: kein <title>" % rel)
    elif not noindex and len(titel.group(1)) > 60:
        warnungen.append("%s: Title %d Zeichen (Google kürzt ab ca. 60)" % (rel, len(titel.group(1))))
    if not desc or not desc.group(1).strip():
        fehler.append("%s: keine Meta-Description" % rel)
    elif not noindex and not (110 <= len(desc.group(1)) <= 175):
        warnungen.append("%s: Description %d Zeichen (Zielbereich 110–175)" % (rel, len(desc.group(1))))
    if len(h1) != 1:
        fehler.append("%s: %d <h1> gefunden (genau eine erwartet)" % (rel, len(h1)))
    if 'rel="canonical"' not in text:
        fehler.append("%s: kein Canonical" % rel)
    for img in re.findall(r"<img\b[^>]*>", text):
        if "alt=" not in img:
            fehler.append("%s: <img> ohne alt-Attribut" % rel)

    # 5. Grobe Tag-Balance
    class P(HTMLParser):
        def __init__(self):
            super().__init__()
            self.stack = []
            self.leer = {"br", "img", "meta", "link", "input", "hr", "source", "path",
                         "circle", "rect", "ellipse", "stop", "use", "polygon", "line"}
        def handle_starttag(self, tag, attrs):
            if tag not in self.leer:
                self.stack.append(tag)
        def handle_endtag(self, tag):
            if tag in self.leer:
                return
            if self.stack and self.stack[-1] == tag:
                self.stack.pop()
            elif tag in self.stack:
                while self.stack and self.stack.pop() != tag:
                    pass
            else:
                fehler.append("%s: schliessendes </%s> ohne Öffnung" % (rel, tag))
    p = P()
    p.feed(text)
    if p.stack:
        warnungen.append("%s: nicht geschlossene Tags: %s" % (rel, ", ".join(p.stack[-5:])))

# Sitemap gegen Dateien prüfen
sm = open(os.path.join(OUT, "sitemap.xml"), encoding="utf-8").read()
for loc in re.findall(r"<loc>(.*?)</loc>", sm):
    pfad = loc.split("/", 3)[-1] if loc.count("/") > 2 else ""
    ziel = os.path.join(OUT, pfad if pfad else "index.html")
    if not os.path.exists(ziel):
        fehler.append("sitemap.xml: verweist auf fehlende Datei %s" % loc)

print("%d Seiten geprüft" % len(seiten))
for w in warnungen:
    print("  WARNUNG  " + w)
for f in fehler:
    print("  FEHLER   " + f)
print("\n%d Fehler, %d Warnungen" % (len(fehler), len(warnungen)))
sys.exit(1 if fehler else 0)
