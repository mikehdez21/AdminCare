# Tareas

- [x] Revisar la configuración de Vite, Laravel y el Dockerfile.
- [x] Cambiar la salida de producción a `public/build`.
- [x] Hacer relativos a esa salida `assetsDir: 'assets'` y `manifest: 'manifest.json'`.
- [x] Unificar el build en el flujo Laravel/Render y retirar la configuración heredada de Vercel.
- [x] Verificar que scripts y Dockerfile son coherentes sin cambios adicionales.
- [x] Ejecutar TypeScript, lint de `vite.config.ts`, build y `git diff --check`.
- [ ] El lint completo mantiene errores preexistentes de indentación en `src/js/App.tsx`.
- [x] Confirmar que el build genera el manifest y assets en las rutas esperadas.
