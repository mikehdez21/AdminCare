/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API: string;
  // Add other variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}   