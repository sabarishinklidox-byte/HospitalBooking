import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Load environment variables based on the current mode (development/production)
  // The third argument '' allows loading all env vars, not just those starting with VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          // 2. Use the loaded 'env' object here, NOT import.meta.env
          target: env.VITE_API_URL || 'http://localhost:5000', 
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
