# Criterios de aceptación — Fix frontend roles/permisos (prefijo API legacy)

- [ ] `frontend/src/js/store/api/rolesApi.ts` usa URLs `/api/admin/roles` (sin
      `/api/HSS1`).
- [ ] `frontend/src/js/store/api/permisosApi.ts` usa URLs `/api/admin/permisos`
      (sin `/api/HSS1`).
- [ ] No queda ninguna referencia a `/api/HSS1` en `frontend/src/js/`.
- [ ] Los componentes de roles/permisos (`RolesControl`, `AddRol`,
      `TablaPermisosRol`, `EditRol`) reciben datos reales y listan roles y
      permisos (verificación manual del usuario en `/gestion-roles`).
- [ ] Al abrir "Añadir Rol", la tabla de permisos muestra los 21 permisos con
      checkboxes y permite guardar el rol.
- [ ] Las pantallas de usuarios que consumen `useGetRolesQuery` (AddUser,
      EditUser, AddRolModal, ShowUserRoles) siguen operativas.
- [ ] `git diff --stat`: solo se modifican `rolesApi.ts` y `permisosApi.ts`.
- [ ] `pnpm exec tsc --noEmit` y `git diff --check` sin errores nuevos (o
      bloqueo reportado y justificado).