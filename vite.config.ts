import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Three.js is an intentional deferred payload for immersive exploration.
    // Keep it isolated so route/application chunks retain a meaningful 500 kB budget.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/');
          if (normalizedId.includes('/node_modules/three/')) return 'three-vendor';
        },
      },
    },
  },
  server: {
    // Keep the development server on this machine unless a developer
    // deliberately opts into LAN exposure with a CLI --host flag.
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
