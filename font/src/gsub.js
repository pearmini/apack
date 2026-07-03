import {glyphNameForWord} from "./corpus.js";

export const DELIMITER_GLYPHS = {
  ".": "period",
  ",": "comma",
  "!": "exclamation",
  "?": "question",
  ";": "semicolon",
  ":": "colon",
  "'": "quote",
  '"': "quotedbl",
  ")": "parenright",
  "]": "bracketright",
};

export const SPACE_ADVANCE = 250;

function charName(ch) {
  if (ch === " ") return "space";
  if (ch === ".") return "period";
  if (ch === ",") return "comma";
  if (ch === "!") return "exclamation";
  if (ch === "?") return "question";
  if (ch === ";") return "semicolon";
  if (ch === ":") return "colon";
  if (ch === "'") return "quote";
  if (ch === '"') return "quotedbl";
  if (ch === ")") return "parenright";
  if (ch === "]") return "bracketright";
  return ch;
}

const LOOKUP_CHUNK = 80;

export function buildFeatureFile(words) {
  // Longest words first so the shaper prefers e.g. "hello" over "he".
  const sorted = [...words].filter((word) => word.length >= 2).sort((a, b) => b.length - a.length);

  const rules = sorted.map((word) => {
    const target = [...word].map(charName).join(" ");
    const glyph = glyphNameForWord(word);
    // Full ligature including trailing space (no apostrophe — that syntax only
    // replaces the single glyph before the mark, which caused the Hello bug).
    return `  sub ${target} space by ${glyph};`;
  });

  const lines = ["languagesystem latn dflt;", ""];
  const lookupNames = [];

  for (let i = 0; i < rules.length; i += LOOKUP_CHUNK) {
    const chunk = rules.slice(i, i + LOOKUP_CHUNK);
    const name = `WORD_LIGS_${Math.floor(i / LOOKUP_CHUNK)}`;
    lookupNames.push(name);
    lines.push(`lookup ${name} {`);
    lines.push(...chunk);
    lines.push(`} ${name};`, "");
  }

  lines.push("feature liga {");
  for (const name of lookupNames) {
    lines.push(`  lookup ${name};`);
  }
  lines.push("} liga;", "");

  return lines.join("\n");
}
