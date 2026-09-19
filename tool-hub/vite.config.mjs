import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
  },
};

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    proxy: apiProxy,
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  preview: {
    host: "0.0.0.0",
    proxy: apiProxy,
  },
  plugins: [react()],
});
