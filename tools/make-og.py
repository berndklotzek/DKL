#!/usr/bin/env python3
"""
Rendert das Vorschaubild für soziale Netzwerke als PNG.

Soziale Netzwerke und Suchmaschinen zeigen SVG-Vorschaubilder nicht an, deshalb
muss neben og-kaltstart.svg auch og-kaltstart.png vorliegen. Dieses Skript erzeugt es
mit dem lokal installierten Chrome/Chromium – ohne Bildbibliothek.

    python3 tools/make-og.py [--chrome /pfad/zu/chrome]

Nach jeder Änderung an og_svg() in tools/build.py erneut ausführen.
"""

import argparse
import glob
import http.server
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import threading
import zlib

BREITE, HOEHE = 1200, 630
WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUS = os.path.join(WURZEL, "klimaanlagen")


# --- PNG lesen und schreiben, ohne externe Bibliothek -----------------------

def png_lesen(pfad):
    roh = open(pfad, "rb").read()
    pos, idat = 8, b""
    breite = hoehe = kanaele = 0
    while pos < len(roh):
        laenge = struct.unpack(">I", roh[pos:pos + 4])[0]
        typ = roh[pos + 4:pos + 8]
        daten = roh[pos + 8:pos + 8 + laenge]
        if typ == b"IHDR":
            breite, hoehe, tiefe, farbtyp = struct.unpack(">IIBB", daten[:10])
            if tiefe != 8 or farbtyp not in (2, 6):
                raise SystemExit("Unerwartetes PNG-Format (Tiefe %d, Farbtyp %d)" % (tiefe, farbtyp))
            kanaele = 3 if farbtyp == 2 else 4
        elif typ == b"IDAT":
            idat += daten
        pos += 12 + laenge

    puffer = zlib.decompress(idat)
    schritt = breite * kanaele
    zeilen, vorher, i = [], bytearray(schritt), 0
    for _ in range(hoehe):
        filt = puffer[i]; i += 1
        zeile = bytearray(puffer[i:i + schritt]); i += schritt
        for x in range(schritt):
            a = zeile[x - kanaele] if x >= kanaele else 0
            b = vorher[x]
            c = vorher[x - kanaele] if x >= kanaele else 0
            if filt == 1:
                zeile[x] = (zeile[x] + a) & 255
            elif filt == 2:
                zeile[x] = (zeile[x] + b) & 255
            elif filt == 3:
                zeile[x] = (zeile[x] + (a + b) // 2) & 255
            elif filt == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                zeile[x] = (zeile[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        zeilen.append(zeile)
        vorher = zeile
    return breite, hoehe, kanaele, zeilen


def png_schreiben(pfad, breite, hoehe, kanaele, zeilen):
    roh = bytearray()
    for zeile in zeilen:
        roh.append(0)                      # Filter 0: keiner
        roh += zeile
    def chunk(typ, daten):
        return (struct.pack(">I", len(daten)) + typ + daten +
                struct.pack(">I", zlib.crc32(typ + daten) & 0xffffffff))
    farbtyp = 2 if kanaele == 3 else 6
    with open(pfad, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", breite, hoehe, 8, farbtyp, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(bytes(roh), 9)))
        f.write(chunk(b"IEND", b""))


def zuschneiden(pfad, breite, hoehe):
    b, h, k, zeilen = png_lesen(pfad)
    if (b, h) == (breite, hoehe):
        return
    zeilen = [z[:breite * k] for z in zeilen[:hoehe]]
    png_schreiben(pfad, breite, hoehe, k, zeilen)


# --- Chrome finden und aufrufen --------------------------------------------

def chrome_finden(vorgabe=None):
    if vorgabe:
        return vorgabe
    kandidaten = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"), reverse=True)
    kandidaten += [shutil.which("chromium"), shutil.which("chromium-browser"),
                   shutil.which("google-chrome"), shutil.which("google-chrome-stable"),
                   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    for k in kandidaten:
        if k and os.path.exists(k):
            return k
    raise SystemExit("Kein Chrome/Chromium gefunden – Pfad mit --chrome angeben.")


def schiessen(chrome, url, ziel, breite, hoehe, profil):
    subprocess.run([chrome, "--headless=new", "--no-sandbox", "--disable-gpu",
                    "--hide-scrollbars", "--force-device-scale-factor=1",
                    "--user-data-dir=" + profil,
                    "--virtual-time-budget=3000",
                    "--window-size=%d,%d" % (breite, hoehe),
                    "--screenshot=" + ziel, url],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome")
    ap.add_argument("--port", type=int, default=8799)
    args = ap.parse_args()
    chrome = chrome_finden(args.chrome)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=AUS, **kw)
        def log_message(self, *a):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    basis = "http://127.0.0.1:%d/" % args.port
    profil = tempfile.mkdtemp(prefix="og-chrome-")

    try:
        # 1. Kalibrieren: Der Headless-Browser gibt dem Seiteninhalt weniger Höhe,
        #    als --window-size angibt. Der Unterschied wird hier gemessen.
        with open(os.path.join(AUS, ".og-probe.html"), "w", encoding="utf-8") as f:
            f.write('<!doctype html><meta charset="utf-8">'
                    '<style>html,body{margin:0;height:100%;background:#fff}'
                    '.b{width:100vw;height:100vh;background:#000}</style><div class="b"></div>')
        probe = os.path.join(tempfile.gettempdir(), "og-probe.png")
        schiessen(chrome, basis + ".og-probe.html", probe, BREITE, HOEHE, profil)
        b, h, k, zeilen = png_lesen(probe)
        inhalt_hoehe = 0
        for y in range(h):
            if tuple(zeilen[y][0:3]) == (0, 0, 0):
                inhalt_hoehe = y + 1
        versatz = HOEHE - inhalt_hoehe
        print("Viewport-Versatz gemessen: %d px" % versatz)

        # 2. Rendern mit ausgeglichener Fensterhöhe, danach exakt zuschneiden.
        with open(os.path.join(AUS, ".og-render.html"), "w", encoding="utf-8") as f:
            f.write('<!doctype html><meta charset="utf-8">'
                    '<style>html,body{margin:0;padding:0;height:100%;overflow:hidden}'
                    '.bild{width:100vw;height:100vh;'
                    'background:url("assets/img/og-kaltstart.svg") no-repeat left top / 100% 100%}'
                    '</style><div class="bild"></div>')
        ziel = os.path.join(AUS, "assets", "img", "og-kaltstart.png")
        schiessen(chrome, basis + ".og-render.html", ziel, BREITE, HOEHE + versatz, profil)
        zuschneiden(ziel, BREITE, HOEHE)

        b, h, _, _ = png_lesen(ziel)
        print("og-kaltstart.png geschrieben: %d × %d px, %d kB"
              % (b, h, os.path.getsize(ziel) // 1024))
    finally:
        server.shutdown()
        shutil.rmtree(profil, ignore_errors=True)
        for name in (".og-probe.html", ".og-render.html"):
            pfad = os.path.join(AUS, name)
            if os.path.exists(pfad):
                os.remove(pfad)


if __name__ == "__main__":
    main()
