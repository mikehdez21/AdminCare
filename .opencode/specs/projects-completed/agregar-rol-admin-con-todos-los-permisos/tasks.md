# Tareas — Rol Admin con todos los permisos

## Orden de implementación

0. **Modificar `database/seeders/table_PermissionsSeeder.php`**
   - Mantener los 21 base; añadir el bucle de acciones
     (`$actions = ['lectura','escritura','control']`, por módulo) →
     total 84 permisos.
   - Verificación: sintaxis `php -l` (si está disponible) y lectura visual.

1. **Modificar `database/seeders/DemoSeeder.php`**
   - Importar `Database\Seeders\table_PermissionsSeeder`.
   - Después de `Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web'])`
     invocar `$this->call(table_PermissionsSeeder::class);`.
   - Eliminar el arreglo `$demoPermissions` y el bucle `givePermissionTo`;
     sustituir por `$role->syncPermissions(Permission::all());`.
   - Verificación: el arreglo ya no existe y `Permission` sigue importado.

2. **Crear `database/migrations/SQLITE/019_assign_all_permissions_to_admin.php`**
   - Basarse en `017` para nombres de tablas/cache.
   - `up()`: guardas `Schema::hasTable`; transacción; crear rol `Admin` si falta;
     asignar todos los `id` de `permissions` vía `insertOrIgnore`; limpiar cache.
   - `down()`: no-op.
   - Verificación: sintaxis correcta y patrón consistente.

3. **Reconstruir la BD (solicitado por el usuario)**
   - `php artisan migrate:fresh --seed --force --path=database/migrations/SQLITE`
   - Verificación por script:
     - `roles` contiene `Admin` (web), 1 fila.
     - `permissions` contiene **84** permisos (21 base incluyendo
       `sidebar_menu_helpdesk`, y 63 de acción `<modulo>.{lectura,escritura,control}`).
     - `role_has_permissions` para `Admin` = 84.
     - `demo_admin` sigue asignado al rol `Admin`.

5. **Chequeos estáticos**
   - `git diff --check`
   - `git status` para listar solo los archivos esperados.

## Notas
- El usuario autorizó ejecutar PHP para el trabajo de BD de esta sesión
  (one-shot, sin servidores). AGENTS.md prohíbe iniciar servidores; no se tocan.
- No crear otros roles (JAlmacenGeneral queda fuera del alcance).