import {curveCatmullRom, curveCatmullRomClosed, line} from "d3-shape";

const DEFAULT_ALPHA = 0.5;

function cubicAt(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
    mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1],
  ];
}

function sampleSvgPath(pathData, segments = 4) {
  if (!pathData) return [];

  const tokens = pathData.match(/[MC]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens?.length) return [];

  const points = [];
  let i = 0;
  let last = null;

  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === "M") {
      last = [+tokens[i++], +tokens[i++]];
      points.push(last);
    } else if (cmd === "C") {
      const p1 = [+tokens[i++], +tokens[i++]];
      const p2 = [+tokens[i++], +tokens[i++]];
      const p3 = [+tokens[i++], +tokens[i++]];
      for (let t = 1; t <= segments; t++) {
        points.push(cubicAt(last, p1, p2, p3, t / segments));
      }
      last = p3;
    }
  }

  return points;
}

export function isClosedPolyline(points, tolerance = 3) {
  if (points.length < 3) return false;
  const [x0, y0] = points[0];
  const [x1, y1] = points[points.length - 1];
  return Math.hypot(x0 - x1, y0 - y1) <= tolerance;
}

function normalizeForClosed(points, tolerance = 3) {
  if (points.length < 3) return points;
  const [x0, y0] = points[0];
  const [x1, y1] = points[points.length - 1];
  if (Math.hypot(x0 - x1, y0 - y1) <= tolerance) return points.slice(0, -1);
  return points;
}

export function smoothPolyline(points, {closed = false, segments = 4, alpha = DEFAULT_ALPHA, tolerance = 3} = {}) {
  if (points.length < 3 || segments < 1) return points;

  const curve = closed
    ? curveCatmullRomClosed.alpha(alpha)
    : curveCatmullRom.alpha(alpha);
  const input = closed ? normalizeForClosed(points, tolerance) : points;
  if (input.length < 3) return points;

  const pathData = line().curve(curve)(input);
  const sampled = sampleSvgPath(pathData, segments);
  return sampled.length >= 2 ? sampled : points;
}
