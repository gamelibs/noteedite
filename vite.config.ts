import { defineConfig } from "vite";

export default defineConfig({
  // 可扩展：配置别名、代理、CSS 预处理等
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});