import fs from "fs";

export function loadCorpus(path) {
  const text = fs.readFileSync(path, "utf8");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

export function expandCaseVariants(words) {
  const expanded = new Set();
  for (const word of words) {
    expanded.add(word);
    if (/^[a-z]+$/.test(word)) {
      expanded.add(word[0].toUpperCase() + word.slice(1));
      expanded.add(word.toUpperCase());
    }
  }
  return [...expanded];
}

export function glyphNameForWord(word) {
  const safe = word.replace(/[^a-zA-Z0-9]/g, "_");
  return `word_${safe}`;
}
