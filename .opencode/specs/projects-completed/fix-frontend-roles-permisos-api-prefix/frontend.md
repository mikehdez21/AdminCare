# Frontend — Fix roles/permisos (prefijo API legacy)

## Archivos a modificar
1. `frontend/src/js/store/api/rolesApi.ts`
   - Línea 26: `url: '/api/HSS1/admin/roles'` → `url: '/api/admin/roles'`
   - Línea 43: `url: '/api/HSS1/admin/roles'` → `url: '/api/admin/roles'`
   - Línea 51: `` url: `/api/HSS1/admin/roles/${rol.id}` `` → `` url: `/api/admin/roles/${rol.id}` ``
   - Línea 59: `` url: `/api/HSS1/admin/roles/${rol.id}` `` → `` url: `/api/admin/roles/${rol.id}` ``

2. `frontend/src/js/store/api/permisosApi.ts`
   - Línea 14: `url: '/api/HSS1/admin/permisos'` → `url: '/api/admin/permisos'`
   - Línea 31: `url: '/api/HSS1/admin/permisos'` → `url: '/api/admin/permisos'`
   - Línea 39: `` url: `/api/HSS1/admin/permisos/${permiso.id}` `` → `` url: `/api/admin/permisos/${permiso.id}` ``
   - Línea 47: `` url: `/api/HSS1/admin/permisos/${permiso.id}` `` → `` url: `/api/admin/permisos/${permiso.id}` ``

IMPORTANTE: las URLs incluyen `/api` literal (corrección del reviewer). No
depender de que `baseQuery` agregue el prefijo (no lo hace).

## Verificación en frontend
- No debe quedar ninguna referencia a `/api/HSS1` en `frontend/src/js/`.
- `pnpm exec tsc --noEmit` sin errores nuevos.
- `pnpm run build` sin errores (si es viable en el entorno).
- No tocar otros archivos.