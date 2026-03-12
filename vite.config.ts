import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite'
import path from 'path'


export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/App.tsx'
      ],
      refresh: true,
    }),
    react(),

  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
      '@styles': path.resolve(__dirname, './resources/css'),
    },
  },
  
});
