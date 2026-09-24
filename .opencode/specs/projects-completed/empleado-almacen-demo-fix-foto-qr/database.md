# Database — Sin migraciones; solo seeders

No se agregan/alteran tablas ni columnas. Se modifica el comportamiento de seeding.

## Seeders
### `database/seeders/DemoSeeder.php`
- Garantizar departamento `Almacén` (`firstOrCreate` por `nombre_departamento`).
- Crear empleado de Almacén:
  - nombre/alias demo (p.ej. `Almacen` / `AlmacenDemo`), `estatus_activo` true,
    `id_departamento` del departamento Almacén, sin `foto_empleado` (null → el fallback real
    de la UI mostrará `defaultProfile.png`).
- Crear usuario demo de almacén (`DEMOALMACEN` — editado por el usuario en el working tree):
  - `email_usuario` ejemplo.invalid, `password` hash demo `demoalmacen` (alineado con el placeholder
    del login que el usuario ya actualizó), `estatus_activo` true, `id_empleado`, `id_departamento`.
- Rol: `Role::firstOrCreate(['name' => 'Almacen' ...])` + `syncPermissions([...])` que debe incluir
  para cada uno de los 9 módulos de Almacén el permiso base + las variantes `.lectura`, `.escritura`
  y `.control` (36 permisos en total). Los permisos y variantes ya existen en BD vía
  `table_PermissionsSeeder` (llamado antes en el mismo seeder), así que se referencian por nombre.
- `user->assignRole(...)`.
- NO duplicar el empleado si se re-corre el seeder (guardar/firstOrCreate por nombre_usuario).

## Observación de idempotencia (usuario)
- El usuario cambió `demo_admin`/`DemoAdmin-2026` → `DEMOADMIN`/`demoadmin` y
  `demo_almacen` → `DEMOALMACEN` en el working tree. `User::firstOrCreate` por `nombre_usuario`
  no refresca campos existentes; aceptable para el seeder demo (la demo se recrea con migrate:fresh).
  `syncPermissions` es determinista en el rol.

## Nota de regeneración
- La demo actual en Render se recompone en cada arranque (`render-demo-reset.sh` → migrate:fresh
  + seed). El usuario puede regenerar local con
  `migrate:fresh --seed --force --path=database/migrations/SQLITE` (acción del usuario, no del agente).