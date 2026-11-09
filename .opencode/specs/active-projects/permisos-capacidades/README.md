# Spec 1 — Permisos por capacidad

## Objetivo

Crear el catálogo de permisos por capacidad del main y la UI de roles, de forma **aditiva**, sin cambiar todavía las rutas ni los menús.

## Por qué aditivo

Las rutas actuales usan permisos `sidebar_*`, `almacengeneral_navbar_*` y sufijos `.control`. Si se cambian las rutas antes de sembrar los permisos nuevos, la app responde 403.

Esta spec:

- Siembra los permisos nuevos.
- Mantiene los permisos legacy.
- Conserva las rutas y menús actuales.
- Permite revisar el catálogo y la UI de roles sin romper la demo.

El cambio de rutas y menús se hace en la Spec 2.

## Alcance

- `config/permisos.php` adaptado a los módulos actuales.
- `App\Support\Permisos`.
- Seeder de permisos aditivo.
- Roles demo con permisos legacy + nuevos.
- UI de roles con catálogo nuevo.
- `utils/permissions.ts` del main.
- Sin migraciones.
- Sin cambios en `routes/api.php`.
- Sin cambios de menús.
- Sin Helpdesk.
- Sin alcances.

## Fuera de alcance

- Rutas y middleware (Spec 2).
- Menús y navegación (Spec 2).
- Tablas/listados (Spec 3).
- Helpdesk (Spec 4).
- Alcances por rol (Spec 4).
- `atiende_helpdesk` (Spec 4).

## Dependencias

- Ninguna.

## Entrega

- Commit: `feat(permisos): add capability catalog and role UI`
- **Sin push.** El commit queda local.
- El usuario revisa y hace el push manualmente.
- Render build después del push del usuario.
- Revisión manual del usuario.
- No avanzar a Spec 2 sin OK.

## Documentos

- [requirements.md](requirements.md)
- [architecture.md](architecture.md)
- [database.md](database.md)
- [api.md](api.md)
- [frontend.md](frontend.md)
- [tasks.md](tasks.md)
- [acceptance.md](acceptance.md)
