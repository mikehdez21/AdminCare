# Criterios de aceptación

- `frontend/vite.config.ts` conserva `buildDirectory: 'build'`.
- La ejecución de `pnpm run build` crea `public/build/manifest.json`.
- Los archivos referenciados por el manifest usan rutas `assets/...` y no
  `build/assets/...`.
- No existe una ruta generada `public/build/build/assets/...` como resultado
  de la configuración corregida.
- Los aliases `@` y `@styles` y el modo desarrollo permanecen sin cambios.
- Vite no contiene referencias a Vercel, Railway, `isVercel` ni una salida alternativa `dist`.
- El proxy local de `/api` y `/sanctum` permanece operativo mediante las variables de entorno existentes.
- TypeScript, lint, build y `git diff --check` pasan, o sus fallos
  preexistentes quedan reportados.
