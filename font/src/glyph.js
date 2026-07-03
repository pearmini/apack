import {packWord} from "apackjs";

export const UNITS_PER_EM = 1000;
export const STROKE_WIDTH = 48;

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

export function pathsToContours(paths, {height = UNITS_PER_EM} = {}) {
  const contours = [];
  for (const {x, y, points} of paths) {
    for (const polyline of points) {
      const translated = polyline.map(([px, py]) => [px + x, py + y]);
      for (const quad of expandPolyline(translated)) {
        contours.push(quad.map((p) => transformPoint(p, height)));
      }
    }
  }
  return contours;
}

export function wordContours(word, options = {}) {
  const {
    cellSize = UNITS_PER_EM,
    padding = 0.1,
    layout = {type: "flex"},
    font = "futural",
    cursive = false,
  } = options;

  const min = cellSize;
  const {paths} = packWord({
    string: word,
    x: min * padding,
    y: min * padding,
    width: cellSize * (1 - padding),
    height: cellSize * (1 - padding),
    layout,
    font,
    cursive,
  });

  return centerInEm(pathsToContours(paths, {height: cellSize}), {em: cellSize, width: cellSize});
}

export function letterContours(ch, options = {}) {
  return wordContours(ch, options);
}

export function delimiterContours(ch, options = {}) {
  return letterContours(ch, options);
}
