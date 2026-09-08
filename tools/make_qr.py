#!/usr/bin/env python3
"""Erzeugt den QR-Code für die Visitenkarte als SVG und PNG in assets/qr/.

Aufruf:
    python3 tools/make_qr.py                      # nutzt siteUrl aus assets/js/config.js
    python3 tools/make_qr.py https://www.beispiel.de

Benötigt:  pip install "qrcode[pil]"
"""
import re, sys
from pathlib import Path

import qrcode
from qrcode.image.svg import SvgPathImage

ROOT = Path(__file__).resolve().parent.parent
NAVY = "#071224"

def site_url():
    cfg = (ROOT / "assets/js/config.js").read_text(encoding="utf-8")
    m = re.search(r'siteUrl:\s*"([^"]+)"', cfg)
    return m.group(1) if m else "https://example.org/"

def main():
    url = sys.argv[1] if len(sys.argv) > 1 else site_url()
    out = ROOT / "assets/qr"; out.mkdir(parents=True, exist_ok=True)

    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
    qr.add_data(url); qr.make(fit=True)

    svg = qr.make_image(image_factory=SvgPathImage)
    svg_path = out / "qr-code.svg"; svg.save(str(svg_path))
    # Vektor-Pfad in Nachtblau statt Schwarz einfärben, Hintergrund transparent
    text = svg_path.read_text(encoding="utf-8").replace('fill="#000000"', f'fill="{NAVY}"').replace("<path ", f'<path fill="{NAVY}" ', 1)
    svg_path.write_text(text, encoding="utf-8")

    try:
        png = qr.make_image(fill_color=NAVY, back_color="white")
        png = png.resize((2048, 2048), resample=0) if hasattr(png, "resize") else png
        png.save(str(out / "qr-code.png"))
    except Exception as e:  # Pillow fehlt — SVG reicht für den Druck
        print("PNG übersprungen:", e)

    (out / "URL.txt").write_text(url + "\n", encoding="utf-8")
    print("QR-Code für", url, "->", out)

if __name__ == "__main__":
    main()
