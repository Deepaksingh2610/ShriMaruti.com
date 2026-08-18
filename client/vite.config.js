import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    // Ensure assets use correct base path in production
    base: '/',
    server: {
      port: 5173,
      // Dev proxy: forwards /api requests to the local backend server.
      // In production on Render, VITE_API_URL is set as an env variable
      // and api.js uses that directly instead of the /api relative path.
      proxy: {
        '/api': {
          target: env.VITE_API_URL
            ? env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    build: {
      // Sourcemaps off in production to reduce bundle size
      sourcemap: false,
      // Chunk warning threshold
      chunkSizeWarningLimit: 1000,
    }
  };
});
