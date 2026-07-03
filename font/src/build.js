import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {expandCaseVariants, glyphNameForWord, loadCorpus} from "./corpus.js";
import {fallbackGlyphs} from "./fallback.js";
import {buildFeatureFile, DELIMITER_GLYPHS, SPACE_ADVANCE} from "./gsub.js";
import {UNITS_PER_EM, delimiterContours, wordContours} from "./glyph.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildFontArtifacts({
  corpusPath,
  font = "futural",
  layout = {type: "flex"},
  padding = 0.1,
  familyName = "APack",
  styleName = "Regular",
  outDir = path.join(__dirname, "../dist/build"),
} = {}) {
  const words = expandCaseVariants(loadCorpus(corpusPath)).filter((word) => word.length >= 3);
  const glyphs = {
    ".notdef": {contours: [], advance: UNITS_PER_EM},
    space: {contours: [], advance: SPACE_ADVANCE},
  };

  const glyphOptions = {font, layout, padding};

  const fallback = fallbackGlyphs(glyphOptions);
  for (const [ch, data] of Object.entries(fallback)) {
    glyphs[ch] = data;
  }

  for (const [ch, name] of Object.entries(DELIMITER_GLYPHS)) {
    glyphs[name] = {
      contours: delimiterContours(ch, glyphOptions),
      advance: UNITS_PER_EM,
    };
  }

  for (const word of words) {
    glyphs[glyphNameForWord(word)] = {
      contours: wordContours(word, glyphOptions),
      advance: UNITS_PER_EM,
    };
  }

  const cmap = {};
  for (const ch of Object.keys(fallback)) {
    cmap[ch] = ch;
  }
  cmap[" "] = "space";
  for (const [ch, name] of Object.entries(DELIMITER_GLYPHS)) {
    cmap[ch] = name;
  }

  const payload = {
    meta: {
      familyName,
      styleName,
      unitsPerEm: UNITS_PER_EM,
      ascender: UNITS_PER_EM,
      descender: 0,
    },
    glyphs,
    cmap,
  };

  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(path.join(outDir, "glyphs.json"), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(outDir, "features.fea"), buildFeatureFile(words));

  return {outDir, words, glyphs};
}

export function defaultCorpusPath() {
  return path.join(__dirname, "../data/corpus-500.txt");
}
