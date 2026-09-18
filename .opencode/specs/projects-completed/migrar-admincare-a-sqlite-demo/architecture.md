# Arquitectura objetivo

## Decisión propuesta

Usar un único servicio web Laravel en Render que:

- ejecute migraciones y seeders SQLite durante el arranque controlado o mediante una tarea de release;
- sirva la API Laravel bajo el prefijo actual `/api/HSS1`;
- sirva los assets compilados de `frontend` y el fallback SPA desde Laravel;
- escuche en `0.0.0.0` y en el puerto entregado por Render, sustituyendo la suposición fija actual de `railpack.toml` (`php artisan serve --host=0.0.0.0 --port=8080`) por una decisión de implementación pendiente;
- no requiera un proceso PostgreSQL, Node en runtime ni un servicio SoftComputing.

La arquitectura unificada es preferida porque elimina CORS y el acoplamiento de `FRONTEND_URL`, pero la tarea DevOps debe comparar explícitamente un servicio único contra frontend estático + API Laravel separada antes de implementarlo. No existe actualmente `render.yaml` ni `Dockerfile`.

## Capas

- **Presentación:** `frontend/src`, Vite genera assets de producción; el cliente conserva llamadas Axios a la API y muestra límites, expiración y funcionalidades desactivadas.
- **HTTP:** `routes/api.php`, middleware de sesión/Sanctum, autorización existente y respuestas JSON consistentes.
- **Dominio:** controllers/services de `app/`, con un servicio central de cuota de demo y un guard para integraciones desactivadas.
- **Persistencia:** migraciones SQLite normalizadas, sin `almacengeneral.` ni `logs.`; modelos Eloquent sin nombres cualificados de schema.
- **Datos de demo:** seeders dedicados y deterministas, separados de valores potencialmente reales de `database/seeders/table_*`.

## Flujo de despliegue propuesto

1. Build instala dependencias PHP y ejecuta `pnpm ci`/`pnpm run build` dentro de `frontend`.
2. El artefacto React se publica en la ruta que Laravel pueda servir como SPA.
3. Runtime valida `pdo_sqlite`, crea el archivo SQLite si no existe y ejecuta migraciones.
4. Se ejecuta el seeder demo solo con una señal/flag explícita de demo y una estrategia idempotente; no se debe reseedear destructivamente en cada request.
5. Laravel expone health checks de aplicación y base de datos sin revelar secretos.

La estrategia exacta de build, release, almacenamiento y comando de arranque queda para `tasks.md`; este archivo no autoriza cambios operativos.

## Compatibilidad con el desarrollo actual

Hoy Laravel y `frontend` se levantan por separado. La migración debe mantener temporalmente `frontend` con Vite dev server y API Laravel separada para trabajar, mientras añade una prueba del modo compilado servido por Laravel. Las URLs relativas en producción y la configuración CORS/CSRF deben definirse sin romper el modo local.

## Decisiones pendientes

- ¿Se usará Railpack ampliado, `render.yaml` o `Dockerfile`?
- ¿Se selecciona disco persistente o se declara explícitamente el reset tras reinicio?
- ¿El build React se copia a `public/` o se configura otra integración Vite/Laravel?
- ¿Qué usuario demo único/roles se siembran y cómo se rotan sus credenciales?
- ¿Se mantiene QR generado en memoria/descarga o se deshabilita junto con archivos?
