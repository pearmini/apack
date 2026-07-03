import {describe, expect, test} from "vitest";
import {buildFeatureFile, DELIMITERS} from "../src/gsub.js";

describe("gsub", () => {
  test("buildFeatureFile packs words without consuming delimiters", () => {
    const fea = buildFeatureFile(["the", "hello"]);
    expect(fea).toContain("sub h e l l o by word_hello;");
    expect(fea).toContain("sub t h e by word_the;");
    expect(fea).toContain("ignore sub h e l l o' [");
    expect(fea).toContain("lookup WORD_IGNORE {");
    expect(fea).not.toContain("sub h e l l o period by word_hello;");
    expect(fea).not.toContain("sub h e l l o space by word_hello;");
    expect(fea).toContain("feature liga");
  });

  test("buildFeatureFile skips single-character words", () => {
    const fea = buildFeatureFile(["a", "the"]);
    expect(fea).not.toContain("sub a by");
    expect(fea).toContain("word_the");
  });

  test("buildFeatureFile lists longer words before shorter words", () => {
    const fea = buildFeatureFile(["he", "hello"]);
    expect(fea.indexOf("sub h e l l o by")).toBeLessThan(fea.indexOf("sub h e by"));
  });

  test("DELIMITERS includes punctuation splitters", () => {
    expect(DELIMITERS).toContain(".");
    expect(DELIMITERS).toContain("?");
    expect(DELIMITERS).toContain(",");
  });
});
