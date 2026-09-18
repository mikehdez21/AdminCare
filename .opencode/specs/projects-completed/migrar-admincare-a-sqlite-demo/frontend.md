# Plan frontend React/Vite

## Estado actual

El cliente está en `frontend`, con React/TypeScript/Vite, Redux Toolkit y Axios. `frontend/package.json` define `dev`, `build` (`tsc && vite build`) y `lint`. Durante desarrollo se sirve aparte de Laravel; muchas acciones construyen URLs con `/api/HSS1` y `frontend/src/js/variableApi.ts` centraliza parte de la configuración.

## Producción unificada

La opción preferida es compilar con `pnpm run build` en `frontend` y servir el resultado desde el mismo origen Laravel. La tarea de implementación debe elegir la integración exacta, configurar base URL relativa, fallback de rutas React y manejo de assets, y probar recarga directa de una ruta interna. No cambiar esos archivos en esta fase.

Debe quedar documentado el modo local separado: Vite conserva su URL de desarrollo y Laravel conserva su endpoint/API; CORS, cookies `SameSite`, CSRF y `withCredentials` deben funcionar en ambos modos sin hardcodear una URL de producción.

## Cambios funcionales futuros

- Mostrar una etiqueta visible de “Demo” y explicar que los datos son sintéticos y reiniciables.
- Mostrar el uso de cuota (`used/100`) donde se creen proveedores, facturas o activos, pero tratarlo como información auxiliar: la decisión final siempre es del servidor.
- Interpretar `DEMO_QUOTA_EXCEEDED` con un mensaje accionable y sin perder el formulario.
- Redirigir a login ante `401` por sesión caducada y no reintentar mutaciones automáticamente.
- Ocultar/deshabilitar enlaces de Zebra, uploads y SoftComputing, y mostrar “No disponible en la demo” si se llega por una URL antigua.
- Eliminar del bundle las acciones/imports de OpenAI y training si la auditoría confirma que no son parte del flujo demo.
- No mostrar controles que sugieran persistencia de archivos o impresión real.

## Validación

- `pnpm run build` y `pnpm run lint` en `frontend`.
- Navegación directa y refresh de todas las rutas públicas seleccionadas con Laravel sirviendo el bundle.
- Login, expiración, CRUD permitido, error de cuota y reset visualizados en navegador desktop y móvil.
- Red de DevTools sin llamadas a PostgreSQL, OpenAI, SoftComputing, Zebra, QZ Tray o endpoints de upload.
