# Permisos

## 1. Modelo

Se adopta el sistema del main:

- Recurso + acción: `recurso.accion`.
- Acciones: `lectura`, `escritura`, `eliminar`.
- Cadena de implicación:
  - `lectura` solo lectura.
  - `escritura` incluye lectura.
  - `eliminar` incluye escritura y lectura.
- Un recurso puede declarar solo las acciones que existen.
- El alcance (`propio`, `departamento`, `global`) no concede permisos; recorta registros.
- El alcance `global` solo existe con fila explícita en `tableInter_rolesAlcances`.
- El alcance derivado se calcula con `atiende_helpdesk` del usuario y del departamento.

## 2. Catálogo `config/permisos.php`

Se porta el archivo del main adaptado a los módulos del fork.

### Dominios

- `nav`
- `almacen`
- `contabilidad`
- `admin`
- `helpdesk`
- `catalogos`

No se incluye `home.*` porque ResumenHome no se porta.

### Recursos

| Recurso | Acciones |
|---|---|
| `nav.dashboard` | lectura |
| `almacen` | lectura, escritura, eliminar |
| `contabilidad.depreciacion` | lectura, escritura |
| `contabilidad.metodos` | lectura, escritura, eliminar |
| `contabilidad.auditoria` | lectura, escritura, eliminar |
| `admin.usuarios` | lectura, escritura, eliminar |
| `admin.empleados` | lectura, escritura, eliminar |
| `admin.roles` | lectura, escritura, eliminar |
| `admin.departamentos` | lectura, escritura, eliminar |
| `admin.ubicaciones` | lectura, escritura, eliminar |
| `helpdesk.tickets` | lectura, escritura |
| `helpdesk.mis_tickets` | lectura, escritura |
| `helpdesk.reportes` | lectura |
| `helpdesk.configuracion` | lectura, escritura |
| `helpdesk.internas` | lectura, escritura |
| `catalogos.departamentos` | lectura |
| `catalogos.ubicaciones` | lectura |
| `catalogos.empleados` | lectura |

### Alcances

| Recurso | Valores |
|---|---|
| `helpdesk.tickets` | propio, departamento, global |
| `helpdesk.reportes` | propio, departamento, global |

## 3. Mapeo de permisos viejos → nuevos

| Permiso viejo del fork | Permisos nuevos |
|---|---|
| `sidebar_menu_admindashboard` | `nav.dashboard.lectura` |
| `sidebar_submenu_almacenes_almacengeneral` | `almacen.lectura` / `.escritura` / `.eliminar` |
| `sidebar_menu_contabilidad` | `contabilidad.depreciacion.*`, `contabilidad.metodos.*`, `contabilidad.auditoria.*` |
| `sidebar_submenu_administrador_gestionroles` | `admin.roles.*` |
| `sidebar_submenu_administrador_gestiondepartamentos` | `admin.departamentos.*` |
| `sidebar_submenu_administrador_gestionusuarios` | `admin.usuarios.*` |
| `sidebar_submenu_administrador_gestionempleados` | `admin.empleados.*` |
| `sidebar_submenu_administrador_gestionubicaciones` | `admin.ubicaciones.*` |
| — | `helpdesk.tickets.*` |
| — | `helpdesk.mis_tickets.*` |
| — | `helpdesk.reportes.lectura` |
| — | `helpdesk.configuracion.*` |
| — | `helpdesk.internas.*` |
| — | `catalogos.departamentos.lectura` |
| — | `catalogos.ubicaciones.lectura` |
| — | `catalogos.empleados.lectura` |

Los permisos viejos no se conservan en la base demo porque se regenera. No se necesita comando de renombrado para la demo, aunque se puede portar `permisos:renombrar` si se quiere paridad con main.

## 4. Backend

### 4.1 Archivos

- `app/Support/Permisos.php`
- `app/Services/Permisos/AlcanceService.php`
- `config/permisos.php`
- `app/Models/User.php` (scopes y relaciones)
- `app/Models/Departamento.php` (bandera)
- `app/Http/Controllers/AuthController.php` (payload)
- `routes/api.php` (middleware)
- `database/migrations/SQLITE/069_...`
- `database/seeders/table_PermissionsSeeder.php`
- `database/seeders/table_AlcancesSeeder.php`

### 4.2 Uso en rutas

En lugar de:

```php
Route::middleware('permission:sidebar_submenu_administrador_gestionusuarios')
```

usar:

```php
$lectura = Permisos::middleware('admin.usuarios', 'lectura');
$escritura = Permisos::middleware('admin.usuarios', 'escritura');
$eliminar = Permisos::middleware('admin.usuarios', 'eliminar');

Route::middleware(PermissionMiddleware::class.':'.$lectura)->group(function () {
    Route::get('admin/usuarios', ...);
});
```

Para Helpdesk:

```php
$permTicketsLectura = Permisos::middleware('helpdesk.tickets', 'lectura');
$permTicketsEscritura = Permisos::middleware('helpdesk.tickets', 'escritura');
$permMisTicketsLectura = Permisos::middleware('helpdesk.mis_tickets', 'lectura');
$permMisTicketsEscritura = Permisos::middleware('helpdesk.mis_tickets', 'escritura');
$permReportes = Permisos::middleware('helpdesk.reportes', 'lectura');
$permConfiguracion = Permisos::middleware('helpdesk.configuracion', 'escritura');
$permInternas = Permisos::middleware('helpdesk.internas', 'escritura');
```

### 4.3 Reglas de autorización

- `helpdesk.tickets.lectura`: ver la mesa y el detalle según alcance.
- `helpdesk.tickets.escritura`: actualizar, cambiar estatus, asignar técnicos, marcar error, cerrar.
- `helpdesk.mis_tickets.lectura`: ver los propios.
- `helpdesk.mis_tickets.escritura`: crear, reabrir y calificar.
- `helpdesk.reportes.lectura`: dashboard.
- `helpdesk.configuracion.*`: catálogos del módulo.
- `helpdesk.internas.*`: notas internas y subcategorías internas.
- `catalogos.*.lectura`: llenar selects de otros módulos sin abrir la pantalla de Administración.

## 5. Roles demo

| Rol | Permisos | Alcance |
|---|---|---|
| `Admin` | Todos | Global en `helpdesk.tickets` y `helpdesk.reportes` |
| `JAlmacenGeneral` / `Almacen` | `almacen.*`, `catalogos.*.lectura`, `nav.dashboard.lectura` | No aplica |
| `HelpdeskTecnico` | `helpdesk.tickets.*`, `helpdesk.reportes.lectura`, `helpdesk.configuracion.lectura`, `helpdesk.internas.*`, `catalogos.*.lectura` | Departamento derivado |
| `HelpdeskSolicitante` | `helpdesk.mis_tickets.*`, `catalogos.*.lectura` | Propio derivado |

Notas:

- Se conservan los nombres de rol actuales `Admin` y `Almacen`/`JAlmacenGeneral` para no romper la navegación del sidebar.
- Los roles nuevos caen en `/app`; el menú de Helpdesk aparece según permisos.
- `Admin` recibe todos los permisos mediante `Permission::all()`.
- El alcance global de Admin se siembra explícitamente; no se deriva.

## 6. Seeders

### `table_PermissionsSeeder`

- Recorre `Permisos::recursos()`.
- Crea permisos con `firstOrCreate`.
- Limpia caché de Spatie.
- No borra permisos viejos en bases existentes; en demo se regenera la base.

### `table_AlcancesSeeder`

- Crea las filas de `tableInter_rolesAlcances` para Admin.
- Puede crear filas de alcance global para roles que se decidan.
- No crea `global` para técnicos/solicitantes.

### `table_RolesSeeder`

- Crea roles base.
- No asigna permisos destructivamente.
- `DemoSeeder` asigna los permisos finales.

## 7. Frontend

### Archivos

- `frontend/src/js/utils/permissions.ts`
- `frontend/src/js/utils/alcances.ts`
- `frontend/src/js/store/authActions.ts`
- `frontend/src/js/store/authReducer.ts`
- `frontend/src/js/components/Home/Sidebar/Sidebar_OptionsList.tsx`
- `frontend/src/js/components/Home/Sidebar/SubMenuOptions_*.tsx`
- `frontend/src/js/components/99_Administrador/Roles/*`
- `frontend/src/js/store/api/rolesApi.ts`

### Reglas

- `hasActionPermission(permissions, recurso, accion)` para visibilidad.
- `tieneCapacidadEn(permissions, dominio)` para menús de módulo.
- El frontend no calcula alcance; solo muestra lo que el backend devuelve.
- El payload de auth incluye `permissions` y `alcances`.
- `authReducer` guarda ambos.
- El modal de alcance de rol usa `rolesApi` para leer/escribir `tableInter_rolesAlcances`.

### Roles UI

Portar del main:

- `ModalAlcanceRol.tsx`
- `ModalInfoPermiso.tsx`
- `TablaPermisosRol.tsx`
- Cambios en `AddRol.tsx`, `EditRol.tsx`, `RolesControl.tsx`, `ShowPermisosRole.tsx`.
- CSS asociado.

## 8. Verificación

- `grep` de `sidebar_` en `frontend/src/js` y `routes/api.php`: no deben quedar permisos activos.
- Un usuario sin `helpdesk.tickets.lectura` recibe 403 en `GET /api/helpdesk/tickets`.
- Un técnico solo ve tickets de su departamento.
- Un solicitante solo ve sus tickets.
- Admin ve todo.
- El menú Helpdesk aparece/desaparece según permisos.
- La pantalla de Roles muestra el catálogo nuevo y permite editar alcance.
- El login devuelve `alcances` y `user.departamentos_atiende`.
