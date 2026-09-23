# Tasks

1. **Crear la migración SQLite** `database/migrations/SQLITE/020_BD_principal_Empleados_add_jefatura_empleado.php`
   - Implementar `up()` con guard de tabla + `hasColumn`, añadiendo
     `->boolean('jefatura_empleado')->default(false)`.
   - Implementar `down()` con los mismos guards (idempotente).
   - Seguir el estilo de `018_SQLite_Facturas_add_fecha_compra.php`.
   - Verificado con: revisión estática del código de la migración y `git diff --check`.

2. **Verificar que no falten referencias en otras migraciones**
   - Confirmar que no existen otras migraciones que creen o alteren `tableEmpleados`
     de forma que choquen con la nueva columna (solo `006` crea la tabla).
   - Verificado con: búsqueda `grep tableEmpleados|jefatura_empleado`.

3. **No modificar código de aplicación**
   - Modelo `Empleado`, `EmpleadoController`, rutas, API y frontend quedan intactos.
   - Verificado con: `git status` / diff limitado a la migración nueva.

## Verificaciones no ejecutables por agentes

- Ejecutar `php artisan migrate` / `migrate:fresh --seed` sobre la BD demo local
  (requiere `php.exe`, prohibido por AGENTS.md). El usuario lo validará.
- Alta/edición de un empleado desde la UI o el API tras migrar.