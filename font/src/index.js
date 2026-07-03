export {buildFontArtifacts, defaultCorpusPath} from "./build.js";
export {loadCorpus, expandCaseVariants, glyphNameForWord} from "./corpus.js";
export {fallbackGlyphs, FALLBACK_CHARS} from "./fallback.js";
export {buildFeatureFile, DELIMITER_GLYPHS, SPACE_ADVANCE} from "./gsub.js";
export {
  wordContours,
  letterContours,
  pathsToContours,
  expandPolyline,
  UNITS_PER_EM,
  STROKE_WIDTH,
} from "./glyph.js";
