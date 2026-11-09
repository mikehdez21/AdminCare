# Tareas — Rutas y middleware

## Fase 2.1 — Backend

- [ ] Reescribir `routes/api.php` con `Permisos::middleware`.
- [ ] Agrupar lectura, escritura y eliminar.
- [ ] Aplicar OR de `catalogos.*` en selects.
- [ ] Mantener rutas públicas de QR/status.
- [ ] Retirar permisos legacy del seeder.
- [ ] Retirar la unión legacy del guardado de roles.
- [ ] Revisar que no quede `permission:sidebar_*`.
- [ ] `git diff --check`.

## Fase 2.2 — Frontend

- [ ] Actualizar `Sidebar_OptionsList.tsx`.
- [ ] Actualizar submenús de Almacén, Contabilidad y Administrador.
- [ ] Retirar referencias a permisos legacy.
- [ ] `pnpm exec tsc --noEmit`.
- [ ] `pnpm run lint`.
- [ ] `pnpm run build`.

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
- [ ] Push a `main`.
- [ ] Render build OK.
- [ ] Usuario revisa.
- [ ] Usuario responde OK.

**No iniciar Spec 3 sin OK.**
