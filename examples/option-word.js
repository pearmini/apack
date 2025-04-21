import * as ap from "apackjs";

export function optionWord() {
  return ap.render("Hello World", {
    word: {
      stroke: "red",
      strokeWidth: 3,
      fill: "none"
    }
  });
} 