const input = document.getElementById("input");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

let fontReady = false;

const font = new FontFace("APack", 'url("/apack-futural.woff2") format("woff2")');

font
  .load()
  .then((loaded) => {
    document.fonts.add(loaded);
    fontReady = true;
    status.textContent =
      "Font loaded. Flex packing · type a space after each word · try: hello world the quick brown fox";
    sync();
  })
  .catch(() => {
    status.textContent =
      "Font not found. Run pnpm font:build to generate dist/apack-futural.woff2.";
  });

function sync() {
  if (!fontReady) return;
  preview.textContent = input.value;
}

input.addEventListener("input", sync);
