import {describe, expect, test} from "vitest";
import {isClosedPolyline, smoothPolyline} from "apackjs";

describe("smoothPolyline", () => {
  test("returns short polylines unchanged", () => {
    const points = [
      [0, 0],
      [10, 0],
    ];
    expect(smoothPolyline(points)).toBe(points);
  });

  test("produces more points than a square input", () => {
    const square = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    const smooth = smoothPolyline(square, {segments: 4});
    expect(smooth.length).toBeGreaterThan(square.length);
  });

  test("isClosedPolyline detects closed loops", () => {
    const closed = [
      [8, 8],
      [6, 9],
      [8, 8],
    ];
    const open = [
      [0, 0],
      [5, 5],
      [10, 0],
    ];
    expect(isClosedPolyline(closed)).toBe(true);
    expect(isClosedPolyline(open)).toBe(false);
  });
});
