# Base de datos

## 1. Estrategia

- Mantener la numeración del main para facilitar futuras comparaciones.
- Ubicar las migraciones adaptadas en `database/migrations/SQLITE/`.
- Usar nombres de tabla planos en SQLite y el prefijo `helpdesk.` solo en PostgreSQL.
- No modificar las migraciones históricas `almacengeneral/` ni `logs/`; siguen siendo PostgreSQL y están en la lista de omisión de `AppServiceProvider`.
- Regenerar la demo con `php artisan migrate:fresh --seed` (lo ejecuta el usuario; los agentes no pueden ejecutar `php.exe`).

## 2. Migraciones nuevas

| Migración | Origen main | Contenido | SQLite |
|---|---|---|---|
| `SQLITE/046_helpdesk_create_schema.php` | `05_helpdesk/046` | Crea esquema `helpdesk` | No-op |
| `SQLITE/047_BD_ref_CategoriasTicket_table.php` | `05_helpdesk/047` | Categorías + seed inicial | Tabla plana |
| `SQLITE/048_BD_ref_SubcategoriasTicket_table.php` | `05_helpdesk/048` | Subcategorías + seed | Tabla plana |
| `SQLITE/049_BD_ref_TitulosTicket_table.php` | `05_helpdesk/049` | Títulos + seed | Tabla plana |
| `SQLITE/050_BD_ref_PrioridadesTicket_table.php` | `05_helpdesk/050` | Prioridades + seed | Tabla plana |
| `SQLITE/051_BD_ref_EstatusTicket_table.php` | `05_helpdesk/051` | Estatus + seed | Tabla plana |
| `SQLITE/052_BD_ref_SLANiveles_table.php` | `05_helpdesk/052` | SLA + seed | Tabla plana |
| `SQLITE/053_BD_principal_Tickets_table.php` | `05_helpdesk/053` | Tickets | Tabla plana |
| `SQLITE/054_BD_principal_ActividadTicket_table.php` | `05_helpdesk/054` | Actividad | Tabla plana |
| `SQLITE/055_BD_principal_AvancesTicket_table.php` | `05_helpdesk/055` | Avances | Tabla plana |
| `SQLITE/056_BD_principal_EncuestaSatisfaccion_table.php` | `05_helpdesk/056` | Encuesta | Tabla plana |
| `SQLITE/057_BD_principal_Etiquetas_table.php` | `05_helpdesk/057` | Etiquetas + seed | Tabla plana |
| `SQLITE/058_BD_intermedia_ticketsEtiquetas_table.php` | `05_helpdesk/058` | Pivote etiquetas | Tabla plana |
| `SQLITE/061_BD_intermedia_ticketsTecnicos_table.php` | `05_helpdesk/061` | Pivote técnicos | Tabla plana |
| `SQLITE/062_BD_principal_ErroresProveedor_tables.php` | `05_helpdesk/062` | 4 tablas de errores + seed | Tabla plana |
| `SQLITE/059_BD_principal_Departamentos_atiende_helpdesk_table.php` | raíz `059` | Bandera de departamento | Columna |
| `SQLITE/060_BD_principal_Usuarios_atiende_helpdesk_table.php` | raíz `060` | Bandera de usuario | Columna |
| `SQLITE/069_BD_intermedia_RolesAlcances_table.php` | raíz `069` | Alcances por rol | Tabla plana |
| `SQLITE/070_BD_principal_Usuarios_ultimo_acceso_table.php` | raíz `070` | Último acceso | Columna |

### Numeración

- Las migraciones existentes de SQLite llegan a `020`.
- Las nuevas usan `046`–`070` para conservar la correlación con el main.
- No hay colisión con `almacengeneral/013`–`041` ni con `logs/012` porque esos paths se omiten en SQLite.

## 3. Tablas Helpdesk

### 3.1 Catálogos

| Tabla | Propósito |
|---|---|
| `tableRef_CategoriasTicket` | Categoría de primer nivel y departamento responsable |
| `tableRef_SubcategoriasTicket` | Subcategoría; `es_publico` decide si la ve el solicitante |
| `tableRef_TitulosTicket` | Título seleccionable; snapshot del ticket |
| `tableRef_PrioridadesTicket` | Baja, Media, Alta, Crítica |
| `tableRef_EstatusTicket` | Abierto, Asignado, En Proceso, Pendiente, Resuelto, Cerrado |
| `tableRef_SLANiveles` | Tiempos de respuesta/resolución por prioridad |

### 3.2 Principales

`tableMA_Tickets`:

- `id_ticket` PK.
- `folio_ticket` único (`TK-2026-0001`).
- `titulo_ticket` snapshot NOT NULL.
- `descripcion_ticket`.
- `id_categoria_ticket` NOT NULL.
- `id_subcategoria_ticket`, `id_titulo_ticket` nullable.
- `id_prioridad_ticket` NOT NULL.
- `id_estatus_ticket` default 1.
- `id_usuario_solicitante` NOT NULL.
- `id_empleado_solicitante` NOT NULL.
- `id_responsable` nullable (empleado).
- `id_ubicacion` nullable.
- `error_proveedor` boolean default false.
- Fechas: primer respuesta, resolución, cierre, límites SLA, reapertura.
- `ticket_reapertura`.
- `timestamps`.
- FKs a catálogos, usuarios, empleados y ubicaciones.

`tableMA_ActividadTicket`:

- Historial inmutable.
- `id_ticket`, `id_usuario_actor`, `tipo_actividad`, `valor_anterior`, `valor_nuevo`, `descripcion_actividad`, `created_at`.

`tableMA_AvancesTicket`:

- Bitácora de trabajo.
- `id_ticket`, `id_usuario_autor`, `contenido_avance`, `es_interno`, `fecha_eliminado`.

`tableMA_EncuestaSatisfaccion`:

- Una por ticket.
- Calificación, comentario, evaluador, fecha.

`tableMA_Etiquetas`:

- `nombre_etiqueta` único, color.

### 3.3 Pivotes

| Tabla | Relación |
|---|---|
| `tableInter_ticketsEtiquetas` | Ticket ↔ etiqueta |
| `tableInter_ticketsTecnicos` | Ticket ↔ responsables/colaboradores (hasta 5 empleados) |

### 3.4 Errores de proveedor

| Tabla | Propósito |
|---|---|
| `tableMA_ProveedoresError` | Catálogo de proveedores; `requiere_sistema` |
| `tableMA_SistemasProveedor` | Sistemas por proveedor |
| `tableMA_ModulosSIHO` | Módulos SIHO |
| `tableMA_ErroresProveedor` | Error 1:1 por ticket |

## 4. Columnas nuevas en tablas existentes

### `tableDepartamentos`

- `atiende_helpdesk` boolean default false.
- Se agrega a `fillable` y `casts` del modelo.
- Se usa para cerrar la lista de áreas que reciben tickets.
- La UI de Departamentos debe permitir marcarlo.

### `tableUsuarios`

- `atiende_helpdesk` boolean default false.
- `ultimo_acceso` timestamp nullable.
- Se agregan a `fillable`/`casts` según corresponda.
- La UI de Usuarios debe permitir marcar técnicos.
- `AuthController` actualiza `ultimo_acceso` al iniciar sesión.

### `tableInter_rolesAlcances`

- `id_rol` FK a `roles`.
- `recurso` (ej. `helpdesk.tickets`).
- `alcance` (`propio`, `departamento`, `global`).
- PK compuesta (`id_rol`, `recurso`).
- Índice por `recurso`.

## 5. Adaptaciones SQLite obligatorias

1. **Esquema:** `CREATE SCHEMA` solo PostgreSQL; no ejecutar en SQLite.
2. **Nombres:** tablas planas en SQLite; prefijo `helpdesk.` solo PostgreSQL.
3. **`after()`:** omitir en SQLite.
4. **`->primary()` extra:** quitar cuando `bigIncrements` ya define la PK.
5. **Folio:** reemplazar `pg_advisory_xact_lock` + regex/cast por generación portable.
6. **Dashboard:** reemplazar `TO_CHAR` por expresión compatible con SQLite o agrupación en PHP.
7. **`DB::table('helpdesk...')`:** usar helper de nombre.
8. **`lockForUpdate()`:** conservar si el grammar de SQLite lo ignora; si falla, omitir solo en SQLite.

## 6. Datos demo

### 6.1 Catálogos

Se conservan los catálogos del main:

- Categorías: Sistemas, Servicios Generales, Mantenimiento, Biomédica.
- Subcategorías y títulos del catálogo base.
- Catálogo ampliado de Sistemas del seeder `table_CatalogoSistemasSeeder`.
- Prioridades y SLA.
- Estatus.
- Etiquetas.
- Proveedores de error, sistemas y módulos SIHO.

### 6.2 Departamentos demo

Además de los actuales `Operaciones` y `Administración`, agregar:

- `Sistemas` (`atiende_helpdesk = true`).
- `Servicios Generales` (`atiende_helpdesk = true`).
- `Mantenimiento` (`atiende_helpdesk = true`).
- `Biomédica` (`atiende_helpdesk = true`).

Las categorías sembradas por migración quedan con `id_departamento_default = null`; el seeder demo las enlaza por nombre después de crear los departamentos.

### 6.3 Usuarios demo

| Usuario | Rol | Uso |
|---|---|---|
| `DEMOADMIN` | Admin | Todos los permisos; alcance global Helpdesk |
| `DEMOTEC` | HelpdeskTecnico | Técnico de Sistemas, `atiende_helpdesk = true` |
| `DEMOSOL` | HelpdeskSolicitante | Solicitante de Operaciones |
| `DEMOALMACEN` | Almacen | Usuario actual de almacén |

Contraseñas demo documentadas en README, sin secretos reales.

### 6.4 Tickets demo (~12)

Distribución propuesta:

| # | Tema | Estatus | Prioridad | Extras |
|---|---|---|---|---|
| 1 | No puedo iniciar sesión en SIHO | Abierto | Alta | Sin responsable |
| 2 | Falla de impresora en Recepción | Asignado | Media | Responsable DEMOTEC |
| 3 | Solicitud de alta de usuario | En Proceso | Baja | Avance visible |
| 4 | Internet intermitente en Administración | Pendiente | Alta | Avance interno |
| 5 | Falla de VPN | Resuelto | Media | Fechas SLA |
| 6 | Mantenimiento preventivo de equipo | Cerrado | Baja | Encuesta de satisfacción |
| 7 | Falla de cámara CCTV | En Proceso | Crítica | Error de proveedor |
| 8 | Cambio de contraseña | Cerrado | Baja | Reapertura previa |
| 9 | Equipo biomédico no enciende | Asignado | Crítica | Biomédica |
| 10 | Limpieza de área | Resuelto | Baja | Servicios Generales |
| 11 | Aire acondicionado sin funcionar | Pendiente | Alta | Mantenimiento |
| 12 | Solicitud de tóner | Abierto | Media | Etiqueta `Requiere compra` |

Reglas:

- Folios deterministas `TK-2026-0001` a `TK-2026-0012`.
- Fechas entre enero y febrero de 2026.
- Actividades coherentes con cada estatus.
- Avances visibles e internos.
- Un ticket con etiquetas.
- Un ticket con error de proveedor.
- Un ticket con encuesta.
- Un ticket reabierto.
- Tickets sin responsable para mostrar "Sin asignar".

### 6.5 Seeders

```
database/seeders/
  DatabaseSeeder.php
  DemoSeeder.php
  table_PermissionsSeeder.php
  table_AlcancesSeeder.php
  table_RolesSeeder.php
  Helpdesk/
    table_CatalogoSistemasSeeder.php
    DemoTicketsSeeder.php
```

`DatabaseSeeder` llama a `DemoSeeder`, que a su vez:

1. Crea catálogos base.
2. Crea departamentos, empleados y usuarios demo.
3. Crea roles y asigna permisos.
4. Crea alcances globales del Admin.
5. Ejecuta catálogos Helpdesk.
6. Ejecuta `DemoTicketsSeeder`.

## 7. Idempotencia y resets

- La demo se regenera completa; no se requieren migraciones incrementales sobre datos existentes.
- Aun así, los seeders usan `firstOrCreate`/`updateOrCreate` para poder ejecutarse dos veces sin duplicar catálogos.
- `migrate:fresh --seed` debe dejar la base en un estado reproducible.
- No se ejecuta `migrate:fresh` sobre ninguna base que no sea la SQLite demo.

## 8. Verificación de base de datos

El usuario debe ejecutar en su terminal:

```sh
php artisan migrate:fresh --seed
```

Comprobaciones:

- No hay errores de sintaxis SQLite.
- Existen las 17 tablas Helpdesk.
- Existen las columnas `atiende_helpdesk` y `ultimo_acceso`.
- Existen las 12 tickets demo.
- Los catálogos tienen datos.
- Las FKs no bloquean el seed.
- `php artisan migrate:status` muestra todas las migraciones aplicadas.

Los agentes no ejecutan `php.exe` según el AGENTS del proyecto; solo pueden revisar sintaxis y estructura estáticamente.
