import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  root: "./test",
  server: {
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    exclude: ["charmingjs"],
  },
});
