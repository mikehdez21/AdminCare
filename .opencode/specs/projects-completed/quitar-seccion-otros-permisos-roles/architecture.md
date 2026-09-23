# Arquitectura — Quitar sección "Otros permisos" en tabla de roles

## Contexto actual
- `frontend/src/js/components/99_Administrador/Roles/TablaPermisosRol.tsx`
  - `agruparPermisosPorModulo(permisos)` separa en `{ grupos, otros }`:
    - Un permiso entra a `grupos` si su nombre termina en `.lectura|.escritura|.control`
      (módulo = parte antes del último punto).
    - Los demás (incluidos los 21 permisos base sin sufijo de acción) van a `otros`.
  - La UI renderiza las filas de `grupos` (columnas Escritura/Lectura/Control)
    y, si `otros` no está vacío, una fila "Otros permisos" con un checkbox por permiso.
- `ShowPermisosRole.tsx` hace lo mismo en modo solo-lectura: `grupos` + sección "Otros permisos".
- Backend `RolesController@store|update|asignarPermisosRole`:
  - Valida `permissions` (array de ids existentes) y hace `$role->syncPermissions($ids)`.
  - El middleware de rutas usa permisos base exactos (p. ej. `permission:sidebar_submenu_almacenes_almacengeneral`),
    por lo que un rol sin el permiso base no accede aunque tenga `modulo.lectura`.

## Diseño del cambio
1. **Frontend — TablaPermisosRol**
   - `agruparPermisosPorModulo` deja de devolver/es usar `otros` (o el componente
     deja de renderizar la sección "Otros permisos"). La búsqueda filtra solo sobre `grupos`.
   - `hayResultados` depende solo de `grupos`.
   - No se eliminan los permisos base de la BD, solo de la UI.
2. **Frontend — ShowPermisosRole**
   - Quitar el bloque de render de `otros` (sección "Otros permisos").
3. **Backend — RolesController**
   - Nuevo helper privado `expandirPermisosConBase(array $permissionIds): array`:
     - Consulta los nombres de los permisos con esos ids.
     - Para cada nombre que termine en `.lectura|.escritura|.control`, deriva el
       nombre base (parte antes del último punto) y busca su id en `permissions`.
     - Une ids originales + ids base, elimina duplicados.
   - Aplicarlo en `store`, `update` y `asignarPermisosRole` justo antes de
     `syncPermissions`, de modo que aunque la UI envíe solo acciones, el rol
     siempre reciba también los permisos base de esos módulos.

## Impacto
- Roles existentes (Admin): no se altera nada (ya tienen base+acciones).
- Roles nuevos/editados vía UI: reciben la base automáticamente → middleware OK.
- IDEMpotente: `syncPermissions` + expansión determinista → sin duplicados.