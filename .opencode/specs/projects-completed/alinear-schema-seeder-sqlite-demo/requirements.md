# Requirements — Alinear schema SQLite, `$fillable` y seeders demo con el contrato real (controllers/UI/store/types)

## Problema
- **Bug de producción reportado:** crear un empleado desde `Empleados/Add` falla con
  `SQLSTATE[23000] ... NOT NULL constraint failed: tableEmpleados.email_empleado`.
  Causa raíz: `database/migrations/SQLITE/006_BD_principal_Empleados_table.php` define
  `email_empleado` y `firma_movimientos` como NOT NULL, pero el contrato actual de la API
  (`EmpleadoController@store`/`update`) y del frontend (`AddEmpleado`/`EditEmpleado`) NO
  manejan esos campos.
- **Brechas de alineación detectadas al auditar (referencia: controllers, UI, store, types):**
  1. `email_empleado` y `firma_movimientos` NOT NULL mientras la UI/API no los envían.
  2. `Empleado::$fillable` no incluye `email_empleado`, `telefono_empleado` ni
     `firma_movimientos`, aunque `DemoSeeder` y `table_EmpleadosSeeder` sí los envían
     (masa descartada por mass assignment).
  3. **PK mismatch en Depreciación:** `database/migrations/SQLITE/012_SQLite_demo_schema.php`
     crea la PK `id_depreciacion`, pero el modelo `Depreciacion::$primaryKey`, los controllers
     y el frontend (`depreciacionTypes.ts`, `ListActivosDepreciacion.tsx`) esperan
     `id_depreciacionaf`. La migración canónica Postgres `041` ya usa `id_depreciacionaf`.
     → El histórico/última depreciación expone `id_depreciacion` al frontend (undefined en
     `activoHistorico.id_depreciacionaf`).
  4. **Campos fantasma en `$fillable`:** `Depreciacion::$fillable` incluye
     `metodo_depreciacionaf` (no existe columna en 012 ni en 041) y
     `MovimientosActivos::$fillable` incluye `id_usuario` (no existe columna en 012 ni en 032).
- **Deploy de Render falla:** el guard `scripts/render-demo-reset.sh` aborta con
  "Refusing Render demo reset". La causa más probable son env vars del dashboard de Render
  que no reflejan `render.yaml` (DB_DATABASE=admincare-demo.db, DB_CONNECTION=sqlite,
  DEMO_MODE=true, DEMO_DATABASE_ALLOW_RESET=true, DB_URL vacío).

## Objetivo
- Alinear el esquema SQLite de la demo, los `$fillable` de los modelos y los seeders con el
  contrato que realmente consumen controllers, UI, store y types, para eliminar errores de
  campos faltantes como el de `jefatura_empleado` (que ya fue corregido en la migración 020).
- Que la demo se recree limpia con `migrate:fresh --seed --path=database/migrations/SQLITE`
  sin errores (flujo que ya ejecuta Render en cada deploy).
- Mantener el contrato de la API y el frontend sin cambios funcionales (solo correcciones de
  alineación de modelos/esquema de la demo).

## Contrato preservado
- Endpoints de empleados: mismo cuerpo de request/response (`{ success, message, ...data }`),
  misma validación, mismos permisos.
- Endpoints de depreciación: mismo cuerpo y forma; el frontend ya espera `id_depreciacionaf`.
- El `DemoSeeder` sigue creando el empleado/departamentos/activos/catálogos de demo con los
  mismos valores y ahora además persiste `email_empleado`, `telefono_empleado` y
  `firma_movimientos` (porque quedan en `$fillable`).
- No se cambia autenticación, sesiones, permisos, rutas, ni el flujo de Render/Docker.
- No se modifican las migraciones canónicas Postgres (`database/migrations/almacengeneral/`).

## No objetivo
- No agregar inputs de email/firma/telefono en el frontend de empleados.
- No cambiar la API pública ni los types de frontend (ya están correctos esperando
  `id_depreciacionaf`).
- No tocar otras tablas/módulos fuera del alcance.