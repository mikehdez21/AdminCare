# Tareas — Fix frontend roles/permisos (prefijo API legacy)

## Orden de implementación

1. **Modificar `frontend/src/js/store/api/rolesApi.ts`**
   - Reemplazar las 4 URLs `/api/HSS1/admin/roles...` por `/api/admin/roles...`
     (CON segmento `/api` literal; `baseQuery` no lo aporta).
   - Verificación: grep `HSS1` en el archivo → 0 coincidencias.

2. **Modificar `frontend/src/js/store/api/permisosApi.ts`**
   - Reemplazar las 4 URLs `/api/HSS1/admin/permisos...` por `/api/admin/permisos...`
     (CON segmento `/api` literal).
   - Verificación: grep `HSS1` en el archivo → 0 coincidencias.

3. **Verificación global frontend**
   - `grep -r "HSS1" frontend/src/js` → 0 coincidencias.
   - `pnpm exec tsc --noEmit` (si el entorno lo permite; si no, registrarlo).
   - `pnpm run build` (opcional/según viabilidad; no iniciar servidores).

4. **Chequeo de alcance**
   - `git diff --stat` debe mostrar SOLO los 2 archivos modificados.

## Notas
- AGENTS.md prohíbe iniciar servidores (`pnpm dev`, etc.); la validación será
  estática (tsc/build/grep).
- El trabajo queda dentro del frontend; no tocar backend ni BD.