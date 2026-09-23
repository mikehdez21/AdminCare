# Database

## Cambio de esquema

- **Tabla**: `tableEmpleados`
- **Columna a agregar**: `jefatura_empleado` (booleano, `default false`),
  en línea con el cast `'jefatura_empleado' => 'boolean'` del modelo y el envío
  `'1'` / `'0'` del frontend.
- **Tipo objetivo en SQLite**: `boolean` (se almacena como `INTEGER` 0/1).

## Migración nueva

Archivo: `database/migrations/SQLITE/020_BD_principal_Empleados_add_jefatura_empleado.php`

Requisitos de `up()`:
- Guard: `if (! Schema::hasTable('tableEmpleados')) return;`
- Guard: `if (! Schema::hasColumn('tableEmpleados', 'jefatura_empleado'))` →
  `Schema::table(...)` agregando `->boolean('jefatura_empleado')->default(false)`.
- Debe ser segura sobre la BD demo local existente y sobre `migrate:fresh`.

Requisitos de `down()`:
- Guard de tabla y `hasColumn` antes de `dropColumn`, siguiendo el patrón de
  `018_SQLite_Facturas_add_fecha_compra.php`.

## Notas de verificación

- El método `store()` de `EmpleadoController` envía `jefatura_empleado` como valor
  nulo si no viene en el request; `update()` fuerza `?? false`. Con `default(false)`
  el insert no falla aunque llegue `null` → comprobar la semántica del guard.
- No se necesitan cambios de seeders (el seed funciona sin el campo; al agregar la
  columna con default, los empleados demo quedan con `0`).