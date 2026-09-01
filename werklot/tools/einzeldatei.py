#!/usr/bin/env python3
"""Baut aus index.html + assets/ eine einzige HTML-Datei.

    python3 tools/einzeldatei.py                 -> werklot-einzeldatei.html
    python3 tools/einzeldatei.py --fragment out.html

Die Seite selbst braucht keinen Build; dieses Skript ist nur dafür da, den
Prototyp als eine Datei weiterzugeben (Mailanhang, Vorschau, Präsentation).
--fragment lässt <!doctype>, <html>, <head> und <body> weg und eignet sich
für Umgebungen, die das Grundgerüst selbst mitbringen.
"""
import re
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent


def einbetten(html: str) -> str:
    def css(treffer):
        pfad = WURZEL / treffer.group(1)
        return "<style>\n" + pfad.read_text(encoding="utf-8") + "\n</style>"

    def js(treffer):
        pfad = WURZEL / treffer.group(1)
        return "<script>\n" + pfad.read_text(encoding="utf-8") + "\n</script>"

    html = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">', css, html)
    html = re.sub(r'<script src="(assets/[^"]+)"></script>', js, html)
    return html


def main() -> int:
    quelle = (WURZEL / "index.html").read_text(encoding="utf-8")
    fragment = "--fragment" in sys.argv
    rest = [a for a in sys.argv[1:] if not a.startswith("--")]
    ziel = Path(rest[0]) if rest else WURZEL / "werklot-einzeldatei.html"

    voll = einbetten(quelle)

    if fragment:
        titel = re.search(r"<title>(.*?)</title>", voll, re.S).group(0)
        schrift = "\n".join(re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*fonts\.[^>]*>', voll))
        kopf = re.search(r"<head>(.*?)</head>", voll, re.S).group(1)
        stil = "\n".join(re.findall(r"<style>.*?</style>", kopf, re.S))
        koerper = re.search(r"<body>(.*)</body>", voll, re.S).group(1)
        voll = titel + "\n" + schrift + "\n" + stil + "\n" + koerper

    ziel.write_text(voll, encoding="utf-8")
    print("geschrieben:", ziel, "—", f"{ziel.stat().st_size / 1024:.0f} kB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
