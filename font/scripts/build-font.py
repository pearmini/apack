#!/usr/bin/env python3
"""Assemble APack font from glyphs.json and features.fea using fonttools."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString


def draw_contours(pen, contours):
    for contour in contours:
        if not contour:
            continue
        pen.moveTo(tuple(contour[0]))
        for point in contour[1:]:
            pen.lineTo(tuple(point))
        pen.closePath()


def build_glyph(glyph_data):
    pen = TTGlyphPen(None)
    draw_contours(pen, glyph_data.get("contours", []))
    return pen.glyph(), int(glyph_data.get("advance", 1000))


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: build-font.py <build-dir> <output.ttf>", file=sys.stderr)
        return 1

    build_dir = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    payload = json.loads((build_dir / "glyphs.json").read_text(encoding="utf-8"))
    fea = (build_dir / "features.fea").read_text(encoding="utf-8")

    meta = payload["meta"]
    units = meta["unitsPerEm"]
    glyph_names = list(payload["glyphs"].keys())
    if ".notdef" not in glyph_names:
        glyph_names.insert(0, ".notdef")

    glyf = {}
    hmtx = {}
    for name in glyph_names:
        glyph, advance = build_glyph(payload["glyphs"][name])
        glyf[name] = glyph
        hmtx[name] = (advance, 0)

    fb = FontBuilder(units, isTTF=True)
    fb.setupGlyphOrder(glyph_names)
    fb.setupCharacterMap({ord(ch): name for ch, name in payload["cmap"].items()})
    fb.setupGlyf(glyf)
    fb.setupHorizontalMetrics(hmtx)
    fb.setupHorizontalHeader(ascent=meta["ascender"], descent=meta["descender"])
    fb.setupHead(unitsPerEm=units)
    fb.setupPost()
    fb.setupNameTable(
        {
            "familyName": meta["familyName"],
            "styleName": meta["styleName"],
            "uniqueFontIdentifier": f"{meta['familyName']}-{meta['styleName']}",
            "fullName": f"{meta['familyName']} {meta['styleName']}",
            "psName": f"{meta['familyName']}-{meta['styleName']}",
        }
    )
    fb.setupOS2(
        sTypoAscender=meta["ascender"],
        sTypoDescender=meta["descender"],
        sTypoLineGap=0,
        usWinAscent=meta["ascender"],
        usWinDescent=abs(meta["descender"]),
    )

    font = fb.font
    addOpenTypeFeaturesFromString(font, fea)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    font.save(output_path)

    woff2_path = output_path.with_suffix(".woff2")
    try:
        font.flavor = "woff2"
        font.save(woff2_path)
        print(f"Wrote {woff2_path}")
    except Exception as exc:  # noqa: BLE001
        print(f"WOFF2 skipped: {exc}", file=sys.stderr)

    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
