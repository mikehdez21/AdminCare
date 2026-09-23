# Tareas — Quitar sección "Otros permisos" sin columna "Base"

## Orden de implementación

1. **TypeScript: `@types/mainTypes.ts`**
   - Revertir `base?: Permission` de `GroupedPermission` (ya no se utiliza).
   - Verificar que ningún consumidor use `grupo.base`.

2. **Frontend: `TablaPermisosRol.tsx`**
   - `agruparPermisosPorModulo`: el permiso base asegura la existencia del grupo
     del módulo (módulo = nombre del permiso base) y NO acumula ni renderiza
     `otros`.
   - Eliminar la columna "Base" añadida previamente; grid vuelve a
     `Permiso | Escritura | Lectura | Control` con `colSpan={4}`.
   - Verificación: `pnpm exec tsc --noEmit` (workdir `frontend/`); grep para
     asegurar que no se renderiza "Otros permisos" ni "Base".

3. **Frontend: `ShowPermisosRole.tsx`**
   - Mostrar solo permisos asignados del rol (ya es así) y eliminar la columna
     "Base" añadida previamente → grid de 4 columnas.
   - Verificación: `pnpm exec tsc --noEmit` (workdir `frontend/`).

4. **Chequeos globales**
   - `frontend/`: `pnpm exec tsc --noEmit`.
   - `git diff --check`.
   - `git status`/`diff --stat`: confirmar que solo cambian los archivos de esta
     tarea (TablaPermisosRol, ShowPermisosRole, mainTypes) más el backend ya
     aplicado (RolesController).

## Notas
- Sin cambios de BD ni migraciones.
- No iniciar servidores.