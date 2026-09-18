# Diseño de base de datos SQLite

## Situación actual

`config/database.php` ya declara una conexión `sqlite`, pero el default usa `env('DB_CONNECTION', 'pgsql')`. `.env.example` configura `pgsql`, host, puerto y credenciales PostgreSQL. Hay aproximadamente 40 migraciones, con tablas en schemas `almacengeneral` y `logs`, `CASCADE`, nombres cualificados y SQL PostgreSQL.

Ejemplos concretos:

- `database/migrations/logs/012_BD_principal_SysUserActions.php` ejecuta `CREATE SCHEMA IF NOT EXISTS logs`, crea `logs.tableLog_SysUserActions` y hace `DROP SCHEMA ... CASCADE`.
- `database/migrations/almacengeneral/038_BD_vw_MovimientosAFCompleto.php` crea una vista cualificada, usa `CREATE OR REPLACE VIEW`, `concat(...)` y `LEFT JOIN LATERAL`.
- `app/Models/AlmacenGeneral/ActivosFijos.php` usa `protected $table = 'almacengeneral.tableAF_ActivosFijos'`; el mismo patrón debe auditarse en todos los modelos.

## Estrategia de migración

No se debe intentar ejecutar sin cambios el historial PostgreSQL. Crear una ruta de migraciones SQLite de demo o refactorizar las existentes por fases, documentando qué archivos se conservan solo para PostgreSQL. La estrategia elegida debe:

- usar nombres de tabla sin schema y una convención estable;
- reemplazar `CASCADE`/schemas por `dropIfExists`, foreign keys compatibles y orden de rollback válido;
- habilitar foreign keys de SQLite y probar borrados explícitamente;
- sustituir tipos y defaults no portables por equivalentes soportados por Laravel/SQLite;
- reemplazar la vista PostgreSQL por joins/query builder compatible o una vista SQLite sencilla sin `LATERAL`; si no compensa, implementar el último movimiento en un servicio/query portable;
- reemplazar concatenaciones SQL directas, incluyendo la lógica señalada en `FacturaController`, por concatenación PHP o expresiones compatibles y parametrizadas;
- auditar índices, claves únicas, booleanos, fechas, decimal y autoincremento.

## Tablas y alcance de datos

Conservar solo el subconjunto requerido por los flujos demo: autenticación/autorización, departamentos, empleados, ubicaciones, catálogos de almacén, proveedores, facturas, activos, relaciones, movimientos y los datos mínimos para QR/contabilidad si esos módulos permanecen habilitados. Excluir tablas y columnas de archivos reales, uploads, credenciales externas y datos personales reales.

La cuota cuenta `proveedores + facturas + activos fijos` y se aplica antes de insertar. Los seeders deben tener un número fijo menor que 100, IDs o referencias reproducibles, fechas fijas y contenido sintético claramente identificable.

## Reinicio y filesystem

La ruta de SQLite debe ser configurable (`DB_DATABASE`) y apuntar a un archivo en una ubicación de runtime writable. El plan debe contemplar:

- creación del archivo si falta;
- permisos y directorio existentes antes de migrar;
- `php artisan migrate:fresh --seed` o comando equivalente solo como operación explícita de reset;
- comportamiento tras restart/redeploy de Render;
- backup/export opcional solo si se decide disco persistente, sin convertirlo en requisito de esta demo.

Un reset debe producir los mismos conteos, IDs funcionales, credenciales demo y respuestas principales. No usar Faker aleatorio sin seed fijo ni `now()` sin reloj controlado para datos que se validen.

## Verificaciones de implementación futura

- Ejecutar migración desde base vacía con `pdo_sqlite` cargado.
- Ejecutar rollback/reset y repetirlo dos veces comparando esquema, conteos y fixtures.
- Consultar cada modelo y relación sin prefijos PostgreSQL.
- Probar vista/consulta de movimientos, filtros y paginación con SQLite.
- Intentar superar 100 en una operación simple y en una factura con `cantidad` múltiple; ambas deben fallar sin filas parciales.
- Comprobar que no quedan valores del seeder actual con información potencialmente real.
