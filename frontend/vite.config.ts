import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to the Rust backend
      "/api": {
        target: "http://localhost:8080", // Adjust port based on Rust server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
