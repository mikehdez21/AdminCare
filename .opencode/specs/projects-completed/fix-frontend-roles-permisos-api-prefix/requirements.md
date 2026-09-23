# Requisitos — Fix frontend roles/permisos (prefijo API legacy)

## Problema reportado
En la pantalla "Gestion de Roles" (`/gestion-roles`):
1. Los roles no aparecen listados.
2. Al agregar/editar un rol, los permisos no se enlistan (sin checkboxes).

## Diagnóstico (confirmado)
- El backend registra las rutas como `/api/admin/roles` y `/api/admin/permisos`
  (`routes/api.php:217-221`; el prefijo `HSS1` fue eliminado en el trabajo previo
  `remove-hss1-api-prefix`, que dejó pendiente la migración del frontend).
- El frontend de roles/permisos aún usa el prefijo legacy:
  - `frontend/src/js/store/api/rolesApi.ts` → `/api/HSS1/admin/roles` (líneas
    26, 43, 51, 59).
  - `frontend/src/js/store/api/permisosApi.ts` → `/api/HSS1/admin/permisos`
    (líneas 14, 31, 39, 47).
- Resultado: peticiones 404 que RTK Query traduce de forma silenciosa; el
  frontend muestra listas vacías ("No hay roles registrados" y "No se
  encontraron permisos.") sin exponer el error.
- Los demás consumidores de API (`/api/...`) ya usan la ruta correcta, por eso
  solo falla roles/permisos.

## Objetivo
Completar la migración pendiente del frontend: eliminar el uso de `/api/HSS1/`
en `rolesApi.ts` y `permisosApi.ts` y dejar las URLs canónicas
`/api/admin/roles` y `/api/admin/permisos` para que roles y permisos se listen
y se puedan asignar correctamente.

## Corrección del plan original (hallazgo del reviewer — BLOQUEANTE)
El plan inicial suponía que `axiosBaseQuery` anteponía `/api` al construir la
URL final. ESO ES FALSO: `API_BASE_URL` proviene de `VITE_APP_API` (vacío en el
repo) y `baseQuery.ts:20` concatena `${API_BASE_URL}${url}`. Todos los demás
consumidores usan explícitamente `${API_BASE_URL}/api/...` (ver `usersActions`,
`departamentosActions`, `authActions`, etc.). Por lo tanto las URLs DEBEN incluir
el segmento `/api` literal: `/api/admin/roles` y `/api/admin/permisos`.

## Alcance
- Solo frontend (`frontend/src/js/store/api/rolesApi.ts` y
  `frontend/src/js/store/api/permisosApi.ts`).
- No se toca backend (ya expone `/api/admin/roles` y `/api/admin/permisos` con
  el envelope `{ success, message, ...data }` correcto).
- No se toca base de datos ni seeders.