# APack Font

Build, test, and generate installable APack fonts from common English words.

## How it works

1. **Packed words** — top corpus words are rendered with `apackjs` and baked as OpenType substitutions (`sub h e l l o by word_hello`). The same lookups are registered under both **`liga`** and **`calt`** for broader shaper compatibility.
2. **Fallback letters** — `A–Z`, `a–z`, `0–9` map to letter-in-square glyphs for unknown words.

## Letter-spacing limitation

CSS **`letter-spacing`** (any value other than `normal` / `0`) **disables word packing** in browsers. Packed words are implemented as **ligature substitutions** (GSUB lookup type 4). Per the CSS Text spec, user agents must not apply optional ligatures when letter-spacing is active — regardless of whether the rules are tagged `liga` or `calt`.

This is a browser/layout constraint, not something the font file can override. For packed layout, use `letter-spacing: normal` (or `0`). Spacing between packed glyphs is controlled by glyph **advance widths** in the font (see `fitGlyphAdvanceFromPaths` in `src/glyph.js`) and the space character advance (`SPACE_ADVANCE` in `src/gsub.js`).

## Setup

```bash
pnpm install
cd font && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

The build script uses `font/.venv/bin/python3` automatically.

## Commands

```bash
pnpm font:build    # generate dist/apack-futural.ttf + .woff2
pnpm font:test     # vitest
pnpm font:dev      # preview page at http://localhost:5174
```

## CLI

```bash
pnpm --filter font exec apack-font build \
  --corpus data/corpus-500.txt \
  --out dist \
  --font futural
```

## Output

- `dist/build/glyphs.json` — outline data
- `dist/build/features.fea` — OpenType substitution rules
- `dist/apack-futural.ttf` — installable font
- `dist/apack-futural.woff2` — web font
