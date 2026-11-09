# Spec 3 — Tablas y listados Administrador y Almacén

## Objetivo

Portar del main las mejoras de tablas/listados: orden por columna, filtros, búsqueda y paginación de servidor.

## Dependencia

Requiere Spec 2 desplegada y validada.

## Alcance

- Backend:
  - `Paginable` del main.
  - Controladores de Administrador y Almacén.
- Frontend:
  - `TablaEntidades`.
  - `useOrdenFiltroCliente`.
  - Hooks de paginación actualizados.
  - Tipos y utilidades de tabla.
  - CSS compartido.
  - 9 controles de Administrador y Almacén.

## Fuera de alcance

- Helpdesk.
- Contabilidad.
- Cambios de permisos.
- Cambios de esquema.
- Reescritura de formularios.
- Cuota demo.

## Entrega

- Commit: `feat(tables): add sorting filtering and server pagination`
- **Sin push.** El commit queda local.
- El usuario revisa y hace el push manualmente.
- Render build después del push del usuario.
- Revisión manual.
- No avanzar a Spec 4 sin OK.

## Documentos

- [requirements.md](requirements.md)
- [architecture.md](architecture.md)
- [api.md](api.md)
- [frontend.md](frontend.md)
- [tasks.md](tasks.md)
- [acceptance.md](acceptance.md)
