# Spec 4 — Helpdesk completo

## Objetivo

Portar el módulo Helpdesk del main al fork demo, con esquema SQLite/PostgreSQL, permisos/alcances, backend, frontend, datos demo y aviso de correo no configurado.

## Dependencias

- Spec 1: catálogo de permisos y UI de roles.
- Spec 2: rutas/middleware por capacidad y menús.
- Spec 3: tablas/listados compartidos (opcional para Helpdesk, pero ya desplegada).

## Sub-fases de entrega

| Sub-fase | Entrega | Commit |
|---|---|---|
| 4A | Esquema, modelos, permisos Helpdesk, alcances y flags | `feat(db): add helpdesk schema and scopes` |
| 4B | Backend Helpdesk y correo demo apagado | `feat(helpdesk): add helpdesk backend` |
| 4C | Frontend Helpdesk, menú, rutas, aviso y flags UI | `feat(helpdesk): add helpdesk interface` |
| 4D | Datos demo: usuarios, roles y ~12 tickets | `feat(demo): seed helpdesk sample data` |

Cada sub-fase:

- Commit local. **El agente no hace push.**
- El usuario revisa el commit y hace el push manualmente.
- Render build después del push del usuario.
- Revisión manual.
- OK del usuario antes de continuar.

## Alcance

- 17 tablas Helpdesk.
- 16 modelos.
- 15 controladores.
- 3 servicios.
- Notificaciones, observer y vistas de correo.
- Rutas API Helpdesk.
- Permisos `helpdesk.*`.
- Alcances `propio`, `departamento`, `global`.
- `atiende_helpdesk` en departamentos y usuarios.
- `ultimo_acceso`.
- Frontend completo de Helpdesk.
- Datos demo.
- Aviso de correo no configurado.

## Fuera de alcance

- ResumenHome/Home.
- Extensiones PDF.
- Envío real de correos.
- Suite completa de tests del main.
- Guard de inactividad del main.
- Cuota demo para Helpdesk.
- Cambios en producción.

## Documentos

- [requirements.md](requirements.md)
- [architecture.md](architecture.md)
- [database.md](database.md)
- [permissions.md](permissions.md)
- [api.md](api.md)
- [frontend.md](frontend.md)
- [emails.md](emails.md)
- [tasks.md](tasks.md)
- [acceptance.md](acceptance.md)
