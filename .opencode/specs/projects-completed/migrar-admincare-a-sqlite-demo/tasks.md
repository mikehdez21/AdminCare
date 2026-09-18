# Tareas de ejecución futura

Este listado ordena la implementación posterior. Completar cada fase y sus verificaciones antes de avanzar. Los roles son responsables sugeridos, no cambios realizados por este spec.

## Fase 0: decisiones y línea base

- [ ] **Reviewer:** revisar este spec contra `routes/api.php`, `config/database.php`, todas las migraciones y modelos; confirmar nombres de tablas y la definición de unidad de negocio.
- [ ] **Backend:** inventariar SQL PostgreSQL, `LATERAL`, `CASCADE`, schemas, vistas, `CONCAT`, tipos y `$table` cualificados; clasificar cada elemento portable/no portable.
- [ ] **Frontend:** inventariar pantallas y acciones realmente necesarias para el recorrido demo.
- [ ] **DevOps:** comparar Railpack, `render.yaml` y Dockerfile; decidir build, release, health check, puerto y filesystem.

## Fase 1: SQLite y esquema

- [ ] **Backend:** confirmar/instalar `pdo_sqlite` en el runtime PHP y fallar con diagnóstico claro si no está cargado.
- [ ] **Backend:** implementar migraciones SQLite sin schemas PostgreSQL y con foreign keys, índices, uniques y rollbacks probados.
- [ ] **Backend:** reemplazar la vista `038_BD_vw_MovimientosAFCompleto.php` por consulta portable o una vista SQLite compatible.
- [ ] **Backend:** eliminar nombres cualificados de modelos y queries; auditar `app/Models` y controllers.
- [ ] **Backend:** reemplazar SQL/concatenación PostgreSQL específica en controllers y servicios.
- [ ] **Reviewer:** ejecutar migración, reset y rollback sobre una base vacía y revisar diff de esquema.

## Fase 2: dataset y límites

- [ ] **Backend:** crear seeders demo sintéticos, deterministas, idempotentes y separados de `table_UsersSeeder.php`, `table_EmpleadosSeeder.php`, `table_ProveedoresSeeder.php` y `table_ActivosFijosConFacturasSeeder.php` actuales.
- [ ] **Backend:** definir credenciales demo no sensibles y permisos mínimos.
- [ ] **Backend:** implementar servicio/middleware de cuota global de 100 con delta de operaciones anidadas y transacción atómica.
- [ ] **Backend:** añadir comando/operación explícita de reset y documentar su efecto destructivo.
- [ ] **Reviewer:** intentar superar la cuota por cada endpoint y con factura + `cantidad`; verificar cero filas parciales y conteos reproducibles.

## Fase 3: API e integraciones

- [ ] **Backend:** reducir y revisar rutas de `routes/api.php`; desactivar Zebra, uploads y SoftComputing/OpenAI sin llamadas externas.
- [ ] **Backend:** normalizar errores públicos, ocultar excepciones SQL y mantener status/auth/CSRF/Sanctum.
- [ ] **Backend:** configurar sesión máxima de 30 minutos y logout por inactividad.
- [ ] **Reviewer:** probar `route:list`, autorización, expiración, status y ausencia de conexiones/archivos externos.

## Fase 4: frontend

- [ ] **Frontend:** configurar build Vite para origen único Laravel y mantener override para desarrollo separado.
- [ ] **Frontend:** implementar estados de demo, cuota, sesión caducada y funcionalidades desactivadas.
- [ ] **Frontend:** retirar imports/acciones/componentes de integraciones no aptas del bundle aprobado.
- [ ] **Frontend:** ejecutar build, lint y recorrido responsive.

## Fase 5: Render y aceptación

- [ ] **DevOps:** implementar la opción de despliegue elegida, usando el puerto de Render y health check; no asumir PostgreSQL.
- [ ] **DevOps:** decidir disco persistente; documentar explícitamente pérdida de SQLite tras restart si no existe.
- [ ] **DevOps:** ejecutar migraciones/seeders en release o arranque sin reseed destructivo por request.
- [ ] **Reviewer:** probar deploy limpio, restart, reset, logs sin secretos, smoke test público y checklist de `acceptance.md`.
