import {isClosedPolyline, packWord, smoothPolyline} from "apackjs";

export const UNITS_PER_EM = 1000;
export const STROKE_WIDTH = 30;

export function expandPolyline(points, halfWidth = STROKE_WIDTH / 2) {
  if (points.length < 2) return [];
  const quads = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * halfWidth;
    const ny = (dx / len) * halfWidth;
    quads.push([
      [x0 + nx, y0 + ny],
      [x1 + nx, y1 + ny],
      [x1 - nx, y1 - ny],
      [x0 - nx, y0 - ny],
    ]);
  }
  return quads;
}

function flipY(y, height = UNITS_PER_EM) {
  return height - y;
}

function transformPoint([x, y], height = UNITS_PER_EM) {
  return [x, flipY(y, height)];
}

export function centerInEm(contours, {em = UNITS_PER_EM, width = UNITS_PER_EM} = {}) {
  const pts = contours.flat();
  if (!pts.length) return contours;

  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const dx = width / 2 - cx;
  const dy = em / 2 - cy;

  return contours.map((ring) => ring.map(([x, y]) => [x + dx, y + dy]));
}

export function centerVertically(contours, {em = UNITS_PER_EM} = {}) {
  const pts = contours.flat();
  if (!pts.length) return contours;

  const ys = pts.map((p) => p[1]);
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const dy = em / 2 - cy;

  return contours.map((ring) => ring.map(([x, y]) => [x, y + dy]));
}

export function boundsFromPaths(paths) {
  let minX = Infinity;
  let maxX = -Infinity;

  for (const {x, points} of paths) {
    for (const polyline of points) {
      for (const [px] of polyline) {
        const gx = px + x;
        minX = Math.min(minX, gx);
        maxX = Math.max(maxX, gx);
      }
    }
  }

  return {minX, maxX};
}

export function fitGlyphAdvanceFromPaths(
  contours,
  paths,
  {sidePadding = 30, strokeWidth = STROKE_WIDTH, em = UNITS_PER_EM} = {},
) {
  const {minX, maxX} = boundsFromPaths(paths);
  if (!isFinite(minX)) return {contours, advance: em};

  const half = strokeWidth / 2;
  const inkLeft = minX - half;
  const inkRight = maxX + half;
  const advance = Math.ceil(inkRight - inkLeft + 2 * sidePadding);
  const shiftX = sidePadding - inkLeft;
  const fitted = contours.map((ring) => ring.map(([x, y]) => [x + shiftX, y]));

  return {contours: fitted, advance};
}

const CURVE_SEGMENTS = 4;

export function pathsToContours(paths, {height = UNITS_PER_EM, segments = CURVE_SEGMENTS} = {}) {
  const contours = [];
  for (const {x, y, points} of paths) {
    for (const polyline of points) {
      const translated = polyline.map(([px, py]) => [px + x, py + y]);
      const closed = isClosedPolyline(translated);
      const smooth = smoothPolyline(translated, {closed, segments});
      for (const quad of expandPolyline(smooth)) {
        contours.push(quad.map((p) => transformPoint(p, height)));
      }
    }
  }
  return contours;
}

export function packWordGlyphs(word, options = {}) {
  const {
    cellSize = UNITS_PER_EM,
    padding = 0.1,
    layout = {type: "flex"},
    font = "futural",
    cursive = false,
  } = options;

  const inset = cellSize * padding;
  const {paths} = packWord({
    string: word,
    x: inset,
    y: inset,
    width: cellSize * (1 - padding),
    height: cellSize * (1 - padding),
    layout,
    font,
    cursive,
  });

  const contours = centerVertically(pathsToContours(paths, {height: cellSize}), {em: cellSize});
  return {paths, contours};
}

export function wordContours(word, options = {}) {
  return packWordGlyphs(word, options).contours;
}

export function wordGlyph(word, options = {}, advanceOptions = {}) {
  const {paths, contours} = packWordGlyphs(word, options);
  return fitGlyphAdvanceFromPaths(contours, paths, advanceOptions);
}

export function letterContours(ch, options = {}) {
  return wordContours(ch, options);
}

export function delimiterContours(ch, options = {}) {
  return letterContours(ch, options);
}
