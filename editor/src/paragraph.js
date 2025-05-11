import * as cm from "charmingjs";
import * as ap from "apackjs";

export function paragraph(W, {cellWidth = 80, cellHeight = cellWidth, ...config} = {}) {
  let {font, word, grid, background, canvas, padding, cursive} = config;
  padding = +padding;

  // Ignore empty words, such as \n.
  const words = W.filter((d) => d.ch.trim() !== "");
  const maxX = Math.max(...words.map((d) => d.x));
  const maxY = Math.max(...words.map((d) => d.y));
  const width = (maxX + 1) * cellWidth + padding * 2;
  const height = (maxY + 1) * cellHeight + padding * 2;

  const svg = cm.svg("svg", {
    width,
    height,
    transform: `translate(${-padding}, ${-padding})`,
    children: [
      canvas && cm.svg("rect", {x: 0, y: 0, width, height, fill: canvas}),
      cm.svg("g", words, {
        transform: (d) => `translate(${d.x * cellWidth + padding * 2}, ${d.y * cellHeight + padding * 2})`,
        children: (d) => {
          const realWidth = cellWidth - padding * 2;
          const realHeight = cellHeight - padding * 2;
          const options = {cellWidth: realWidth, cellHeight: realHeight, font, word, grid, background, cursive};
          try {
            return ap.text(d.ch, options);
          } catch (e) {
            console.error("Error rendering text", e);
            return ap.text("?", options);
          }
        },
      }),
    ].filter(Boolean),
  });

  return svg.render();
}
