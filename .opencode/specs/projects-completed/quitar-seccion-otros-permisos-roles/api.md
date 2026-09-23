# API — Expansión automática de permisos base (RolesController)

## Cambio
`app/Http/Controllers/AdminControllers/RolesController.php`

- Nuevo método privado:
  ```php
  private function expandirPermisosConBase(array $permissionIds): array
  ```
  - Obtiene los nombres de `permissions` para `$permissionIds` (consulta por ids).
  - Para cada permiso cuyo nombre case con `/^(.+)\.(lectura|escritura|control)$/`,
    toma la parte `$1` como nombre base y busca su id en `permissions`.
  - Retorna `array_values(array_unique(array_merge($permissionIds, $baseIds)))`.
- Aplicar la expansión en:
  - `store()` → antes de `$role->syncPermissions(...)` (línea ~86).
  - `update()` → antes de `$rol->syncPermissions(...)` (línea ~145).
  - `asignarPermisosRole()` → antes de `$role->syncPermissions(...)` (línea ~181).
- La respuesta (`$role->load('permissions')`) incluirá los bases asignados, que es correcto.

## Contrato
- Endpoints no cambian (mismo método/ruta/envelope `{ success, message, data }`).
- Validación existente (`permissions.*` `Rule::exists`) se mantiene sobre la
  entrada; la expansión solo agrega ids de permisos base existentes.
- Idempotente para el rol Admin (ya tiene todo).