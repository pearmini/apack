# APack Font

Build, test, and generate installable APack fonts from common English words.

## How it works

1. **Packed words** — top corpus words are rendered with `apackjs` and baked as OpenType ligatures (contextual: word + delimiter).
2. **Fallback letters** — `A–Z`, `a–z`, `0–9` map to letter-in-square glyphs for unknown words.

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
