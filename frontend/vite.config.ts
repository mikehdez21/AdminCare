import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import laravel from 'laravel-vite-plugin'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const proxyTarget = env.VITE_PROXY_TARGET || env.VITE_APP_API || 'https://admincare-production.up.railway.app';
  const isVercel = process.env.VERCEL === '1';
  const isLaravelBuild = !isVercel;

  return {
    plugins: [
      react(),
      ...(isLaravelBuild
        ? [
            laravel({
              input: ['src/js/App.tsx'],
              publicDirectory: '../public',
              buildDirectory: 'build',
            }),
          ]
        : []),
    ],
    build: {
      outDir: isVercel ? 'dist' : '../public/build',
      emptyOutDir: true,
      manifest: isLaravelBuild,
      rollupOptions: {
        input: path.resolve(__dirname, 'src/js/App.tsx'),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/js'),
        '@styles': path.resolve(__dirname, './src/css'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
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
