function createSpan(text) {
  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "pre";
  span.textContent = text;
  return span;
}

export function measureText(text, {fontSize = "16px", fontFamily = "monospace"} = {}) {
  const span = createSpan(text);
  span.style.fontSize = fontSize;
  span.style.fontFamily = fontFamily;
  document.body.appendChild(span);
  const {width, height} = span.getBoundingClientRect();
  document.body.removeChild(span);
  return {width, height};
}

// Input: "hello world EFG\nAB CD"
// Output: ["hello", "world", "EFG", "\n", "AB", "CD"]
export function splitWordsWithNewlines(text) {
  return text.split("\n").flatMap((d, j, lines) => {
    const words = d.split(" ").map((d) => ({ch: d, id: uid()}));
    // Add a newline after each line except the last one.
    if (j < lines.length - 1) {
      words.push({ch: "\n", id: uid()});
    }
    if (words.length === 1 && words[0].ch === "") return [];
    return words;
  });
}

export function uid() {
  return Math.random().toString(36).substring(2, 15);
}

export function positionWords(words, {cols = Infinity} = {}) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    word.x = x;
    word.y = y;
    x += 1;
    if (word.ch === "\n") {
      y += 1;
      x = 0;
    } else if (x >= cols) {
      // Skip the auto-wrap when the next word is an explicit \n — the \n
      // will break the line in both the SVG and the textarea, so adding
      // a phantom row here would make them go out of sync.
      const next = words[i + 1];
      if (!next || next.ch !== "\n") {
        y += 1;
        x = 0;
      }
    }
  }
  return words;
}
