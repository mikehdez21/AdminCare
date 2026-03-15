import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';


export default [
  {
    files: ['src/js/**/*.{js,jsx,ts,tsx}', 'vite.config.ts'],
    languageOptions: { globals: {...globals.browser, ...globals.node} },
    rules: {
      indent: ['error', 2], // Indentación de 2 espacios
      quotes: ['error', 'single'], // Usar comillas simples
      semi: ['off'], // Requerir punto y coma

    },

    ignores: [
      'vendor/**',
      'node_modules/**',
      'public/build/**',
      'storage/**',
      'bootstrap/cache/**',
      'database/**',
      'dist/**',
    ],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
];


