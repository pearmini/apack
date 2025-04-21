import * as ap from "apackjs";

export function optionGrid() {
  return ap.render("Hello World", {
    grid: {
      stroke: "#ccc",
      fill: "none"
    }
  });
} 