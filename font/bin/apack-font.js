#!/usr/bin/env node
import {spawnSync} from "child_process";
import path from "path";
import {fileURLToPath} from "url";
import {buildFontArtifacts, defaultCorpusPath} from "../src/build.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontRoot = path.join(__dirname, "..");

function parseArgs(argv) {
  const args = {corpus: defaultCorpusPath(), out: path.join(fontRoot, "dist")};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--corpus") args.corpus = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--font") args.font = argv[++i];
  }
  return args;
}

function runBuild(options) {
  const buildDir = path.join(options.out, "build");
  const {words} = buildFontArtifacts({
    corpusPath: options.corpus,
    font: options.font ?? "futural",
    outDir: buildDir,
  });

  const python =
    process.env.APACK_FONT_PYTHON ?? path.join(fontRoot, ".venv/bin/python3");
  const script = path.join(fontRoot, "scripts/build-font.py");
  const ttfOut = path.join(options.out, "apack-futural.ttf");

  const result = spawnSync(python, [script, buildDir, ttfOut], {
    stdio: "inherit",
    cwd: fontRoot,
  });

  if (result.status !== 0) {
    console.error(
      "\nFont assembly failed. Install Python deps:\n  pip install -r font/requirements.txt\n",
    );
    process.exit(result.status ?? 1);
  }

  console.log(`Built ${words.length} word variants → ${ttfOut}`);
}

const [command, ...rest] = process.argv.slice(2);

if (command === "build") {
  runBuild(parseArgs(rest));
} else {
  console.log(`Usage: apack-font build [--corpus path] [--out dir] [--font futural]`);
  process.exit(command ? 1 : 0);
}
