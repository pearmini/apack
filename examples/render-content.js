import * as ap from "apackjs";

export function renderContent() {
  return ap.text("Hello World").render();
}

export function renderContentWithOptions() {
  return ap
    .text("Hello World", {
      word: {
        stroke: "red",
      },
    })
    .render();
}
