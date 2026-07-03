import {describe, expect, test} from "vitest";
import {letterContours, wordContours} from "../src/glyph.js";

describe("glyph", () => {
  test("letterContours produces filled contours for a", () => {
    const contours = letterContours("a");
    expect(contours.length).toBeGreaterThan(0);
    expect(contours[0]).toHaveLength(4);
  });

  test("wordContours produces more contours than a single letter", () => {
    const letter = letterContours("a");
    const word = wordContours("hello");
    expect(word.length).toBeGreaterThan(letter.length);
  });

  test("wordContours for o uses more contours than an unsmoothed short polyline would", () => {
    const contours = wordContours("o");
    expect(contours.length).toBeGreaterThan(16);
  });
});
