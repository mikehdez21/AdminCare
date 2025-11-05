import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite'


export default defineConfig({
  
  plugins: [
    laravel({
      input: ['resources/js/App.tsx'],
    }),
    react(),
  ],

  resolve: {
    alias: {
      '@': '/resources/js', // Alias para JS
      '@styles': '/resources/css' // Alias para CSS
    }
  }
});
