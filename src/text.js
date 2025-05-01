import {cm, d3} from "./namespaces.js";
import fonts from "./hersheytext.json";
import {flex} from "./flex.js";
import {treemap} from "./treemap.js";

const LAYOUTS = {
  flex: flex,
  treemap: treemap,
};

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

function packWord({string, x, y, width, height, layout, cursive = false, font = "futural"}) {
  const {type, ...options} = layout;
  const pack = LAYOUTS[type];

  if (!pack) throw new Error(`Unknown layout: ${type}`);

  const cells = pack(string, x, y, width, height, options);
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

  let paths = scaled;
  if (cursive) {
    const P = scaled.flatMap((d) => {
      const {x, y, points} = d;
      for (const list of points) {
        for (const point of list) {
          point[0] += x;
          point[1] += y;
        }
      }
      return points;
    });

    paths = [{...scaled[0], points: [P.flat()], x: 0, y: 0}];
  }

  return {cells, paths};
}

export const FONT_FAMILIES = Object.keys(fonts);

export function text(
  content,
  {
    cellSize = 80,
    cellWidth = cellSize,
    cellHeight = cellSize,
    curve = d3.curveCatmullRom,
    padding = 0.1,
    cursive = false,
    layout = {},
    font = "futural",
    word = {},
    grid = false,
    background = {},
    style = {},
  } = {},
) {
  if (word) word = Object.assign({fill: "transparent", stroke: "black", strokeWidth: 2}, word);
  if (grid) grid = Object.assign({stroke: "#eee", fill: "none"}, grid);
  if (background) background = Object.assign({fill: "transparent"}, background);
  layout = Object.assign({type: "flex"}, layout);

  const words = content.split(" ").filter(Boolean);

  const line = d3
    .line()
    .curve(curve)
    .x((d) => d[0])
    .y((d) => d[1]);

  const min = Math.min(cellHeight, cellWidth);

  const data = words.map((d) =>
    packWord({
      string: d,
      x: min * padding,
      y: min * padding,
      width: cellWidth * (1 - padding),
      height: cellHeight * (1 - padding),
      padding: min * padding * 0.5,
      layout,
      font,
      cursive,
    }),
  );

  const width = words.length * cellWidth;
  const height = cellHeight;

  const root = cm.svg("svg", {
    width,
    height,
    styleBackground: "white",
    ...style,
    children: [
      background && cm.svg("rect", {x: 0, y: 0, width, height, ...background}),
      grid &&
        cm.svg("g", data, {
          transform: (_, i) => `translate(${cellWidth * i},0)`,
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
          transform: (_, i) => `translate(${cellWidth * i},0)`,
          children: ({paths}) => [
            cm.svg("g", paths, {
              transform: (d) => `translate(${d.x},${d.y})`,
              children: (d) => [cm.svg("path", d.points, {d: line, ...word})],
            }),
          ],
        }),
    ].filter(Boolean),
  });

  return root;
}
