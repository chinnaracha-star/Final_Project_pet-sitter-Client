import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.VITE_API_PORT || "8083";

  return {
    plugins: [vue(), tailwindcss()],
    define: { global: 'globalThis' },
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
      "/api": `http://localhost:${apiPort}`,
      "/ws": { target: `http://localhost:${apiPort}`, ws: true, changeOrigin: true },
    },
    },
  };
});
