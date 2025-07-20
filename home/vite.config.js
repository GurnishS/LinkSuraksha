import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from 'dotenv';

dotenv.config()
console.log(process.env.BANK_BACKEND_URL)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_CODESPACES': JSON.stringify(process.env.CODESPACES),
    'import.meta.env.VITE_CODESPACE_NAME': JSON.stringify(process.env.CODESPACE_NAME),
  },
  server: {
    host: "0.0.0.0",
    port: 5171,
    proxy: {
      '/gateway-backend/': {
        target: process.env.VITE_GATEWAY_BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway-backend/, '')
      },
      '/bank-backend/': {
        target: process.env.VITE_BANK_BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bank-backend/, '')
      },
      '/gateway-frontend/': {
        target: process.env.VITE_GATEWAY_FRONTEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway-frontend/, '')
      },
      '/bank-frontend/': {
        target: process.env.VITE_BANK_FRONTEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bank-frontend/, '')
      },
      '/merchant-frontend/': {
        target: process.env.VITE_MERCHANT_FRONTEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/merchant-frontend/, '')
      },
    }
  },
});
