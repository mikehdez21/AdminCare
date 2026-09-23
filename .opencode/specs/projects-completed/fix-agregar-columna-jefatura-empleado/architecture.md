# Architecture

## Contexto

- La demo usa SQLite y el path canónico de migraciones es
  `database/migrations/SQLITE` (ver `AppServiceProvider::boot`).
- `migrate:fresh --path=database/migrations/SQLITE` se ejecuta en el reset de Render
  (`scripts/render-demo-reset.sh`) y crea `tableEmpleados` desde
  `006_BD_principal_Empleados_table.php`, que **no** incluye `jefatura_empleado`.
- `table_EmpleadosSeeder` y `DemoSeeder` crean empleados sin ese campo; el fallo se
  dispara al insertar/actualizar desde el API (`EmpleadoController`).

## Por qué una migración nueva y no editar `006`

- Editar `006` solo arreglaría las bases que se recrean con `migrate:fresh`; las
  bases existentes (BD demo local ya migrada) no re-ejecutan `006`.
- Una migración adicional con guard `Schema::hasColumn` da soporte idempotente a
  bases nuevas y existentes, siguiendo el patrón ya usado en
  `018_SQLite_Facturas_add_fecha_compra.php`.

## Cómo encaja el cambio

- Se añade un archivo nuevo en `database/migrations/SQLITE/` con numeración
  consecutiva (siguiente a `019_...`).
- `AppServiceProvider` ya registra el path `SQLITE` automáticamente, así que
  `php artisan migrate` y `migrate:fresh` la encontrarán sin cambios de config.
- No hay cambios en `app/`, `routes/`, API ni frontend.

## Flujo de datos (sin cambios)

```
AddEmpleado/EditEmpleado (React)
  → POST/PUT /api/admin/empleados  (EmpleadoController store/update)
  → Empleado::create/update (columna jefatura_empleado)
  → tableEmpleados (con la nueva columna tras migrar)
```