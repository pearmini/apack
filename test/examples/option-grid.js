import * as ap from "apackjs";

export function optionGrid() {
  return ap
    .text("Hello World", {
      grid: {
        stroke: "#ccc",
        fill: "none",
      },
    })
    .render();
}
