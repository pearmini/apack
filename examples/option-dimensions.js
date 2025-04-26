import * as ap from "apackjs";

export function optionDimensions() {
  return ap
    .text("hello world", {
      cellWidth: 320,
      cellHeight: 320,
      style: {styleBackground: "#F1BB4D"},
      word: {stroke: "#492577", strokeWidth: 10},
      font: "astrology",
    })
    .render();
}
