# Tareas — Permisos por capacidad

## Fase 1.1 — Backend

- [x] Crear `config/permisos.php` adaptado.
- [x] Crear `app/Support/Permisos.php`.
- [x] Actualizar `table_PermissionsSeeder` de forma aditiva.
- [x] Actualizar `table_RolesSeeder` si hace falta. (Sin cambios: solo crea roles.)
- [x] Actualizar `DemoSeeder` para asignar legacy + nuevos.
- [x] Adaptar el guardado de roles para conservar legacy.
- [x] Ejecutar `git diff --check`.

## Fase 1.2 — Frontend

- [x] Portar `utils/permissions.ts`.
- [x] Portar `TablaPermisosRol`, `ModalInfoPermiso` y cambios de Roles.
- [x] Adaptar `rolesApi.ts`. (Sin cambios: el contrato de roles no cambió en esta fase.)
- [x] Mostrar aviso de convivencia legacy.
- [x] No tocar menús.
- [x] Ejecutar `pnpm exec tsc --noEmit`.
- [x] Ejecutar ESLint directo sobre los archivos modificados.
- [ ] Ejecutar `pnpm run lint`. Falla por 37 errores preexistentes de indentación en `App.tsx`, ajenos a esta fase.
- [x] Ejecutar `pnpm run build`.

## Verificación manual

- [ ] `php artisan migrate:fresh --seed` (usuario).
- [ ] Login DEMOADMIN.
- [ ] Login DEMOALMACEN.
- [ ] Roles muestra catálogo nuevo.
- [ ] Guardar rol no rompe accesos.
- [ ] Menús siguen funcionando.
- [ ] Almacén y Administración siguen operando.

## Entrega

- [ ] Commit: `feat(permisos): add capability catalog and role UI`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

**No iniciar Spec 2 sin OK.**

## Reporte final

- Archivos modificados.
- Verificaciones ejecutadas.
- Verificaciones no ejecutadas y por qué.
- Riesgos pendientes.
