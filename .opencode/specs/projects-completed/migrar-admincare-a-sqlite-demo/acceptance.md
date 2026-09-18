# Criterios de aceptación

El usuario puede archivar este spec cuando los siguientes criterios estén demostrados por evidencia de implementación futura. La creación de estos criterios no implica que ya estén cumplidos.

## Datos y SQLite

- [ ] Un runtime limpio muestra `pdo_sqlite` cargado y `DB_CONNECTION=sqlite`; no requiere servidor PostgreSQL.
- [ ] Migrar desde una base SQLite vacía termina sin schemas PostgreSQL, `LATERAL`, `CREATE SCHEMA`, `CASCADE` incompatible ni vista PostgreSQL fallida.
- [ ] El recorrido de consulta/creación de proveedor, factura y activo funciona contra SQLite.
- [ ] Dos resets consecutivos generan los mismos conteos, referencias y contenido sintético aprobado.
- [ ] Una inspección de seeders no encuentra PII, datos reales, secretos ni archivos reales.

## Cuota y seguridad

- [ ] La suma de proveedores, facturas y activos nunca supera 100 después de una petición válida.
- [ ] Una petición que excede 100 recibe `422` con `DEMO_QUOTA_EXCEEDED` y no deja ninguna fila parcial, incluso con activos anidados en una factura.
- [ ] El límite funciona llamando directamente a la API, sin JavaScript, y es global entre usuarios/sesiones.
- [ ] Una sesión inactiva de más de 30 minutos deja de autorizar operaciones; logout funciona y no quedan cookies/sesiones utilizables.

## Integraciones y privacidad

- [ ] Las rutas o controles de Zebra/impresión, uploads y SoftComputing/OpenAI están ausentes o devuelven explícitamente “no disponible en demo”.
- [ ] Un smoke test no muestra conexiones a hardware, OpenAI, servicios Python ni escritura de archivos de usuario.
- [ ] Logs y errores públicos no exponen SQL, stack traces, tokens, credenciales ni payloads con datos sensibles.

## UI y despliegue

- [ ] `frontend` compila con `pnpm run build` y el lint definido en `frontend/package.json` pasa.
- [ ] Render sirve Laravel y el build React en el modo unificado elegido; recargar una ruta React interna no devuelve 404 del servidor.
- [ ] El desarrollo separado Vite + Laravel sigue documentado y probado, o se registra explícitamente su sustitución.
- [ ] El health check confirma aplicación y SQLite sin revelar configuración interna.
- [ ] Está documentado si el filesystem de Render es efímero o si hay disco persistente; un restart/redeploy no se presenta como almacenamiento de producción.

## Revisión final

- [ ] `routes/api.php`, migraciones, modelos, seeders, frontend y configuración de Render fueron revisados contra este spec.
- [ ] Las decisiones pendientes de arquitectura, disco, QR, credenciales demo y estrategia de reset están resueltas y registradas.
- [ ] Se ejecutó el checklist completo con navegador desktop y móvil y se adjuntaron comandos/resultados reproducibles.
