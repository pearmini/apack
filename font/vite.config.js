import {defineConfig} from "vite";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "preview",
  publicDir: path.resolve(__dirname, "dist"),
  server: {
    port: 5174,
  },
  test: {
    environment: "node",
    root: __dirname,
    include: ["test/**/*.spec.js"],
  },
  resolve: {
    alias: {
      apackjs: path.resolve(__dirname, "../src/index.js"),
    },
  },
});
