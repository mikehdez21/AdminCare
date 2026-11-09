# Alinear fork demo con main: Helpdesk, permisos y tablas

## Contexto

- **Main:** `C:\Users\HSS-DESARROLLO\DevProjects\HSSAdminCare_Dev`, rama `develop`.
- **Fork demo:** repositorio actual AdminCare, rama `main`.
- **Referencia:** commits del main hasta `b53d2ca`.
- Los dos repositorios **no comparten historial Git**. La alineación se hace portando y adaptando código, no con `cherry-pick` ni merge.

## Objetivo

Llevar al fork demo, en fases verificables:

1. Esquema y migraciones de Helpdesk del main, adaptados a SQLite y compatibles con PostgreSQL.
2. Módulo Helpdesk completo: backend, rutas, frontend, catálogos y datos demo.
3. Sistema de permisos del main: catálogo, nombres por acción, alcances y rutas protegidas.
4. Mejoras de tablas/listados del main en Administrador y Almacén.
5. Aviso visible de que la demo no tiene servicio de correo configurado.
6. Datos demo: catálogos completos y ~12 tickets variados.

## Decisiones cerradas con el usuario

| Tema | Decisión |
|---|---|
| Helpdesk | Módulo completo (DB + backend + frontend) |
| Permisos | Sistema completo del main, con alcances |
| Correos | Sin envío real; aviso/alerta en la UI de que la demo no tiene servicio configurado |
| Migraciones | 1:1 adaptadas a SQLite, manteniendo compatibilidad PostgreSQL |
| Tablas/listados | Solo Administrador y Almacén |
| Datos demo | Catálogos completos + ~12 tickets variados + usuarios técnico y solicitante |
| Base local | Se puede regenerar con `migrate:fresh --seed`; la demo es descartable |

## Supuestos

- Se conserva el prefijo actual `/api` del fork (no se reintroduce `/api/HSS1`).
- No se porta ResumenHome/Home ni Extensiones PDF.
- Se conserva el comportamiento de sesión del fork; solo se agrega `alcances` al payload y `ultimo_acceso`.
- Se conserva `DEMO_MODE`, la cuota de 100 escrituras, el QR público y las restricciones de impresora.
- La cuota demo sigue midiendo solo proveedores, facturas y activos. Helpdesk no suma a la cuota salvo indicación posterior.
- La spec se creó en `C:\Users\HSS-DESARROLLO\.opencode\plan` porque Plan mode no permite escribir en el repo. Al iniciar implementación se copia a `.opencode/specs/active-projects/helpdesk-permisos-tablas-demo/`.

## Documentos

- [requirements.md](requirements.md) — alcance, requisitos y supuestos.
- [architecture.md](architecture.md) — diseño técnico y estrategia de adaptación.
- [database.md](database.md) — tablas, migraciones, datos demo y adaptaciones SQLite.
- [permissions.md](permissions.md) — catálogo, mapeo de permisos, roles y rutas.
- [api.md](api.md) — endpoints, payloads y contrato de listados.
- [frontend.md](frontend.md) — rutas, componentes, store, menús y tablas.
- [emails.md](emails.md) — comportamiento de correos en la demo.
- [tasks.md](tasks.md) — fases de implementación.
- [delivery.md](delivery.md) — commits, push a main, build de Render y revisión manual por fase.
- [acceptance.md](acceptance.md) — criterios de aceptación y verificación.

## Fases

| Fase | Entrega |
|---|---|
| 0 | Spec en el repo, baseline y respaldo de la demo |
| 1 | Esquema Helpdesk + columnas de atención + alcances |
| 2 | Permisos backend y frontend base |
| 3 | Backend Helpdesk |
| 4 | Frontend Helpdesk |
| 5 | Tablas/listados Administrador y Almacén |
| 6 | Datos demo y roles de demostración |
| 7 | Verificación, documentación y cierre |

## Flujo de entrega

Cada fase se entrega con **commit + push directo a `main`**. El push dispara el build de Render. El usuario revisa manualmente la aplicación y da su OK antes de iniciar la siguiente fase.

- No se hace un solo commit/push gigante.
- No se avanza sin revisión del usuario.
- Si el build falla, se corrige en la misma fase.
- Ver [delivery.md](delivery.md).

Cada fase debe terminar con verificación estática y, cuando aplique, validación del usuario con `php artisan migrate:fresh --seed` en su terminal.
