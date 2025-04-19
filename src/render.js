import {cm} from "./namespaces.js";
import fonts from "./hersheytext.json";
import {d3} from "./namespaces.js";

function flex(string, x, y, x1, y1, padding = 0, options = {}) {
  const {shuffle = false} = options;
  const cells = [{x, y, x1, y1, ch: string[0]}];
  const n = string.length;
  const p = padding / 2;
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

function points(key, ch) {
  const idx = (ch) => ch.charCodeAt(0) - 33;
  const font = fonts[key]["chars"];
  const path = ch === " " ? "M8,0" : font[idx(ch)]["d"];
  const plines = [];
  let current = [];
  let mode = "";
  for (let t of path.split(" ")) {
    if (t[0] === "M" || t[0] === "L") (mode = t[0]), (t = t.slice(1));
    const coords = t.split(",").map(Number);
    if (mode === "M" && current.length > 0) {
      plines.push(current);
      current = [];
    }
    current.push(coords);
  }
  plines.push(current);
  return plines;
}

function packWord({string, x, y, width, height, layout, padding, font = "futural"}) {
  const {type, ...options} = layout;
  const cells = type(string, x, y, width, height, padding, options);
  const pointsof = (ch) => points(font, ch);

  const scaled = cells.map((d) => {
    const points = pointsof(d.ch);
    const flatten = points.flat();
    const domainX = d3.extent(flatten, (d) => d[0]);
    const domainY = d3.extent(flatten, (d) => d[1]);
    const {x, y, x1, y1} = d;
    const w = x1 - x;
    const h = y1 - y;
    const sx = d3.scaleLinear(domainX, [0, w]);
    const sy = d3.scaleLinear(domainY, [0, h]);
    for (const list of points) {
      for (const point of list) {
        point[0] = sx(point[0]);
        point[1] = sy(point[1]);
      }
    }
    return {...d, points};
  });

  return {cells, paths: scaled};
}

export function render(
  content,
  {
    size = 80,
    width = size,
    height = size,
    padding = 0.1,
    curve = d3.curveCatmullRom,
    layout = {type: flex},
    font = "futural",
    word = {},
    grid = {},
    background = {},
    style = {},
  } = {},
) {
  if (word) word = Object.assign({fill: "transparent", stroke: "black", strokeWidth: 2}, word);
  if (grid) grid = Object.assign({stroke: "#eee", fill: "none"}, grid);
  if (background) background = Object.assign({fill: "transparent"}, background);

  const words = content.split(" ");

  const line = d3
    .line()
    .curve(curve)
    .x((d) => d[0])
    .y((d) => d[1]);

  const min = Math.min(height, width);

  const data = words.map((d) =>
    packWord({
      string: d,
      x: min * padding,
      y: min * padding,
      width: width * (1 - padding),
      height: height * (1 - padding),
      padding: min * padding * 0.5,
      layout,
      font,
    }),
  );

  const root = cm.svg("svg", {
    width: words.length * width,
    height: height,
    ...style,
    children: [
      background &&
        cm.svg("rect", {
          x: 0,
          y: 0,
          width,
          height,
          ...background,
        }),
      grid &&
        cm.svg("g", data, {
          transform: (_, i) => `translate(${width * i},0)`,
          children: ({cells}) => [
            cm.svg("rect", cells, {
              x: (d) => d.x,
              y: (d) => d.y,
              width: (d) => Math.max(1, d.x1 - d.x),
              height: (d) => Math.max(1, d.y1 - d.y),
              ...grid,
            }),
          ],
        }),
      word &&
        cm.svg("g", data, {
          transform: (_, i) => `translate(${width * i},0)`,
          children: ({paths}) => [
            cm.svg("g", paths, {
              transform: (d) => `translate(${d.x},${d.y})`,
              children: (d) => [cm.svg("path", d.points, {d: line, ...word})],
            }),
          ],
        }),
    ],
  });

  return root.render();
}
