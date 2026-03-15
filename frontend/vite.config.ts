import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite'
import path from 'path'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const proxyTarget = env.VITE_PROXY_TARGET || env.VITE_APP_API || 'https://admincare-production.up.railway.app';

  return {
    plugins: [
      react(),

    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/js'),
        '@styles': path.resolve(__dirname, './src/css'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/sanctum': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
