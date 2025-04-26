import * as ap from "apackjs";

export function optionStyle() {
  return ap
    .text("Hello World", {
      style: {
        styleBackground: "red",
      },
    })
    .render();
}
