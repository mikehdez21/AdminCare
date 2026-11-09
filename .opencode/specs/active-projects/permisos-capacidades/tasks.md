# Tareas — Permisos por capacidad

## Fase 1.1 — Backend

- [ ] Crear `config/permisos.php` adaptado.
- [ ] Crear `app/Support/Permisos.php`.
- [ ] Actualizar `table_PermissionsSeeder` de forma aditiva.
- [ ] Actualizar `table_RolesSeeder` si hace falta.
- [ ] Actualizar `DemoSeeder` para asignar legacy + nuevos.
- [ ] Adaptar el guardado de roles para conservar legacy.
- [ ] Ejecutar `git diff --check`.

## Fase 1.2 — Frontend

- [ ] Portar `utils/permissions.ts`.
- [ ] Portar `TablaPermisosRol`, `ModalInfoPermiso` y cambios de Roles.
- [ ] Adaptar `rolesApi.ts`.
- [ ] Mostrar aviso de convivencia legacy.
- [ ] No tocar menús.
- [ ] Ejecutar `pnpm exec tsc --noEmit`.
- [ ] Ejecutar `pnpm run lint`.
- [ ] Ejecutar `pnpm run build`.

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
