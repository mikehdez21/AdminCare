# Tasks — Implementación ordenada

> Verificación: estática/repositorio (sin levantar servidores). `php.exe` está prohibido para
> agentes sin autorización explícita; la recarga de la BD local de demo la valida el usuario.

## T1. Schema SQLite — Empleados (backend-agent)
- Editar `database/migrations/SQLITE/006_BD_principal_Empleados_table.php`:
  - `email_empleado`: `->string(255)->unique()->nullable();`
  - `firma_movimientos`: `->string(255)->nullable();`
- Verificación: `git diff --check` + inspección del archivo.

## T2. Schema SQLite — PK Depreciación (backend-agent)
- Editar `database/migrations/SQLITE/012_SQLite_demo_schema.php`:
  - `tableAF_DepreciacionActivo`: `bigIncrements('id_depreciacionaf')` (antes `id_depreciacion`).
- Verificación: `git diff --check` + inspección; confirma que ningún FK de otra tabla en 012
  referencia la PK de esta tabla (no hay).

## T2b. Schema SQLite — Alineación 012 con 041 (observaciones del reviewer, backend-agent)
- En `tableAF_DepreciacionActivo` (012):
  - `id_estatus_depreciacion`: quitar `->nullable()` (queda NOT NULL).
  - `fecha_calculo_depreciacion`: quitar `->nullable()` (queda NOT NULL).
  - Agregar índice único `(id_activo_fijo, anio_depreciacionaf)` con nombre
    `uk_activo_anio_deprec` (igual a 041).
- Confirmar cobertura: `DepreciacionController` (activar/calcular) y `DemoSeeder` siempre
  envían ambos campos.
- Verificación: `git diff --check` + revisión de todos los `Depreciacion::create`/inserts.

## T3. `$fillable` de modelos (backend-agent)
- `app/Models/Empleado.php`: agregar `'email_empleado'`, `'telefono_empleado'`,
  `'firma_movimientos'` a `$fillable`.
- `app/Models/AlmacenGeneral/Depreciacion.php`: eliminar `'metodo_depreciacionaf'` de
  `$fillable` (columna inexistente).
- `app/Models/AlmacenGeneral/MovimientosActivos.php`: eliminar `'id_usuario'` de `$fillable`
  (columna inexistente en 012 y 032).
- Verificación: `php -l` no ejecutable; inspección estática de archivos y `git diff --check`.

## T4. Verificación de seeders (backend-agent)
- Confirmar que `DemoSeeder` y `table_EmpleadosSeeder` son coherentes con el nuevo `$fillable`
  y la nulabilidad (ya envían email/telefono/firma; con los cambios persisten sin fallar).
- No cambiar la lógica de los seeders salvo que se detecte una columna NOT NULL no cubierta.
- Verificación: revisión línea por línea de columnas NOT NULL cubiertas por los seeders.

## T5. Verificación frontend estática (frontend-agent)
- CORREGIR `EditEmpleado.tsx` (bug detectado en review): sincronizar `jefaturaEmpleado` con
  `empleadoToEdit.jefatura_empleado` en el `useEffect` de carga y resetear en la rama else.
- Ejecutar desde `frontend/`: `pnpm exec tsc --noEmit`.
- Verificar que `mainTypes.ts` y `depreciacionTypes.ts` siguen correctos.
- Reportar resultados.

## T6. Revisión final (reviewer-agent)
- Revisar diff completo, `git diff --check`, coherencia entre migraciones SQLite, `$fillable`
  y consumidores (controllers/frontend).
- Reportar riesgos pendientes.

## T7. Validación con el usuario y conclusión del ciclo de spec
- Usuario recrea la BD demo local si lo desea: `migrate:fresh --seed --force
  --path=database/migrations/SQLITE` (fuera del alcance de los agentes por política de php.exe).
- Usuario verifica env vars de Render (DB_DATABASE=admincare-demo.db, DB_CONNECTION=sqlite,
  DEMO_MODE=true, DEMO_DATABASE_ALLOW_RESET=true, DB_URL vacío) o re-aplica el blueprint.
- Confirmación explícita del usuario antes de archivar la spec.