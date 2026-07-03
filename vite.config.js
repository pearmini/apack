import {defineConfig} from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "test"),
  test: {
    environment: "jsdom",
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    exclude: ["charmingjs"],
  },
  resolve: {
    alias: {
      apackjs: path.resolve(__dirname, "./src/index.js"),
    },
  },
});
