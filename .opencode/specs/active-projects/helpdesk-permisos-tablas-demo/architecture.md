# Arquitectura

## 1. Estado actual

### Main

- Laravel 11 con PostgreSQL por defecto.
- Helpdesk usa el esquema PostgreSQL `helpdesk.*`.
- Rutas API bajo `/api/HSS1`.
- Permisos por capacidad (`helpdesk.tickets.lectura`, `almacen.escritura`, etc.).
- Alcances por rol en `tableInter_rolesAlcances`.
- Helpdesk con servicios, observer y notificaciones por correo.
- Frontend en `resources/js`.

### Fork demo

- Laravel 11 con SQLite como conexión por defecto.
- Migraciones portables en `database/migrations/SQLITE`.
- Rutas API sin prefijo (`/api/...`).
- Permisos antiguos basados en `sidebar_*`.
- Sin Helpdesk.
- Frontend en `frontend/src/js`.
- Restricciones demo: cuota de 100, QR público, impresora deshabilitada.

## 2. Estrategia de convivencia SQLite/PostgreSQL

El fork conserva la conexión PostgreSQL, pero la demo ejecuta SQLite. No se deben duplicar modelos ni controladores.

### 2.1 Tablas

- En PostgreSQL, Helpdesk vive en el esquema `helpdesk`.
- En SQLite no existen esquemas; las tablas viven en la raíz.
- Los modelos declaran el nombre base sin esquema y un trait resuelve el prefijo.

Propuesta:

```php
trait UsesHelpdeskTable
{
    public function getTable()
    {
        $table = parent::getTable();

        return $this->getConnection()->getDriverName() === 'pgsql'
            && ! str_contains($table, '.')
            ? 'helpdesk.'.$table
            : $table;
    }
}
```

Uso:

```php
protected $table = 'tableMA_Tickets';
use UsesHelpdeskTable;
```

Este patrón replica el trait existente `UsesAlmacenGeneralTable`.

### 2.2 Migraciones

- Se conserva la numeración del main para mantener paridad: `046` a `062` de Helpdesk, `059`/`060` de banderas, `069` de alcances y `070` de último acceso.
- Se colocan en `database/migrations/SQLITE` porque ese es el path canónico de la demo.
- La migración `046` crea el esquema solo en PostgreSQL; en SQLite es no-op.
- Las migraciones usan un helper mínimo para resolver el nombre de tabla:

```php
App\Support\SchemaTable::helpdesk('tableMA_Tickets');
```

- En SQLite se eliminan detalles no soportados:
  - `->after(...)`.
  - `->primary()` adicional cuando `bigIncrements` ya es primary.
  - `CREATE SCHEMA`.
- `down()` debe ser simétrico y seguro.

### 2.3 Consultas

Adaptaciones obligatorias en Helpdesk:

| Main | Fork |
|---|---|
| `DB::table('helpdesk.tableMA_ErroresProveedor')` | helper `SchemaTable::helpdesk(...)` |
| `TO_CHAR(created_at, 'YYYY-MM')` | expresión por driver o agrupación en PHP |
| `pg_advisory_xact_lock(...)` + regex/cast para folio | generación portable por transacción |
| `lockForUpdate()` | conservar; verificar que SQLite lo ignore correctamente |

La generación de folio debe quedar en un método único del `TicketService`, con ramas explícitas por driver. En SQLite se puede calcular el consecutivo dentro de la transacción con una consulta simple y `MAX`, sin lock asesor.

## 3. Módulos y capas

### 3.1 Backend Helpdesk

```
app/
  Http/Controllers/Helpdesk/        15 controladores
  Models/Helpdesk/                  16 modelos
  Services/Helpdesk/                TicketService, TicketQueryService, AvanceService
  Notifications/                    TicketNuevo, TicketEstadoCambiado
  Observers/                        TicketObserver
  Support/                          NotificaUsuarios
```

Flujo:

1. Ruta protegida por `auth:sanctum` + permiso de capacidad.
2. Controlador valida y delega en servicio.
3. Servicio aplica reglas de negocio, transiciones, alcance y transacciones.
4. Modelo persiste.
5. Observer dispara notificaciones (en demo, apagadas por configuración).
6. Respuesta con envelope existente.

### 3.2 Permisos

```
config/permisos.php
app/Support/Permisos.php
app/Services/Permisos/AlcanceService.php
database/migrations/SQLITE/069_...rolesAlcances.php
database/seeders/table_PermissionsSeeder.php
database/seeders/table_AlcancesSeeder.php
```

Reglas:

- El último segmento del permiso es la acción.
- `lectura` no implica escritura; `escritura` sí implica lectura; `eliminar` implica ambas.
- El alcance no concede permiso; solo recorta registros.
- `global` solo por fila explícita en `tableInter_rolesAlcances`.
- El alcance derivado usa `atiende_helpdesk` del usuario y del departamento.

### 3.3 Frontend

```
frontend/src/js/
  components/04_Helpdesk/
  store/helpdesk/
  @types/HelpdeskTypes/
  utils/helpdesk.ts
  utils/alcances.ts
  utils/permissions.ts
  components/Home/Sidebar/SubMenuOptions_Helpdesk.tsx
  css/04_Helpdesk/
```

El frontend consume permisos y alcances desde `authReducer`. No decide alcance por sí mismo; el backend recorta los listados.

### 3.4 Tablas/listados

Backend:

- `App\Http\Controllers\Concerns\Paginable` del main.
- Controladores de Administrador y Almacén actualizados.
- Contrato: `page`, `per_page`, `search`, `sort`, `direction`, `filtros[clave]`.

Frontend:

- `components/00_Utils/TablaEntidades.tsx`.
- `hooks/useOrdenFiltroCliente.ts`.
- `hooks/usePaginacionRtk.ts` y `usePaginacionServidor.ts` actualizados.
- `utils/tabla.ts`, `@types/tablaTypes.ts`, `@types/paginacionTypes.ts`.
- CSS `00_Utils/TablaEntidades.css`.
- Controles de Administrador y Almacén actualizados.

## 4. Integración con la demo

### 4.1 Cuota

La cuota actual cuenta proveedores, facturas y activos. Helpdesk no se suma para no cambiar la semántica de "unidades de negocio" de la demo. Esta decisión se documenta y se puede revisar.

### 4.2 Correo

- Se porta el código de notificaciones.
- `config/demo.php` expone `mail_enabled`.
- `.env.example` define `DEMO_MAIL_ENABLED=false`.
- `NotificaUsuarios::enviar` retorna `false` sin despachar si el correo demo está apagado.
- La UI muestra un aviso permanente en Helpdesk.
- No se configura SMTP ni Microsoft 365.

### 4.3 QR e impresora

- No se tocan las rutas públicas de QR ni el bloqueo de impresora.
- Los permisos de Almacén sí cambian de nombres; las rutas de QR/printer se agrupan bajo `almacen`.

### 4.4 Sesión

- Se conserva el flujo de logout del fork.
- Se agrega `alcances` al payload de login/check/permissions.
- Se agrega `user.departamentos_atiende` para el formulario de ticket.
- Se agrega `ultimo_acceso` a `tableUsuarios` para no romper el login del main.

## 5. Dependencias entre fases

```
Fase 1 (esquema)
  -> Fase 2 (permisos)
      -> Fase 3 (backend Helpdesk)
          -> Fase 4 (frontend Helpdesk)
  -> Fase 5 (tablas Admin/Almacén)
Fase 6 (datos demo) depende de 1, 2 y 3
Fase 7 (verificación) depende de todo
```

No se debe iniciar la Fase 3 sin las tablas y los permisos base, porque los controladores y rutas dependen de ambos.

## 6. Riesgos técnicos

1. **SQLite vs PostgreSQL en Helpdesk.** El main tiene SQL específico de PostgreSQL. Sin adaptación, `migrate:fresh --seed` falla.
2. **Pérdida de cambios demo.** Los controladores y componentes del fork tienen ajustes propios (cuota, SQLite, guards). Reemplazar archivos completos puede borrarlos; se debe portar por diff.
3. **Refactor de permisos transversal.** Cambia rutas, menús y roles. Un nombre viejo olvidado produce 403 o menús vacíos.
4. **Roles y redirecciones.** El sidebar actual decide `/admin` vs `/app` por nombre de rol. Los roles nuevos deben caer en `/app` sin romper Admin.
5. **Correos encolados.** Las notificaciones del main son `ShouldQueue`. Si se despachan, pueden intentar enviar o quedar en cola. Se deben apagar en origen.
6. **Migraciones con `after()`/`primary()`.** SQLite no soporta lo mismo que PostgreSQL.
7. **Sin suite de tests en el fork.** La validación real de migraciones y API la ejecuta el usuario en su terminal; los agentes no pueden ejecutar `php.exe` según el AGENTS.

## 7. Alternativas descartadas

- **Duplicar Helpdesk para SQLite y PostgreSQL:** doble mantenimiento, descartado.
- **Convertir todo el fork a PostgreSQL:** rompe la demo Render/SQLite, descartado.
- **Copiar el esquema final en un solo dump:** rápido, pero pierde paridad con el main y dificulta futuras sincronizaciones, descartado.
- **Mantener permisos viejos y agregar Helpdesk:** no cumple "permisos mejor creados" ni alcances, descartado.
