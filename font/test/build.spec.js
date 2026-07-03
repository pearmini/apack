import fs from "fs";
import os from "os";
import path from "path";
import {fileURLToPath} from "url";
import {describe, expect, test} from "vitest";
import {buildFontArtifacts} from "../src/build.js";
import {FALLBACK_CHARS} from "../src/fallback.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpusPath = path.join(__dirname, "../data/corpus-500.txt");

describe("build", () => {
  test("buildFontArtifacts writes glyphs.json and features.fea", () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "apack-font-"));

    const {words, glyphs} = buildFontArtifacts({
      corpusPath,
      outDir,
    });

    expect(fs.existsSync(path.join(outDir, "glyphs.json"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "features.fea"))).toBe(true);
    expect(words.length).toBeGreaterThan(100);
    expect(glyphs.word_hello).toBeDefined();

    for (const ch of FALLBACK_CHARS) {
      expect(glyphs[ch]).toBeDefined();
    }
  });
});
