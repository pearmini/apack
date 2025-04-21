import {d3} from "./namespaces.js";

export function flex(string, x, y, x1, y1, {padding = 0.05, shuffle = false} = {}) {
  const cellSize = Math.min(x1 - x, y1 - y);
  const p = cellSize * padding;
  const cells = [{x, y, x1, y1, ch: string[0]}];
  const n = string.length;
  const seed = d3.sum(string.split(""), (d) => d.charCodeAt(0));
  const random = d3.randomUniform.source(d3.randomLcg(seed))();
  const next = shuffle ? () => random() > 0.5 : (code) => code % 2;
  let i = 1;

  while (cells.length < n && i < n) {
    const char = string[i];
    const code = string.charCodeAt(i);
    const {x, y, x1, y1, ch} = cells[i - 1];
    const w = x1 - x;
    const h = y1 - y;
    const remain = n - i;
    const t = remain <= 1 ? 0.5 : 0.33;
    if (next(code)) {
      const cell0 = {x, y, x1: x + w * t - p, y1, ch};
      const cell1 = {x: x + w * t + p, y, x1, y1, ch: char};
      cells.pop();
      cells.push(cell0, cell1);
    } else {
      const cell0 = {x, y, x1, y1: y + h * t - p, ch};
      const cell1 = {x, y: y + h * t + p, x1, y1, ch: char};
      cells.pop();
      cells.push(cell0, cell1);
    }
    i++;
  }

  return cells;
}
