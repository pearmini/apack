import {describe, expect, test} from "vitest";
import {buildFeatureFile} from "../src/gsub.js";

describe("gsub", () => {
  test("buildFeatureFile uses full ligatures with trailing space", () => {
    const fea = buildFeatureFile(["the", "hello"]);
    expect(fea).toContain("sub h e l l o space by word_hello;");
    expect(fea).toContain("sub t h e space by word_the;");
    expect(fea).toContain("feature liga");
    expect(fea).not.toContain("'");
  });

  test("buildFeatureFile skips single-character words", () => {
    const fea = buildFeatureFile(["a", "the"]);
    expect(fea).not.toContain("sub a space");
    expect(fea).toContain("word_the");
  });

  test("longer words are listed before shorter words", () => {
    const fea = buildFeatureFile(["he", "hello"]);
    expect(fea.indexOf("sub h e l l o space")).toBeLessThan(fea.indexOf("sub h e space"));
  });
});
