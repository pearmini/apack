import {d3} from "./namespaces.js";

export function treemap(string, x, y, x1, y1, {padding = 0.05} = {}) {
  const cellSize = Math.min(x1 - x, y1 - y);
  const t = cellSize * padding;
  const data = {
    name: "pack",
    children: string.split("").map((d) => ({name: d, value: 1})),
  };

  const tree = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const treemap = d3
    .treemap()
    .tile(d3.treemapBinary)
    .size([x1 - x, y1 - y])
    .paddingInner(t);

  const root = treemap(tree);

  const cells = root.leaves().map((d) => {
    return {
      x: d.x0 + x,
      x1: d.x1 + x,
      y: d.y0 + y,
      y1: d.y1 + y,
      ch: d.data.name,
    };
  });

  return cells;
}
