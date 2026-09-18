# Requisitos

- Corregir la duplicación `build/build` en las rutas de assets generadas para producción.
- El build de Vite debe escribir físicamente en `public/build`.
- El manifest debe estar en `public/build/manifest.json`.
- Las rutas de assets del manifest deben ser relativas como `assets/...`.
- Mantener `buildDirectory: 'build'`, el modo de desarrollo y los aliases existentes.
- Mantener el proxy local para `/api` y `/sanctum` sin añadir URLs de proveedores externos.
- Eliminar de la configuración cualquier rama, variable, comentario o configuración heredada de Vercel que ya no sea útil.
- No modificar Blade, `AppServiceProvider`, los scripts de package ni el Dockerfile: el despliegue actual es un único servicio Docker en Render y ya copia `public` desde la etapa frontend.
