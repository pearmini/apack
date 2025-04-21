import * as ap from "apackjs";

export function renderContent() {
  return ap.render("Hello World");
}

export function renderContentWithOptions() {
  return ap.render("Hello World", {
    word: {
      stroke: "red",
    },
  });
}
