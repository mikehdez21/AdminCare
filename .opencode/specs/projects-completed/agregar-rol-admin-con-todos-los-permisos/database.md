# Base de datos — Rol Admin con todos los permisos

## Migración nueva
**Archivo:** `database/migrations/SQLITE/019_assign_all_permissions_to_admin.php`

`up()`:
- Resolver nombres de tablas desde `config('permission.table_names')` y
  `config('permission.column_names')` (patrón de `017`).
- Si NO existen las tablas `permissions`, `roles` o `role_has_permissions`,
  retornar (migraciones de una BD vacía o sin Spatie).
- En una transacción:
  1. Si el rol `Admin` (guard `web`) no existe, crearlo con `insertOrIgnore`.
  2. Obtener todos los `id` de la tabla `permissions`.
  3. `insertOrIgnore` en `role_has_permissions` por cada permiso con el
     `role_id` de `Admin` (idempotente; no toca asignaciones ajenas).
- Limpiar la cache de permisos (mismo patrón que `017`).

`down()`: no-op (no revocar asignaciones existentes al hacer rollback).

## Seeder modificado: `database/seeders/table_PermissionsSeeder.php`
- Mantener los 21 permisos base existentes.
- Añadir al final el bloque de acciones:
  ```php
  $actions = ['lectura', 'escritura', 'control'];

  foreach ($modules as $moduleName) {
      foreach ($actions as $action) {
          Permission::firstOrCreate([
              'name' => $moduleName . '.' . $action,
              'guard_name' => 'web',
          ]);
      }
  }
  ```
  donde `$modules` = la misma lista de 21 nombres base (los módulos).
- Resultado: 21 base + 63 acciones = **84 permisos**.

## Seeder modificado: `database/seeders/DemoSeeder.php`
- Importar `Database\Seeders\table_PermissionsSeeder`.
- Tras crear el rol `Admin`, ejecutar `$this->call(table_PermissionsSeeder::class)`
  para sembrar los 84 permisos.
- Reemplazar el arreglo `$demoPermissions` y su bucle de asignación por
  `$role->syncPermissions(Permission::all());` → Admin obtiene los 84.

## Catálogo canónico de permisos
### Base (21)
1. `sidebar_menu_helpdesk` — SIEMBRA FALTANTE en la demo actual
2. `sidebar_menu_admindashboard`
3. `sidebar_menu_almacenes`
4. `sidebar_menu_contabilidad`
5. `sidebar_menu_administrador`
6. `sidebar_submenu_almacenes_almacengeneral`
7. `sidebar_submenu_contabilidad_depreciacionaf`
8. `sidebar_submenu_contabilidad_configuracion`
9. `sidebar_submenu_contabilidad_auditoria`
10. `sidebar_submenu_administrador_gestionusuarios`
11. `sidebar_submenu_administrador_gestionempleados`
12. `sidebar_submenu_administrador_gestionroles`
13. `sidebar_submenu_administrador_gestiondepartamentos`
14. `sidebar_submenu_administrador_gestionubicaciones`
15. `almacengeneral_navbar_inicio`
16. `almacengeneral_navbar_facturas`
17. `almacengeneral_navbar_activos`
18. `almacengeneral_navbar_movimientosactivos`
19. `almacengeneral_navbar_etiquetas`
20. `almacengeneral_navbar_proveedores`
21. `almacengeneral_navbar_parametros`

### Acciones (63 = 21 módulos × 3 acciones)
Para cada uno de los 21 base se crean: `<modulo>.lectura`, `<modulo>.escritura`,
`<modulo>.control` (p. ej. `sidebar_menu_administrador.lectura`,
`almacengeneral_navbar_activos.escritura`, etc.).

## Aplicación a la BD local existente (sin reconstruir)
Orden obligatorio:
1. `php artisan db:seed --class=table_PermissionsSeeder` (agrega el permiso
   faltante; idempotente) — DEBE ir antes de la migración para que 019 asigne
   también el permiso faltante.
2. `php artisan migrate --path=database/migrations/SQLITE` (ejecuta solo la
   pendiente 019).

> Nota: en una BD nueva el orden natural es migraciones → seeders; 019 corre
> cuando la tabla `permissions` aún está vacía (no asigna nada) y el seeder
> posterior `syncPermissions(Permission::all())` cubre la asignación completa.