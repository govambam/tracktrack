import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // Root path for Vercel deployment
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "dist", // Vercel expects this folder by default
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy, options) => {
          // Handle proxy errors gracefully
          proxy.on("error", (err, req, res) => {
            console.log("Proxy error:", err);
            res.writeHead(500, {
              "Content-Type": "application/json",
            });
            res.end(
              JSON.stringify({
                error: "Proxy server not available",
                details: "Backend server is not running",
              }),
            );
          });
        },
      },
    },
  },
});
