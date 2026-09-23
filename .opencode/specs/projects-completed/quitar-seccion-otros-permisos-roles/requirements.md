# Requisitos — Quitar sección "Otros permisos" en tabla de roles

## Problema reportado
- El usuario percibe que el rol Admin "le faltan permisos" y pide quitar la
  sección "Otros permisos".
- Requisito del usuario:
  - El modal **"Permisos del Rol:"** (ver) debe mostrar **solo los permisos que
    el rol tiene (asignados)**.
  - Al **crear** o **editar** un rol deben estar **todos los permisos** del
    catálogo visibles/selectables, sin sección "Otros permisos" y sin columnas
    extra (no se agregó ninguna columna "Base").

## Diagnóstico
- **BD correcta**: verificado — el rol Admin (web) tiene **84/84** permisos
  (0 faltantes).
- En el frontend, la tabla de permisos (Añadir/Editar) agrupa por módulo las
  acciones `modulo.lectura|escritura|control` (63) y dejaba los 21 permisos
  **base** (`sidebar_menu_*`, `almacengeneral_navbar_*`, etc.) en una sección
  separada "Otros permisos".
- Al quitar la sección "Otros permisos", los 21 permisos base desaparecieron de
  la UI de crear/editar, lo que contradice "deben estar todos los permisos".

## Solución (sin columnas nuevas)
- Cada fila del grid representa un **módulo** (permiso base = nombre del
  módulo) con sus columnas **Escritura / Lectura / Control**.
- Mantener el grid original de 4 columnas: `Permiso | Escritura | Lectura | Control`.
- Con el catálogo completo, se muestran 21 filas de módulo (todos los permisos
  representados: el módulo y sus 3 acciones = 84).
- Los permisos base NO se muestran como filas sueltas ni en sección "Otros";
  quedan implícitos en la fila del módulo y el backend los asigna automáticamente.

## Objetivo
1. Eliminar la sección "Otros permisos" **sin perder ningún permiso** en la UI.
2. `ShowPermisosRole` (ver, título "Permisos del Rol:"): mostrar **solo** los
   permisos asignados al rol (usa `rolToShow.permissions`).
3. `TablaPermisosRol` (Añadir/Editar): mostrar **todos** los permisos del
   catálogo organizados por módulo (21 filas × 3 acciones), sin sección "Otros"
   y sin columnas adicionales.
4. Preservar autorización: los permisos base siguen existiendo en BD y deben
   seguir asignándose (backend `expandirPermisosConBase` ya lo garantiza).

## Alcance
- Frontend:
  - `frontend/src/js/components/99_Administrador/Roles/TablaPermisosRol.tsx`
  - `frontend/src/js/components/99_Administrador/Roles/ShowPermisosRole.tsx`
  - `frontend/src/js/@types/mainTypes.ts` (revertir `base?: Permission` si ya
    no se usa).
  - `AddRol.tsx` / `EditRol.tsx` no cambian su comportamiento ni payload (ya
    reciben `permisos` = catálogo completo desde `useGetPermisosQuery`).
- Backend: `app/Http/Controllers/AdminControllers/RolesController.php`
  (ya aplicado: `expandirPermisosConBase` en store|update|asignarPermisosRole).
- Sin cambios de BD, seeders ni migraciones.