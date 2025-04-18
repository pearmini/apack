import {cm} from "./namespaces.js";

export function render(content) {
  const root = cm.svg("svg", {
    children: [
      cm.svg("text", {
        textContent: content,
        dy: "1em",
      }),
    ],
  });

  return root.render();
}
