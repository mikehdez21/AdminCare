# Arquitectura

La configuración de producción de Vite usa `public/build` como `outDir`. Por
tanto, `assetsDir` y `manifest` son relativos a ese directorio y deben ser
`assets` y `manifest.json`, respectivamente.

El plugin de Laravel se ejecuta en el único flujo de build y conserva
`buildDirectory: 'build'`. Su base de producción queda alineada con
`Vite::useBuildDirectory('build')`; el manifest se encuentra en
`public/build/manifest.json` y sus rutas internas no vuelven a anteponer
`build/`. El Dockerfile ya copia todo `public` desde la etapa frontend, por lo
que incluye esta salida sin cambios.

La configuración no mantiene ramas ni variables específicas de Vercel. En
desarrollo conserva el servidor Vite, el proxy de `/api` y `/sanctum`, y los
aliases existentes.
