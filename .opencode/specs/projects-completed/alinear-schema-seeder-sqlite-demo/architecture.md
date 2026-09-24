# Architecture — Cómo encaja la alineación en la arquitectura existente

## Flujo actual
- La demo usa SQLite (`database/admincare-demo.db`) con migraciones propias en
  `database/migrations/SQLITE/` (las migraciones canónicas Postgres viven en
  `database/migrations/` y `database/migrations/almacengeneral/`).
- Render ejecuta en cada release (vía `render-demo-reset.sh`) `migrate:fresh --seed --force
  --path=database/migrations/SQLITE`; por lo tanto las migraciones SQLITE son la fuente de
  verdad del esquema de la demo y la BD se recrea por completo en cada deploy.
- El `Seeder` raíz (`DatabaseSeeder`) solo invoca `DemoSeeder`; `table_EmpleadosSeeder` queda
  como seeder auxiliar (no se ejecuta en la cadena actual).

## Cambios propuestos
1. **Esquema SQLite (migraciones 006 y 012)** — alinear con modelo/frontend:
   - `006`: `email_empleado` pasa a `nullable()` (se conserva `unique()`); `firma_movimientos`
     pasa a `nullable()`.
   - `012`: la tabla `tableAF_DepreciacionActivo` usa PK `id_depreciacion` → `id_depreciacionaf`
     para coincidir con `Depreciacion::$primaryKey`, `DepreciacionController` y types del
     frontend, igual que la migración canónica Postgres `041`.
2. **Modelos (`$fillable`)**:
   - `App\Models\Empleado`: agrega `email_empleado`, `telefono_empleado`, `firma_movimientos`
     (son columnas reales y los seeders ya las envían).
   - `App\Models\AlmacenGeneral\Depreciacion`: elimina `metodo_depreciacionaf` (columna
     inexistente; la relación real es `id_metodo_depreciacionaf`).
   - `App\Models\AlmacenGeneral\MovimientosActivos`: elimina `id_usuario` (columna inexistente
     en 012 y en la canónica 032).
3. **Seeders** — no requieren cambios estructurales: `DemoSeeder` y `table_EmpleadosSeeder`
   ya envían los campos adecuados; tras el ajuste de `$fillable` y nulabilidad, persisten y no
   fallan. Verificación: `DemoSeeder` continúa insertando la fila de `tableAF_DepreciacionActivo`
   vía `DB::table(...)` (sin depender de la PK).

## Flujo de datos verificado
- `EmpleadoController@store`: recibe solo los campos del formulario (sin email/firma). Tras la
  nulabilidad, el INSERT ya no viola las columnas NOT NULL.
- `DepreciacionController@activarDepreciacion` / `historicoDepreciaciones`: el modelo `Depreciacion`
  con `$primaryKey='id_depreciacionaf'` y la tabla con PK `id_depreciacionaf` → la respuesta JSON
  expone `id_depreciacionaf` que es lo que consume `ListActivosDepreciacion.tsx` y
  `depreciacionTypes.ts`.

## Fuera de alcance
- Migraciones canónicas Postgres (`almacengeneral/`, raíz): no se tocan.
- Autenticación, permisos, rutas, sesiones: no se tocan.