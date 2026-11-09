# Base de datos — Permisos por capacidad

## Migraciones

Esta fase **no agrega migraciones**.

Las tablas de Spatie ya existen:

- `permissions`
- `roles`
- `model_has_permissions`
- `model_has_roles`
- `role_has_permissions`

## Seeders

### `table_PermissionsSeeder`

Cambia de forma aditiva:

1. Conserva la lista legacy actual.
2. Conserva la creación de `module.lectura/escritura/control` para no romper rutas actuales.
3. Recorre `Permisos::recursos()` y crea `recurso.accion` con `firstOrCreate`.
4. Limpia la caché de Spatie.

### `table_RolesSeeder`

- Conserva `Admin` y `JAlmacenGeneral`.
- No asigna permisos destructivamente.

### `DemoSeeder`

- `Admin`: `syncPermissions(Permission::all())` sigue cubriendo legacy + nuevos.
- `Almacen`: asignar legacy + nuevos de Almacén.
- No eliminar permisos legacy en esta fase.

## Verificación

- `permissions` contiene ambos catálogos.
- `role_has_permissions` conserva los legacy de los roles demo.
- Admin tiene todos.
- Almacén tiene los legacy y los nuevos de Almacén.
- No se borra ningún permiso existente.

## Nota para Spec 2

Cuando las rutas y menús usen solo capacidades nuevas, se podrá:

- Retirar los permisos legacy del seeder.
- Retirar la unión legacy del guardado de roles.
- Limpiar la base demo con `migrate:fresh --seed`.
