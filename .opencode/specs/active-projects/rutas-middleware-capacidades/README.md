# Spec 2 — Rutas y middleware por capacidad

## Objetivo

Cambiar `routes/api.php` y la navegación del frontend para que usen las capacidades nuevas de la Spec 1, y retirar los permisos legacy.

## Dependencia

Requiere Spec 1 desplegada y validada:

- Catálogo nuevo sembrado.
- Roles con permisos legacy + nuevos.
- Admin con todos.
- Almacén con nuevos permisos de Almacén.

## Alcance

- Middleware de rutas por `Permisos::middleware(recurso, acción)`.
- Rutas de Almacén, Contabilidad y Administrador.
- Rutas de catálogos compartidos.
- Menús y submenús del sidebar con capacidades nuevas.
- Retiro de permisos legacy del seeder y del guardado de roles.
- Sin tablas/listados.
- Sin Helpdesk.

## Fuera de alcance

- Cambios de controladores.
- Tablas/listados (Spec 3).
- Helpdesk (Spec 4).
- Alcances (Spec 4).

## Entrega

- Commit: `feat(routes): protect endpoints by capability`
- **Sin push.** El commit queda local.
- El usuario revisa y hace el push manualmente.
- Render build después del push del usuario.
- Revisión manual.
- No avanzar a Spec 3 sin OK.

## Documentos

- [requirements.md](requirements.md)
- [architecture.md](architecture.md)
- [api.md](api.md)
- [frontend.md](frontend.md)
- [tasks.md](tasks.md)
- [acceptance.md](acceptance.md)
