import * as ap from "apackjs";

export function optionLayout() {
  return ap.render("Hello World", {layout: {type: "treemap"}, grid: true});
}
