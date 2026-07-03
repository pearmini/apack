import {wordGlyph} from "./glyph.js";

export const FALLBACK_CHARS = [
  ..."abcdefghijklmnopqrstuvwxyz",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."0123456789",
];

export function fallbackGlyphs(options = {}, advanceOptions = {}) {
  const glyphs = {};
  for (const ch of FALLBACK_CHARS) {
    glyphs[ch] = wordGlyph(ch, options, advanceOptions);
  }
  return glyphs;
}
