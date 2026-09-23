# Arquitectura — Rol Admin con todos los permisos

## Contexto
- Autorización mediante Spatie Permission (tablas `roles`, `permissions`,
  `role_has_permissions`, `model_has_roles`).
- `DatabaseSeeder` solo invoca `DemoSeeder`.
- `table_PermissionsSeeder` (21 permisos) y `table_RolesSeeder` (Admin,
  JAlmacenGeneral) NO son invocados por `DatabaseSeeder`.
- `DemoSeeder` crea el rol `Admin`, un subconjunto de 20 permisos y los asigna,
  además de los datos demo. El permiso `sidebar_menu_helpdesk` no se siembra.
- Existe precedente de migraciones de datos seguras e idempotentes:
  - `016_remove_sidebar_menu_home_permission.php`
  - `017_assign_admindashboard_permission_to_admin.php`

## Cambios propuestos
1. **Seeder** (`database/seeders/table_PermissionsSeeder.php`):
   - Mantener los 21 permisos base (`$permissions`).
   - Después, crear los permisos por acción para cada módulo:
     `$actions = ['lectura', 'escritura', 'control'];` y
     `Permission::firstOrCreate(['name' => $moduleName . '.' . $action, 'guard_name' => 'web'])`
     recorriendo `$modules` (los mismos 21 base) y `$actions`.
   - Total: 21 base + 63 acciones = 84 permisos.

2. **Seeder** (`database/seeders/DemoSeeder.php`):
   - Invocar `table_PermissionsSeeder` para sembrar el catálogo completo de
     permisos (fuente única y canónica).
   - Sustituir el bucle `givePermissionTo` por
     `$role->syncPermissions(Permission::all())`, de modo que `Admin` obtenga
     siempre todos los permisos existentes (incluye futuras incorporaciones).

2. **Migración de datos** nueva
   (`database/migrations/SQLITE/019_assign_all_permissions_to_admin.php`):
   - Sigue el patrón de `017` (lee nombres de tablas desde
     `config('permission.table_names')`, transacción, limpieza de cache).
   - `up()`: si existen las tablas de Spatie:
     - asegura que el rol `Admin` (guard `web`) exista (`insertOrIgnore` si
       falta);
     - otorga a `Admin` todos los permisos presentes en la tabla `permissions`
       mediante `insertOrIgnore` sobre `role_has_permissions`;
     - limpia la cache de permisos.
   - `down()`: no-op (conserva asignaciones), igual que `017`.

## Flujo de datos
- BD nueva: migraciones (incluida 019, que no encuentra permisos aún) → seeders
  (`table_PermissionsSeeder` crea los 21 permisos → `DemoSeeder` asigna todos a
  `Admin`).
- BD existente (demo ya sembrada): `table_PermissionsSeeder` agrega el permiso
  faltante (`sidebar_menu_helpdesk`) y `019` otorga todos los permisos
  existentes a `Admin`.

## Lo que NO cambia
- Sin cambios en tablas de aplicación.
- Sin cambios de API ni frontend.
- No se crean otros roles (no se usa `table_RolesSeeder`).
- `table_RolesSeeder` se mantiene tal cual, sin invocar.