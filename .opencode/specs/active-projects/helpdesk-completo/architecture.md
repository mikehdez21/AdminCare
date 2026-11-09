# Arquitectura — Helpdesk completo

## 1. Estrategia SQLite/PostgreSQL

- PostgreSQL: tablas en esquema `helpdesk`.
- SQLite: tablas planas.
- Modelos con `$table` plano + trait `UsesHelpdeskTable`.
- Migraciones con helper `SchemaTable::helpdesk(...)`.
- `CREATE SCHEMA` solo PostgreSQL.

## 2. Componentes

### 4A — Esquema y alcances

```text
app/Support/SchemaTable.php
app/Models/Concerns/UsesHelpdeskTable.php
app/Models/Helpdesk/*.php
app/Models/User.php
app/Models/Departamento.php
app/Services/Permisos/AlcanceService.php
config/permisos.php (agrega helpdesk.*)
config/demo.php
database/migrations/SQLITE/046..062, 069, 070
database/seeders/table_PermissionsSeeder.php
database/seeders/table_AlcancesSeeder.php
```

### 4B — Backend

```text
app/Http/Controllers/Helpdesk/*.php
app/Services/Helpdesk/*.php
app/Support/NotificaUsuarios.php
app/Observers/TicketObserver.php
app/Notifications/TicketNuevo.php
app/Notifications/TicketEstadoCambiado.php
resources/views/emails/helpdesk/*
routes/api.php (bloque Helpdesk)
```

### 4C — Frontend

```text
frontend/src/js/components/04_Helpdesk/*
frontend/src/js/components/Helpdesk/*
frontend/src/js/store/helpdesk/*
frontend/src/js/@types/HelpdeskTypes/*
frontend/src/js/utils/helpdesk.ts
frontend/src/js/utils/alcances.ts
frontend/src/js/components/00_Utils/DemoMailNotice.tsx
frontend/src/js/components/00_Utils/DemoUnavailable.tsx (si aplica)
frontend/src/css/04_Helpdesk/*
frontend/src/js/App.tsx
frontend/src/js/router/sections.tsx
frontend/src/js/components/Home/Sidebar/*
```

### 4D — Datos

```text
database/seeders/DemoSeeder.php
database/seeders/table_RolesSeeder.php
database/seeders/Helpdesk/table_CatalogoSistemasSeeder.php
database/seeders/Helpdesk/DemoTicketsSeeder.php
```

## 3. Flujo de ticket

1. Ruta con `auth:sanctum` + permiso.
2. Controlador valida.
3. Servicio aplica reglas, alcance y transacción.
4. Modelo persiste.
5. Observer dispara notificación.
6. `NotificaUsuarios` no despacha si `DEMO_MAIL_ENABLED=false`.
7. Respuesta con envelope.

## 4. Alcances

- `AlcanceService::para(usuario, recurso)`.
- `AlcanceService::aplicarTickets(query, usuario, módulo)`.
- `departamentosQueAtiende()` usa `atiende_helpdesk`.
- `global` solo por fila explícita.
- El frontend recibe `alcances` y no calcula.

## 5. Adaptaciones PostgreSQL → SQLite

| Main | Fork |
|---|---|
| `DB::table('helpdesk...')` | `SchemaTable::helpdesk(...)` |
| `TO_CHAR(created_at, 'YYYY-MM')` | expresión por driver o PHP |
| `pg_advisory_xact_lock` + regex/cast | folio portable por transacción |
| `lockForUpdate` | conservar; verificar SQLite |
| `after()` en columnas | omitir en SQLite |
| `->primary()` extra | quitar en SQLite |

## 6. Despliegue por sub-fase

- **4A:** app sigue funcionando; solo DB/modelos/permisos base.
- **4B:** API Helpdesk disponible; sin UI.
- **4C:** UI Helpdesk visible; sin datos demo ricos.
- **4D:** demo poblada.

Cada sub-fase debe compilar y arrancar.

## 7. Riesgos

1. SQL PostgreSQL en Helpdesk. Mitigación: adaptar folio, dashboard y nombres.
2. Permisos/alcances mal sembrados. Mitigación: roles demo y pruebas 403/200.
3. Pérdida de cambios demo en controladores. Mitigación: port por diff.
4. Correos encolados. Mitigación: short-circuit y `sync`.
5. Frontend main con dependencias no portadas. Mitigación: revisar imports.
6. Migraciones con sintaxis no SQLite. Mitigación: migrar y validar con usuario.
