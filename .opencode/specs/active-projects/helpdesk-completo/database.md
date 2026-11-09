# Base de datos — Helpdesk completo

## 1. Migraciones

Ubicación: `database/migrations/SQLITE/`.

| Migración | Contenido |
|---|---|
| `046_helpdesk_create_schema.php` | Esquema solo PostgreSQL |
| `047_BD_ref_CategoriasTicket_table.php` | Categorías + seed |
| `048_BD_ref_SubcategoriasTicket_table.php` | Subcategorías + seed |
| `049_BD_ref_TitulosTicket_table.php` | Títulos + seed |
| `050_BD_ref_PrioridadesTicket_table.php` | Prioridades + seed |
| `051_BD_ref_EstatusTicket_table.php` | Estatus + seed |
| `052_BD_ref_SLANiveles_table.php` | SLA + seed |
| `053_BD_principal_Tickets_table.php` | Tickets |
| `054_BD_principal_ActividadTicket_table.php` | Actividad |
| `055_BD_principal_AvancesTicket_table.php` | Avances |
| `056_BD_principal_EncuestaSatisfaccion_table.php` | Encuesta |
| `057_BD_principal_Etiquetas_table.php` | Etiquetas + seed |
| `058_BD_intermedia_ticketsEtiquetas_table.php` | Pivote etiquetas |
| `059_BD_principal_Departamentos_atiende_helpdesk_table.php` | Bandera de departamento |
| `060_BD_principal_Usuarios_atiende_helpdesk_table.php` | Bandera de usuario |
| `061_BD_intermedia_ticketsTecnicos_table.php` | Pivote técnicos |
| `062_BD_principal_ErroresProveedor_tables.php` | 4 tablas + seed |
| `069_BD_intermedia_RolesAlcances_table.php` | Alcances por rol |
| `070_BD_principal_Usuarios_ultimo_acceso_table.php` | Último acceso |

Columnas base:

- `tableDepartamentos.atiende_helpdesk`.
- `tableUsuarios.atiende_helpdesk`.

## 2. Tablas

Catálogos:

- `tableRef_CategoriasTicket`
- `tableRef_SubcategoriasTicket`
- `tableRef_TitulosTicket`
- `tableRef_PrioridadesTicket`
- `tableRef_EstatusTicket`
- `tableRef_SLANiveles`

Principales:

- `tableMA_Tickets`
- `tableMA_ActividadTicket`
- `tableMA_AvancesTicket`
- `tableMA_EncuestaSatisfaccion`
- `tableMA_Etiquetas`

Pivotes:

- `tableInter_ticketsEtiquetas`
- `tableInter_ticketsTecnicos`

Errores de proveedor:

- `tableMA_ProveedoresError`
- `tableMA_SistemasProveedor`
- `tableMA_ModulosSIHO`
- `tableMA_ErroresProveedor`

Alcances:

- `tableInter_rolesAlcances`.

## 3. `tableMA_Tickets`

Campos clave:

- `id_ticket`.
- `folio_ticket` único.
- `titulo_ticket` snapshot.
- `descripcion_ticket`.
- `id_categoria_ticket`, `id_subcategoria_ticket`, `id_titulo_ticket`.
- `id_prioridad_ticket`, `id_estatus_ticket`.
- `id_usuario_solicitante`, `id_empleado_solicitante`.
- `id_responsable`, `id_ubicacion`.
- `error_proveedor`.
- Fechas de respuesta, resolución, cierre y SLA.
- `ticket_reapertura`.
- `timestamps`.

## 4. Datos demo

Catálogos:

- Categorías: Sistemas, Servicios Generales, Mantenimiento, Biomédica.
- Subcategorías y títulos base + catálogo ampliado de Sistemas.
- Prioridades y SLA.
- Estatus.
- Etiquetas.
- Proveedores de error, sistemas y módulos SIHO.

Departamentos:

- Operaciones.
- Administración.
- Sistemas (`atiende_helpdesk=true`).
- Servicios Generales (`true`).
- Mantenimiento (`true`).
- Biomédica (`true`).

Usuarios:

- `DEMOADMIN` — Admin, alcance global.
- `DEMOTEC` — HelpdeskTecnico.
- `DEMOSOL` — HelpdeskSolicitante.
- `DEMOALMACEN` — Almacen.

Tickets:

- ~12.
- Folios `TK-2026-0001` a `TK-2026-0012`.
- Estatus y prioridades variados.
- Avances visibles e internos.
- Etiquetas.
- Error de proveedor.
- Encuesta.
- Reapertura.
- Sin responsable en algunos.

## 5. Seeders

```text
database/seeders/DemoSeeder.php
database/seeders/table_RolesSeeder.php
database/seeders/Helpdesk/table_CatalogoSistemasSeeder.php
database/seeders/Helpdesk/DemoTicketsSeeder.php
```

Reglas:

- `firstOrCreate`/`updateOrCreate` para catálogos.
- Datos deterministas.
- Correos `.invalid`/`.demo`.
- No secretos.

## 6. Adaptaciones SQLite

- Nombres planos.
- Sin `CREATE SCHEMA`.
- Sin `after()`.
- Sin `->primary()` extra.
- Folio portable.
- Dashboard portable.
- `DB::table` con helper.
- Verificar `lockForUpdate`.

## 7. Verificación

Usuario ejecuta:

```sh
php artisan migrate:fresh --seed
```

Luego:

- Confirmar 17 tablas.
- Confirmar columnas.
- Confirmar 12 tickets.
- Confirmar catálogos.
- Confirmar `migrate:status`.
