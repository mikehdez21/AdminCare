import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import laravel from 'laravel-vite-plugin'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const proxyTarget = env.VITE_PROXY_TARGET || env.VITE_APP_API || 'https://admincare-production.up.railway.app';
  const isVercel = process.env.VERCEL === '1';
  const isLaravelBuild = !isVercel;

  const manualChunks = (id: string) => {
    if (!id.includes('node_modules')) return;

    if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
    if (id.includes('react-router')) return 'vendor-router';
    if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'vendor-redux';
    if (id.includes('@react-pdf/renderer') || id.includes('pdfjs-dist') || id.includes('fontkit')) return 'vendor-pdf';
    if (id.includes('react-icons')) return 'vendor-icons';

    return 'vendor-misc';
  };

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
    build: isVercel
      ? {
          outDir: 'dist',
          emptyOutDir: true,
          rollupOptions: {
            output: {
              manualChunks,
            },
          },
        }
      : {
          outDir: '../public/build',
          emptyOutDir: true,
          manifest: true,
          rollupOptions: {
            input: path.resolve(__dirname, 'src/js/App.tsx'),
            output: {
              manualChunks,
            },
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
