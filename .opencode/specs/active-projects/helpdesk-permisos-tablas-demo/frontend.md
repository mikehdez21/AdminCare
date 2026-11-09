# Frontend

## 1. Estructura

El fork mantiene el frontend en:

```text
frontend/
  src/
    js/
      components/
      store/
      @types/
      hooks/
      utils/
      router/
    css/
```

No se mueve a `resources/js`. Los imports nuevos deben usar el alias `@` → `frontend/src/js` y `@styles` → `frontend/src/css`.

## 2. Rutas

### Públicas

Se conservan:

- `/login`
- `/status`
- `/activosfijos/qraf/scan/:codigoQR`
- `/activosfijos/qraf/:codigoQR`

### Autenticadas

Se conservan:

- `/app` (shell vacío hasta elegir módulo)
- `/admin`
- `/almacen-general/*`
- `/almacen_general/*`
- `/gestion-usuarios/*`, `/gestion_usuarios/*`
- `/gestion-empleados/*`, `/gestion_empleados/*`
- `/gestion-roles/*`, `/gestion_roles/*`
- `/gestion-departamentos/*`, `/gestion_departamentos/*`
- `/gestion-ubicaciones/*`, `/gestion_ubicaciones/*`
- `/contabilidad/depreciacion-af/*`, `/contabilidad/depreciacionaf/*`
- `/contabilidad/configuracion/*`
- `/contabilidad/auditoria/*`

Se agregan:

- `/helpdesk/*`
- `/helpdesk/mis-tickets`
- `/helpdesk/ticket`
- `/helpdesk/mesas`
- `/helpdesk/admin`
- `/helpdesk/dashboard`
- `/helpdesk/configuracion`

`App.tsx` debe declarar `/helpdesk/*` dentro de `ProtectedRoutes` y `MainLayout`.

## 3. Sidebar

### Cambios

- `Sidebar_OptionsList.tsx` usa `tieneCapacidadEn`/`hasActionPermission`.
- Se elimina la dependencia de permisos `sidebar_*`.
- Se agrega `SubMenuOptions_Helpdesk.tsx`.
- El submenú Helpdesk muestra:
  - Nuevo Ticket (`helpdesk.mis_tickets.escritura`).
  - Mis Tickets (`helpdesk.mis_tickets.lectura`).
  - Mesas de Ayuda (`helpdesk.tickets.lectura`).
  - Dashboard (`helpdesk.reportes.lectura`).
  - Configuración (`helpdesk.configuracion.lectura`).
- Si no hay ninguna capacidad de Helpdesk, no se renderiza el menú.
- El acceso directo a `/admin` sigue dependiendo de `nav.dashboard.lectura`.
- Almacén, Contabilidad y Administrador usan las capacidades nuevas.
- Se conserva el logo actual del fork (sin reintroducir la imagen del main).

### Redirección por rol

El sidebar actual navega:

- Admin → `/admin`
- JAlmacenGeneral/default → `/app`

Los roles nuevos (`HelpdeskTecnico`, `HelpdeskSolicitante`) caen en `/app`; no requieren caso especial.

## 4. Helpdesk — componentes

Portar desde el main:

```text
components/04_Helpdesk/
  AddTicket.tsx
  DashboardControl.tsx
  DashboardHelpdesk.tsx
  FiltrosTickets.tsx
  MesaAyuda.tsx
  MesasAyudaControl.tsx
  MisTickets.tsx
  TicketCard.tsx
  TicketDetalle.tsx
  Configuracion/...
```

### Adaptaciones

- URLs de API sin `HSS1`.
- Imports con alias `@`.
- `auth.alcances` disponible.
- Aviso de correo demo.
- No usar endpoints o permisos del main que no se hayan portado (Home, Extensiones).
- Conservar el CSS del main en `frontend/src/css/04_Helpdesk/`.

### Flujo de pantallas

1. `/helpdesk` → `AddTicket`.
2. `/helpdesk/mis-tickets` → `MisTickets`.
3. `/helpdesk/mesas` → `MesaAyuda` / `MesasAyudaControl`.
4. `/helpdesk/ticket` → `TicketDetalle`.
5. `/helpdesk/dashboard` → `DashboardHelpdesk`.
6. `/helpdesk/configuracion` → `ConfigHelpdeskControl`.

## 5. Store y tipos

Portar:

```text
store/helpdesk/Catalogos/
store/helpdesk/Configuracion/
store/helpdesk/Dashboard/
store/helpdesk/Tickets/
@types/HelpdeskTypes/ticketTypes.ts
@types/HelpdeskTypes/configuracionTypes.ts
utils/helpdesk.ts
utils/alcances.ts
```

Actualizar:

- `store/store.ts` para registrar los reducers nuevos.
- `store/authActions.ts` y `authReducer.ts` para `alcances`.
- `@types/mainTypes.ts` para `atiende_helpdesk`, `departamentos_atiende` y `ultimo_acceso`.
- `store/api/tags.ts` si se agregan tags de Helpdesk.

Reglas:

- No duplicar tipos entre Helpdesk y Administración.
- Reutilizar `dateFormat`, `numbersFormat`, `permissions` del fork.
- El frontend no calcula alcance; muestra lo que el backend devuelve.

## 6. Tablas y listados

### Alcance

Solo Administrador y Almacén.

### Archivos compartidos a portar

```text
components/00_Utils/TablaEntidades.tsx
hooks/useOrdenFiltroCliente.ts
hooks/usePaginacionRtk.ts
hooks/usePaginacionServidor.ts
utils/tabla.ts
@types/tablaTypes.ts
@types/paginacionTypes.ts
css/00_Utils/TablaEntidades.css
```

### Controles a actualizar

Administrador:

- `Departamentos/DepartamentoControl.tsx`
- `Empleados/EmpleadosControl.tsx`
- `Roles/RolesControl.tsx`
- `Ubicaciones/UbicacionControl.tsx`
- `Usuarios/UsuariosControl.tsx`

Almacén:

- `ActivosFijos/CRUD/subcomponents/TablaActivosFijos.tsx`
- `Facturas/FacturasControl.tsx`
- `MovimientosAF/MovimientoIndividual.tsx`
- `Proveedores/ProveedorControl.tsx`

### Comportamiento

- Encabezados ordenables.
- Filtros por columna.
- Paginación de servidor.
- Búsqueda global.
- El estado de orden/filtros se envía al backend.
- Sin `per_page`, el backend devuelve lista completa; la UI decide cuándo paginar.

### Campos de atención Helpdesk

En Administración:

- Alta/edición de Departamento: checkbox `atiende_helpdesk`.
- Alta/edición de Usuario: checkbox `atiende_helpdesk`.
- Tablas: columna o indicador de atención Helpdesk cuando aplique.

## 7. Correo demo

Agregar un componente reutilizable:

```text
components/00_Utils/DemoMailNotice.tsx
```

Uso:

- En `AddTicket`, `MisTickets`, `MesaAyuda`, `TicketDetalle` y `Configuracion`.
- Texto: "Esta demo no tiene servicio de correo configurado. Los tickets y avances se guardan, pero no se envían notificaciones por correo."
- Estilo consistente con el banner `DemoNotice` actual.
- No debe bloquear formularios ni acciones.

Opcional:

- Mostrar un `Swal` informativo después de crear un ticket o cambiar estatus, una sola vez por sesión.
- No mostrar error; es una limitación esperada.

## 8. Roles UI

Portar del main:

- `ModalAlcanceRol.tsx`
- `ModalInfoPermiso.tsx`
- `TablaPermisosRol.tsx`
- Cambios en `AddRol`, `EditRol`, `RolesControl`, `ShowPermisosRole`.
- CSS `99_Administrador/Roles/*`.

Debe permitir:

- Ver permisos agrupados por dominio.
- Ver descripción y acciones.
- Asignar alcance `propio`/`departamento`/`global` a `helpdesk.tickets` y `helpdesk.reportes`.
- Guardar y refrescar el rol.

## 9. Menús antiguos

Buscar y eliminar usos de:

```text
sidebar_menu_
sidebar_submenu_
sidebar_navbar_
.control
```

En `frontend/src/js` no debe quedar ningún permiso de esos como condición de render.

## 10. Verificación

Desde `frontend/`:

```sh
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Además:

- Revisar que no haya imports rotos por mayúsculas/minúsculas.
- Revisar que `/helpdesk/*` cargue con `RouteLoader`.
- Revisar que el menú no aparezca sin permisos.
- Revisar que el aviso de correo se vea en todas las pantallas de Helpdesk.
- Revisar que los listados de Administrador/Almacén mantengan sus acciones existentes.

## 11. Riesgos

- El frontend del main usa `TablaEntidades` y hooks nuevos; el fork tiene versiones viejas. Portar solo el componente sin actualizar los hooks deja tablas sin orden/filtros.
- Los controles del main incluyen cambios de permisos y campos nuevos; reemplazar archivos completos puede borrar ajustes demo del fork.
- El CSS del main puede asumir clases de `PageHome` que el fork no tiene; adaptar sin romper `Home.css`.
- `react-icons` debe tener los iconos usados por Helpdesk; ya está instalado.
