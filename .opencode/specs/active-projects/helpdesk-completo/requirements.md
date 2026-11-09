# Requisitos — Helpdesk completo

## 1. Objetivo funcional

Tener en la demo el mismo Helpdesk del main, adaptado a SQLite y con datos sintéticos.

## 2. Requisitos funcionales

### RF-01 — Base de datos

- 17 tablas Helpdesk.
- Columnas `atiende_helpdesk` en departamentos y usuarios.
- `ultimo_acceso`.
- `tableInter_rolesAlcances`.
- Migraciones 046–062 y 069/070 adaptadas.
- Compatibilidad SQLite y PostgreSQL.

### RF-02 — Permisos

- Recursos:
  - `helpdesk.tickets`
  - `helpdesk.mis_tickets`
  - `helpdesk.reportes`
  - `helpdesk.configuracion`
  - `helpdesk.internas`
- Acciones:
  - `tickets`: lectura, escritura.
  - `mis_tickets`: lectura, escritura.
  - `reportes`: lectura.
  - `configuracion`: lectura, escritura.
  - `internas`: lectura, escritura.
- Alcances:
  - `helpdesk.tickets`: propio, departamento, global.
  - `helpdesk.reportes`: propio, departamento, global.
- Admin con alcance global explícito.
- Técnico con alcance derivado por departamento.
- Solicitante con alcance propio.

### RF-03 — Backend

- Modelos, controladores, servicios, observer y notificaciones del main.
- Rutas API bajo `/api/helpdesk/*`.
- Validaciones y transiciones del main.
- Folio portable en SQLite.
- Dashboard portable.
- Envelope `{ success, message, data }`.

### RF-04 — Frontend

- Menú Helpdesk.
- Nuevo Ticket.
- Mis Tickets.
- Mesas de Ayuda.
- Detalle de ticket.
- Dashboard.
- Configuración.
- Store, tipos y CSS.
- Aviso de correo demo.
- Checkbox `atiende_helpdesk` en Departamentos y Usuarios.

### RF-05 — Datos demo

- Catálogos completos.
- Departamentos de soporte.
- Usuarios `DEMOADMIN`, `DEMOTEC`, `DEMOSOL`, `DEMOALMACEN`.
- ~12 tickets variados.
- Avances, etiquetas, encuesta, error de proveedor y reapertura.

### RF-06 — Correo

- Sin envío real.
- `DEMO_MAIL_ENABLED=false`.
- `MAIL_MAILER=log`.
- `QUEUE_CONNECTION=sync`.
- Aviso visible en Helpdesk.
- Sin errores al crear/cambiar/cerrar tickets.

### RF-07 — Compatibilidad demo

- No romper QR público.
- No romper impresora deshabilitada.
- No romper cuota demo.
- No tocar producción.
- La demo se regenera con `migrate:fresh --seed`.

## 3. Requisitos no funcionales

- Sin secretos.
- Datos sintéticos.
- Imports Linux-safe.
- Sin dependencias nuevas si ya existen.
- Sin `php.exe` por parte de agentes.
- Build de Render después de cada sub-fase.

## 4. Criterios de aceptación

Ver [acceptance.md](acceptance.md).
