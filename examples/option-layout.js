import * as ap from "apackjs";

export function optionLayout() {
  return ap.text("Hello World", {layout: {type: "treemap"}, grid: true}).render();
}
