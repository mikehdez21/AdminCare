# Contrato API de la demo

## Base y autenticación

La base actual está en `routes/api.php` bajo `Route::prefix('HSS1')`; debe conservarse para no romper el frontend. El despliegue unificado preferirá URLs relativas, sesión Laravel/Sanctum y CSRF, evitando una URL de backend distinta en producción.

Mantener endpoints de status y auth necesarios (`/status`, `/dbstatus`, `/auth/check`, `/auth/login`, `/auth/logout`, `/auth/logout-inactive`). `/dbstatus` debe comprobar conexión SQLite y no incluir path, credenciales ni SQL.

La sesión pública debe limitarse a 30 minutos y las respuestas `401` por expiración deben permitir al frontend volver al login sin filtrar información.

## Superficie demo permitida

Tras la auditoría de permisos, conservar solo CRUD y lecturas necesarias para la demostración de almacén, activos, facturas y, si se aprueba, depreciación. Endpoints existentes relevantes están en `routes/api.php`: `/almacengeneral/facturas`, `/proveedores`, `/activosfijos`, movimientos, catálogos y contabilidad.

La cuota server-side se aplica a todas las escrituras de proveedores, facturas y activos, incluidas las rutas `apiResource`, endpoints de relación que creen activos y cualquier servicio llamado desde `FacturaController`. La respuesta de exceso será `422`, con un código estable como `DEMO_QUOTA_EXCEEDED`, `used`, `requested` y `limit: 100`; no confiar en validación client-side.

Las escrituras multi-entidad deben usar transacción. Si falla la cuota, foreign key o validación, no deben persistirse factura, activos, relaciones ni movimientos parciales.

## Funcionalidades desactivadas

- Rutas `/almacengeneral/printer/*` y uso de `app/Services/Printing/ZebraService.php`: deshabilitar antes de abrir sockets/IP o producir una orden física.
- Uploads y `TieneArchivos`, `ArchivosDigitales` y cualquier endpoint de archivo: no aceptar multipart ni escribir en filesystem en demo.
- `/softcomputing/analyze` y rutas de training/prediction de `routes/api.php`, junto con imports de `OpenAIController`/`PricingModelController`: eliminar de la superficie demo o responder desactivado sin llamar a OpenAI, Python ni secretos. La ausencia actual de esos controllers en el worktree debe tratarse como señal de auditoría, no como permiso para arreglarla en esta fase.
- QR solo puede mantenerse si genera una respuesta sin archivo permanente ni integración externa; de lo contrario, desactivar todo el grupo `qraf`.

## Errores y observabilidad

Normalizar errores de validación, cuota, SQLite bloqueado, sesión expirada y funcionalidad desactivada. No devolver `$e->getMessage()` al público, especialmente en `FacturaController` donde hoy se incorpora en respuestas de error. Registrar internamente sin PII, tokens, payloads completos ni secretos.

## Verificaciones de contrato

- `php artisan route:list` debe mostrar únicamente la superficie aprobada y no causar errores por imports de integraciones.
- Probar login, logout, expiración a 30 minutos y permisos con navegador limpio.
- Probar cada creación por API, no solo por UI, con payload que supera la cuota.
- Confirmar que Zebra, uploads, OpenAI y SoftComputing no generan llamadas de red, archivos ni conexiones externas.
