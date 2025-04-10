import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// CommonJS compatible exports
const config = defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['2c99c49c-889f-4ff0-96dc-b25f86062046-00-1ktjncdc9115a.spock.replit.dev', 'localhost']
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          async () => {
            const { cartographer } = await import("@replit/vite-plugin-cartographer");
            return cartographer();
          },
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});

export default config;

// CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = config;
}
