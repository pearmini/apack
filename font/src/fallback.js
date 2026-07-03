import {letterContours, UNITS_PER_EM} from "./glyph.js";

export const FALLBACK_CHARS = [
  ..."abcdefghijklmnopqrstuvwxyz",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."0123456789",
];

export function fallbackGlyphs(options = {}) {
  const glyphs = {};
  for (const ch of FALLBACK_CHARS) {
    glyphs[ch] = {
      contours: letterContours(ch, options),
      advance: UNITS_PER_EM,
    };
  }
  return glyphs;
}
