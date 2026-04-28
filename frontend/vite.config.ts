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

    // Core React libraries
    if (id.includes('@vitejs') || id.includes('react/jsx-runtime')) return;
    if (id.includes('react-dom/client') || id.includes('react-dom')) return 'vendor-react';
    if (id.includes('react/') || id.match(/node_modules\/react\b/)) return 'vendor-react';

    // Router and state management
    if (id.includes('react-router')) return 'vendor-router';
    if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-thunk')) return 'vendor-redux';

    // PDF and large renderers (but avoid circular refs)
    if (id.includes('pdfjs-dist')) return 'vendor-pdf-core';
    if (id.includes('@react-pdf/renderer')) return 'vendor-pdf';

    // Icons library
    if (id.includes('react-icons')) return 'vendor-icons';

    // UI and forms
    if (id.includes('react-modal') || id.includes('modal')) return 'vendor-ui';
    if (id.includes('axios')) return 'vendor-http';

    return;
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
          chunkSizeWarningLimit: 1500,
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
          chunkSizeWarningLimit: 1500,
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
