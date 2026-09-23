# Arquitectura — Fix frontend roles/permisos (prefijo API legacy)

## Contexto
- El backend declara las rutas de administración de roles y permisos en
  `routes/api.php:217-221` (grupo con `permission:sidebar_submenu_administrador_gestionroles`):
  - `Route::apiResource('admin/roles', RolesAdminController::class)`
  - `Route::put('admin/roles/{id}/asignarPermisosRole', ...)`
  - `Route::apiResource('admin/permisos', PermissionsAdminController::class)`
- Como `bootstrap/app.php` registra `routes/api.php` con prefijo `/api`, las
  URLs canónicas son `/api/admin/roles` y `/api/admin/permisos`.
- El prefijo legacy `HSS1` ya no existe en PHP (solo queda excluido del
  catch-all en `routes/web.php:16`); no hay middleware que lo reescriba.
- `frontend/src/js/store/api/baseQuery.ts` (Axios) añade baseURL `/api`
  (variable de entorno), por lo que la URL en los endpoints debe ser
  `/admin/roles` y `/admin/permisos` (sin `/api/HSS1`).

## Cambio propuesto
En los endpoints RTK Query de `rolesApi.ts` y `permisosApi.ts`, reemplazar la
URL `/api/HSS1/admin/...` por `/api/admin/...`.

Correspondencia:
| Archivo | Antes | Después |
|---|---|---|
| `rolesApi.ts` | `/api/HSS1/admin/roles` | `/api/admin/roles` |
| `rolesApi.ts` | `/api/HSS1/admin/roles/${rol.id}` | `/api/admin/roles/${rol.id}` |
| `permisosApi.ts` | `/api/HSS1/admin/permisos` | `/api/admin/permisos` |
| `permisosApi.ts` | `/api/HSS1/admin/permisos/${permiso.id}` | `/api/admin/permisos/${permiso.id}` |

Nota CRÍTICA (corrección del reviewer): `API_BASE_URL` proviene de
`VITE_APP_API` (`variableApi.ts:4`) y actualmente está vacío en el repo;
`axiosBaseQuery` concatena `${API_BASE_URL}${url}` (`baseQuery.ts:20`) SIN
agregar `/api`. Por eso las URLs de los endpoints deben llevar el segmento
`/api` literal, igual que el resto de los consumidores
(`${API_BASE_URL}/api/admin/...`). El `baseQuery` y `variableApi` se dejan
intactos.

## No cambia
- Envelopes de respuesta backend.
- `transformResponse` del frontend (ya compatible con `response.data`,
  `response.meta`, `response.success`).
- Componentes de UI (`RolesControl`, `AddRol`, `TablaPermisosRol`, etc.).