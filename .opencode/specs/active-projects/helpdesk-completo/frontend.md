# Frontend — Helpdesk completo

## 1. Rutas

Se agregan dentro de `ProtectedRoutes` + `MainLayout`:

- `/helpdesk/*`
- `/helpdesk/mis-tickets`
- `/helpdesk/ticket`
- `/helpdesk/mesas`
- `/helpdesk/admin`
- `/helpdesk/dashboard`
- `/helpdesk/configuracion`

Se conservan `/app`, `/admin`, Almacén, Contabilidad y Administración.

## 2. Componentes

```text
frontend/src/js/components/04_Helpdesk/
  AddTicket.tsx
  DashboardControl.tsx
  DashboardHelpdesk.tsx
  FiltrosTickets.tsx
  MesaAyuda.tsx
  MesasAyudaControl.tsx
  MisTickets.tsx
  TicketCard.tsx
  TicketDetalle.tsx
  Configuracion/*
```

## 3. Store y tipos

```text
frontend/src/js/store/helpdesk/Catalogos/*
frontend/src/js/store/helpdesk/Configuracion/*
frontend/src/js/store/helpdesk/Dashboard/*
frontend/src/js/store/helpdesk/Tickets/*
frontend/src/js/@types/HelpdeskTypes/*
frontend/src/js/utils/helpdesk.ts
frontend/src/js/utils/alcances.ts
```

Registrar reducers en `store/store.ts`.

## 4. Sidebar

- Agregar `SubMenuOptions_Helpdesk.tsx`.
- Mostrar:
  - Nuevo Ticket con `helpdesk.mis_tickets.escritura`.
  - Mis Tickets con `helpdesk.mis_tickets.lectura`.
  - Mesas con `helpdesk.tickets.lectura`.
  - Dashboard con `helpdesk.reportes.lectura`.
  - Configuración con `helpdesk.configuracion.lectura`.
- No mostrar el menú si no hay capacidades.
- Roles nuevos caen en `/app`.

## 5. Aviso de correo

Componente `DemoMailNotice.tsx`:

```text
Esta demo no tiene servicio de correo configurado.
Los tickets y avances se guardan, pero no se envían notificaciones por correo.
```

Mostrar en:

- AddTicket.
- MisTickets.
- MesaAyuda.
- TicketDetalle.
- Configuración.

No bloquear formularios.

## 6. Administración

Agregar checkbox `atiende_helpdesk` en:

- `99_Administrador/Departamentos/AddDepartamento.tsx`
- `99_Administrador/Departamentos/EditDepartamento.tsx`
- `99_Administrador/Usuarios/AddUser.tsx`
- `99_Administrador/Usuarios/EditUser.tsx`

Mostrar columna/indicador en tablas si aplica.

## 7. Adaptaciones

- URLs de API sin `HSS1`.
- Imports `@/` y `@styles/`.
- No importar Home/Resumen.
- No usar `TablaEntidades` si el módulo usa su propia tabla; mantener el patrón del main.
- No romper el aviso `DemoNotice` existente.
- No romper CSS de Home.

## 8. Validación

```sh
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Manual:

- Menú Helpdesk.
- Nuevo Ticket.
- Mis Tickets.
- Mesas.
- Detalle.
- Dashboard.
- Configuración.
- Aviso de correo.
- Checkboxes de atención.
