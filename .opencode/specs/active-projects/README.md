# Specs activos — orden de ejecución

Orden acordado:

1. **Permisos**
2. **Rutas y middleware**
3. **Tablas y listados**
4. **Helpdesk completo**

Cada spec se implementa y se entrega por separado:

- Un commit + push a `main` por fase/hito.
- Render construye después del push.
- El usuario revisa la aplicación manualmente.
- No se avanza al siguiente spec hasta recibir OK explícito.
- Si el build falla, se corrige en la misma fase.

## Specs

| Orden | Spec | Objetivo | Depende de |
|---|---|---|---|
| 1 | [permisos-capacidades](permisos-capacidades/README.md) | Catálogo de permisos por capacidad, seeders y UI de roles. Aditivo: no cambia rutas todavía. | — |
| 2 | [rutas-middleware-capacidades](rutas-middleware-capacidades/README.md) | Proteger rutas por capacidad y retirar permisos legacy. | Spec 1 |
| 3 | [tablas-listados-admin-almacen](tablas-listados-admin-almacen/README.md) | Orden, filtros y paginación en Administrador y Almacén. | Spec 2 |
| 4 | [helpdesk-completo](helpdesk-completo/README.md) | Helpdesk completo: DB, permisos/alcances, backend, frontend y datos demo. | Specs 1–3 |

## Por qué permisos va primero

El sistema actual protege rutas con permisos `sidebar_*`. Si se cambian las rutas antes de sembrar los permisos nuevos, toda la aplicación queda en 403.

Por eso:

- **Spec 1** crea el catálogo nuevo y lo siembra **junto con** los permisos legacy.
- **Spec 2** cambia rutas y menús a las capacidades nuevas, y retira los legacy.

La app queda usable después de cada push.

## Commits previstos

| Hito | Commit |
|---|---|
| Specs | `docs(specs): split plan into permissions routes tables and helpdesk` |
| 1 | `feat(permisos): add capability catalog and role UI` |
| 2 | `feat(routes): protect endpoints by capability` |
| 3 | `feat(tables): add sorting filtering and server pagination` |
| 4A | `feat(db): add helpdesk schema and scopes` |
| 4B | `feat(helpdesk): add helpdesk backend` |
| 4C | `feat(helpdesk): add helpdesk interface` |
| 4D | `feat(demo): seed helpdesk sample data` |

## Reglas de entrega

- Push directo a `main`.
- Un commit por hito.
- No avanzar sin OK del usuario.
- No ejecutar `php.exe` ni servidores locales por parte de agentes.
- El usuario ejecuta `migrate:fresh --seed` cuando aplique.
- Cada push a Render regenera la SQLite demo; los datos manuales se pierden.
