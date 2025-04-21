import * as ap from "apackjs";

export function optionStyle() {
  return ap.render("Hello World", {
    style: {
      styleBackground: "red",
    },
  });
}
