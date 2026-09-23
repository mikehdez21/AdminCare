# Frontend — Quitar sección "Otros permisos" (grid sin columnas nuevas)

## Archivos

### 1. `frontend/src/js/@types/mainTypes.ts`
- Revertir `base?: Permission` del tipo `GroupedPermission` si ya no se usa:
  el tipo vuelve a `{ modulo, lectura?, escritura?, control? }`.

### 2. `frontend/src/js/components/99_Administrador/Roles/TablaPermisosRol.tsx`
- `agruparPermisosPorModulo(permisos)`:
  - Para un permiso con sufijo `.lectura|.escritura|.control` → se asigna a la
    acción correspondiente del grupo (`modulo` = parte antes del último punto).
  - Para un **permiso base** (sin sufijo de acción, p. ej. `sidebar_menu_admin`)
    → asegurar que exista el grupo cuyo `modulo` es el nombre completo del
    permiso (el módulo existe aunque solo tenga la base). No se almacena ningún
    dato extra en la fila.
  - No renderizar `otros` en ningún caso.
- Tabla: emplear el grid de **4 columnas** `Permiso | Escritura | Lectura | Control`.
  **No hay columna "Base" adicional.**
- `hayResultados` depende solo de `gruposFiltrados`.
- `colSpan={4}` en la fila "No se encontraron permisos."

### 3. `frontend/src/js/components/99_Administrador/Roles/ShowPermisosRole.tsx`
- Usa `rolToShow?.permissions` (solo asignados) → muestra únicamente los
  permisos que el rol tiene.
- Grid de **4 columnas** `Permiso | Escritura | Lectura | Control` (sin columna
  "Base" adicional); mantiene las marcas ✓/— de las 3 acciones.
- El encabezado del modal conserva "Permisos del Rol:".
- `sinPermisos` sigue con `permisos.length === 0`.

### 4. `AddRol.tsx` / `EditRol.tsx`
- No se modifican; ya pasan `permisos` = catálogo completo a `TablaPermisosRol`
  y `selectedPermisos` (los id del rol en edición, incluyendo los base porque el
  rol los tiene asignados).

## Notas
- No eliminar permisos base de BD; quedan implícitos en la fila del módulo y el
  backend los asigna vía `expandirPermisosConBase`.
- El payload creado/actualizado sigue enviando ids de `selectedPermisos`.