import {glyphNameForWord} from "./corpus.js";
import {FALLBACK_CHARS} from "./fallback.js";

export const MIN_PACKED_WORD_LENGTH = 3;

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

// Delimiters that end a word trigger (they stay visible after the packed glyph).
export const DELIMITERS = [" ", ...Object.keys(DELIMITER_GLYPHS)];

export const SPACE_ADVANCE = 150;

function charName(ch) {
  if (ch === " ") return "space";
  return DELIMITER_GLYPHS[ch] ?? ch;
}

const LOOKUP_CHUNK = 80;

function lettersClass() {
  return FALLBACK_CHARS.filter((ch) => /[a-zA-Z]/.test(ch))
    .map(charName)
    .join(" ");
}

export function buildFeatureFile(words) {
  const sorted = [...words]
    .filter((word) => word.length >= MIN_PACKED_WORD_LENGTH)
    .sort((a, b) => b.length - a.length);
  const letterClass = lettersClass();

  const ignoreRules = sorted.map((word) => {
    const target = [...word].map(charName).join(" ");
    return `  ignore sub ${target}' [${letterClass}];`;
  });

  const ligatureRules = sorted.map((word) => {
    const target = [...word].map(charName).join(" ");
    return `  sub ${target} by ${glyphNameForWord(word)};`;
  });

  const lines = [
    "languagesystem latn dflt;",
    "",
    "lookup WORD_IGNORE {",
    ...ignoreRules,
    "} WORD_IGNORE;",
    "",
  ];

  const lookupNames = ["WORD_IGNORE"];

  for (let i = 0; i < ligatureRules.length; i += LOOKUP_CHUNK) {
    const chunk = ligatureRules.slice(i, i + LOOKUP_CHUNK);
    const name = `WORD_LIGS_${Math.floor(i / LOOKUP_CHUNK)}`;
    lookupNames.push(name);
    lines.push(`lookup ${name} {`);
    lines.push(...chunk);
    lines.push(`} ${name};`, "");
  }

  for (const tag of ["liga", "calt"]) {
    lines.push(`feature ${tag} {`);
    for (const name of lookupNames) {
      lines.push(`  lookup ${name};`);
    }
    lines.push(`} ${tag};`, "");
  }

  return lines.join("\n");
}
