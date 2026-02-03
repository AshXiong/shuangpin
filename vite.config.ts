/// <reference types="vitest" />

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [Vue()],
  // --- 添加以下内容 ---
  server: {
    host: '0.0.0.0', // 监听所有地址，包括局域网 IP
    port: 5173,      // 确认端口号，默认是 5173
  },
  // ------------------
  test: {
    globals: true,
    environment: "jsdom",
  },
});