# Tareas — Rutas y middleware

## Fase 2.1 — Backend

- [x] Reescribir `routes/api.php` con `Permisos::middleware`.
- [x] Agrupar lectura, escritura y eliminar.
- [x] Aplicar OR de `catalogos.*` en selects.
- [x] Mantener rutas públicas de QR/status.
- [x] Retirar permisos legacy del seeder.
- [x] Retirar la unión legacy del guardado de roles.
- [x] Retirar la expansión legacy de `.control` en `AuthController`.
- [x] Exponer DELETE de métodos/estatus de depreciación que el frontend ya invocaba y el controlador ya implementaba.
- [x] Revisar que no quede `permission:sidebar_*`.
- [x] `git diff --check`.

## Fase 2.2 — Frontend

- [x] Actualizar `Sidebar_OptionsList.tsx`.
- [x] Actualizar submenús de Almacén, Contabilidad y Administrador.
- [x] Actualizar permisos internos de `AlmacenGeneral.tsx`.
- [x] Retirar referencias a permisos legacy.
- [x] `pnpm exec tsc --noEmit`.
- [x] ESLint directo sobre los archivos modificados.
- [ ] `pnpm run lint`. Falla por errores preexistentes de indentación en `App.tsx`, ajenos a esta fase.
- [x] `pnpm run build`.

## Verificación manual

- [ ] `php artisan migrate:fresh --seed` (usuario).
- [ ] Login DEMOADMIN: todos los módulos.
- [ ] Login DEMOALMACEN: Almacén operativo.
- [ ] Rutas de Administración responden.
- [ ] Sin 403 inesperados.
- [ ] CRUD básico de Almacén y Administración.
- [ ] QR público sigue funcionando.

## Entrega

- [ ] Commit: `feat(routes): protect endpoints by capability`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

**No iniciar Spec 3 sin OK.**
