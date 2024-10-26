import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://books-webapplication-plh6.onrender.com",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  mimeTypes: {
    "application/javascript": ["mjs"],
  },
});
