#!/usr/bin/env python3
"""Erzeugt SVG-Wortmarken der Versicherer in assets/logos/.

Die Dateien sind bewusst *Wortmarken in Markenfarbe*, keine Kopien der
offiziellen Bildmarken. Sobald die Freigabe der jeweiligen Gesellschaft
vorliegt, einfach die gleichnamige Datei durch das offizielle Logo ersetzen —
Dateiname und Grösse (240×80) bleiben, am Karussell muss nichts geändert werden.

Aufruf:  python3 tools/make_logos.py
"""
from pathlib import Path
from xml.sax.saxutils import escape

# (Dateiname, Anzeigename, Zeile 2 / Zusatz, Farbe, Stil)
# Stil: "sans" kräftig, "serif" klassisch, "light" schlank, "box" Name in Farbfläche
INSURERS = [
    ("allianz",        "Allianz",              "",                    "#003781", "sans"),
    ("axa",            "AXA",                  "",                    "#00008f", "box"),
    ("ergo",           "ERGO",                 "",                    "#c8102e", "sans"),
    ("hdi",            "HDI",                  "",                    "#007a33", "box"),
    ("generali",       "GENERALI",             "",                    "#c21b17", "serif"),
    ("zurich",         "ZURICH",               "",                    "#2167ae", "sans"),
    ("r-v",            "R+V",                  "Versicherung",        "#005ca9", "sans"),
    ("signal-iduna",   "SIGNAL IDUNA",         "",                    "#d40000", "sans"),
    ("nuernberger",    "NÜRNBERGER",           "Versicherung",        "#0f2a5a", "sans"),
    ("gothaer",        "Gothaer",              "",                    "#008c3e", "serif"),
    ("debeka",         "Debeka",               "",                    "#005a9c", "sans"),
    ("wuerttembergische","Württembergische",   "",                    "#d51317", "sans"),
    ("continentale",   "Continentale",         "",                    "#004b8d", "sans"),
    ("alte-leipziger", "ALTE LEIPZIGER",       "",                    "#003366", "light"),
    ("swiss-life",     "Swiss Life",           "",                    "#e30613", "sans"),
    ("canada-life",    "Canada Life",          "",                    "#e2001a", "serif"),
    ("hallesche",      "Hallesche",            "",                    "#004a99", "sans"),
    ("barmenia",       "Barmenia",             "",                    "#ee7f00", "sans"),
    ("die-bayerische", "die Bayerische",       "",                    "#003883", "light"),
    ("baloise",        "Baloise",              "",                    "#0b1f4d", "sans"),
    ("volkswohl-bund", "VOLKSWOHL BUND",       "",                    "#004a8f", "sans"),
    ("stuttgarter",    "Die Stuttgarter",      "",                    "#c8102e", "serif"),
    ("lv-1871",        "LV 1871",              "",                    "#1d3f7a", "sans"),
    ("hansemerkur",    "HanseMerkur",          "",                    "#003b7a", "sans"),
    ("dkv",            "DKV",                  "Deutsche Krankenversicherung", "#00743e", "box"),
    ("wwk",            "WWK",                  "Versicherungen",      "#004a99", "sans"),
    ("helvetia",       "helvetia",             "",                    "#e2001a", "light"),
    ("vhv",            "VHV",                  "Versicherungen",      "#00427a", "box"),
    ("arag",           "ARAG",                 "",                    "#1a1a1a", "arag"),
    ("roland",         "ROLAND",               "Rechtsschutz",        "#1a1a1a", "roland"),
    ("huk-coburg",     "HUK-COBURG",           "",                    "#004494", "sans"),
    ("devk",           "DEVK",                 "",                    "#0a3d91", "sans"),
    ("lvm",            "LVM",                  "Versicherung",        "#00953b", "sans"),
    ("inter",          "INTER",                "Versicherungsgruppe", "#005ba1", "sans"),
    ("mannheimer",     "Mannheimer",           "",                    "#00427a", "serif"),
    ("bgv",            "BGV",                  "Badische Versicherungen", "#003e7e", "box"),
    ("sv",             "SV SparkassenVersicherung", "",               "#e2001a", "sans"),
    ("condor",         "Condor",               "",                    "#009fe3", "sans"),
    ("cosmosdirekt",   "CosmosDirekt",         "",                    "#00a651", "sans"),
    ("ideal",          "IDEAL",                "Versicherung",        "#004b93", "sans"),
    ("haftpflichtkasse","Die Haftpflichtkasse","",                    "#009ee0", "sans"),
    ("standard-life",  "Standard Life",        "",                    "#003865", "serif"),
]

SANS = "Helvetica Neue, Helvetica, Arial, sans-serif"
SERIF = "Georgia, 'Times New Roman', serif"

def fit(text, base, width=216, per_char=0.62):
    """Schriftgrösse so wählen, dass der Text in die Breite passt."""
    size = base
    while len(text) * size * per_char > width and size > 12:
        size -= 1
    return size

def svg(name, sub, color, style):
    W, H = 240, 80
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{escape(name)}">']
    parts.append(f'<title>{escape(name)}</title>')
    y = 47 if not sub else 41
    if style == "box":
        parts.append(f'<rect x="8" y="12" width="{W-16}" height="{H-24}" rx="6" fill="{color}"/>')
        size = fit(name, 30, per_char=0.70)
        parts.append(f'<text x="{W/2}" y="{y+2}" text-anchor="middle" font-family="{SANS}" font-weight="800" font-size="{size}" letter-spacing="3" fill="#ffffff">{escape(name)}</text>')
        if sub:
            parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-family="{SANS}" font-weight="500" font-size="9" letter-spacing="1.5" fill="#ffffff" opacity=".85">{escape(sub.upper())}</text>')
    elif style == "arag":
        parts.append(f'<rect x="8" y="12" width="{W-16}" height="{H-24}" rx="6" fill="#ffcc00"/>')
        parts.append(f'<text x="{W/2}" y="{y+2}" text-anchor="middle" font-family="{SANS}" font-weight="800" font-size="32" letter-spacing="4" fill="#1a1a1a">{escape(name)}</text>')
    elif style == "roland":
        parts.append(f'<rect x="8" y="12" width="{W-16}" height="{H-24}" rx="6" fill="#ffd500"/>')
        parts.append(f'<text x="{W/2}" y="{y}" text-anchor="middle" font-family="{SANS}" font-weight="800" font-size="30" letter-spacing="3" fill="#1a1a1a">{escape(name)}</text>')
        parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-family="{SANS}" font-weight="500" font-size="9" letter-spacing="1.5" fill="#1a1a1a">{escape(sub.upper())}</text>')
    else:
        if style == "serif":
            fam, weight, base, pc, ls = SERIF, "700", 30, 0.58, 0.5
        elif style == "light":
            fam, weight, base, pc, ls = SANS, "300", 28, 0.60, 2
        else:
            fam, weight, base, pc, ls = SANS, "700", 30, 0.64, 0.5
        size = fit(name, base, per_char=pc)
        parts.append(f'<text x="{W/2}" y="{y+2}" text-anchor="middle" font-family="{fam}" font-weight="{weight}" font-size="{size}" letter-spacing="{ls}" fill="{color}">{escape(name)}</text>')
        if sub:
            parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-family="{SANS}" font-weight="500" font-size="9" letter-spacing="1.5" fill="{color}" opacity=".8">{escape(sub.upper())}</text>')
        parts.append(f'<rect x="{W/2-18}" y="{H-14}" width="36" height="2" rx="1" fill="{color}" opacity=".55"/>')
    parts.append('</svg>')
    return "\n".join(parts) + "\n"

def main():
    out = Path(__file__).resolve().parent.parent / "assets" / "logos"
    out.mkdir(parents=True, exist_ok=True)
    for slug, name, sub, color, style in INSURERS:
        (out / f"{slug}.svg").write_text(svg(name, sub, color, style), encoding="utf-8")
    print(f"{len(INSURERS)} Logos nach {out} geschrieben.")

if __name__ == "__main__":
    main()
