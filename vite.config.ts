import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.VITE_API_PORT || "8082";

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: { "/api": `http://localhost:${apiPort}` },
    },
  };
});
