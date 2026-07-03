import {glyphNameForWord} from "./corpus.js";
import {FALLBACK_CHARS} from "./fallback.js";

// Delimiters that end a word trigger (they stay visible after the packed glyph).
export const DELIMITERS = [" ", ".", ",", "!", "?", ";", ":", "'", '"', ")", "]"];

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

function lettersClass() {
  return FALLBACK_CHARS.filter((ch) => /[a-zA-Z]/.test(ch))
    .map(charName)
    .join(" ");
}

export function buildFeatureFile(words) {
  const sorted = [...words].filter((word) => word.length >= 2).sort((a, b) => b.length - a.length);
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
    `@letters = [${letterClass}];`,
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

  lines.push("feature liga {");
  for (const name of lookupNames) {
    lines.push(`  lookup ${name};`);
  }
  lines.push("} liga;", "");

  return lines.join("\n");
}
