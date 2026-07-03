const input = document.getElementById("input");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const fontSize = document.getElementById("fontSize");
const fontSizeOut = document.getElementById("fontSizeOut");
const fontWeight = document.getElementById("fontWeight");
const italic = document.getElementById("italic");
const letterSpacing = document.getElementById("letterSpacing");
const letterSpacingOut = document.getElementById("letterSpacingOut");
const wordSpacing = document.getElementById("wordSpacing");
const wordSpacingOut = document.getElementById("wordSpacingOut");
const lineHeight = document.getElementById("lineHeight");
const lineHeightOut = document.getElementById("lineHeightOut");

let fontReady = false;

const font = new FontFace("APack", 'url("/apack-futural.woff2") format("woff2")');

font
  .load()
  .then((loaded) => {
    document.fonts.add(loaded);
    fontReady = true;
    status.hidden = true;
    sync();
  })
  .catch(() => {
    status.textContent =
      "Font not found. Run pnpm font:build to generate dist/apack-futural.woff2.";
  });

function applyStyles() {
  preview.style.fontSize = `${fontSize.value}px`;
  fontSizeOut.textContent = `${fontSize.value}px`;

  preview.style.fontWeight = fontWeight.value;
  preview.style.fontStyle = italic.checked ? "italic" : "normal";

  preview.style.letterSpacing = `${letterSpacing.value}em`;
  letterSpacingOut.textContent = `${letterSpacing.value}em`;

  preview.style.wordSpacing = `${wordSpacing.value}em`;
  wordSpacingOut.textContent = `${wordSpacing.value}em`;

  preview.style.lineHeight = lineHeight.value;
  lineHeightOut.textContent = lineHeight.value;
}

function sync() {
  if (!fontReady) return;
  applyStyles();
  preview.textContent = input.value;
}

for (const el of [
  input,
  fontSize,
  fontWeight,
  italic,
  letterSpacing,
  wordSpacing,
  lineHeight,
]) {
  el.addEventListener("input", sync);
  el.addEventListener("change", sync);
}
