import node from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const umd = {
  input: "src/index.js",
  output: {
    format: "umd",
    name: "ap",
  },
  plugins: [node(), json()],
  onwarn(message, warn) {
    if (message.code === "CIRCULAR_DEPENDENCY") return;
    warn(message);
  },
};

export default [
  {
    ...umd,
    output: {
      ...umd.output,
      file: "dist/apack.umd.js",
    },
  },
  {
    ...umd,
    output: {
      ...umd.output,
      file: "dist/apack.umd.min.js",
    },
    plugins: [...umd.plugins, terser()],
  },
];
