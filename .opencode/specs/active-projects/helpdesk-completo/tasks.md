# Tareas — Helpdesk completo

## Fase 4A — Esquema, modelos y alcances

### Tareas

- [ ] Crear `app/Support/SchemaTable.php`.
- [ ] Crear `app/Models/Concerns/UsesHelpdeskTable.php`.
- [ ] Crear migraciones `SQLITE/046`–`062`.
- [ ] Crear migraciones `SQLITE/069` y `070`.
- [ ] Crear columnas `atiende_helpdesk` en departamentos y usuarios.
- [ ] Crear los 16 modelos de `app/Models/Helpdesk/`.
- [ ] Actualizar `User` y `Departamento`.
- [ ] Agregar `helpdesk.*` a `config/permisos.php`.
- [ ] Crear `AlcanceService`.
- [ ] Actualizar `AuthController` con `alcances` y `departamentos_atiende`.
- [ ] Actualizar seeders de permisos/alcances.
- [ ] Actualizar UI de roles con alcances.
- [ ] `git diff --check`.

### Verificación

- [ ] Usuario ejecuta `migrate:fresh --seed`.
- [ ] 17 tablas Helpdesk.
- [ ] Columnas nuevas.
- [ ] Login devuelve `alcances`.
- [ ] Roles UI muestra alcances.
- [ ] App sigue funcionando.
- [ ] `pnpm exec tsc --noEmit`.
- [ ] `pnpm run lint`.
- [ ] `pnpm run build`.

### Entrega

- [ ] Commit: `feat(db): add helpdesk schema and scopes`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

**No iniciar 4B sin OK.**

---

## Fase 4B — Backend Helpdesk

### Tareas

- [ ] Portar controladores de `app/Http/Controllers/Helpdesk/`.
- [ ] Portar servicios de `app/Services/Helpdesk/`.
- [ ] Portar `NotificaUsuarios`, `TicketObserver` y notificaciones.
- [ ] Portar vistas de correo.
- [ ] Agregar rutas Helpdesk a `routes/api.php`.
- [ ] Adaptar folio portable.
- [ ] Adaptar dashboard `TO_CHAR`.
- [ ] Adaptar `DB::table('helpdesk...')`.
- [ ] Configurar `config/demo.php` y short-circuit de correo.
- [ ] `git diff --check`.

### Verificación

- [ ] API de catálogos responde.
- [ ] Crear ticket.
- [ ] Listar tickets.
- [ ] Cambiar estatus.
- [ ] Cerrar.
- [ ] Sin SMTP.
- [ ] Sin errores SQLite.

### Entrega

- [ ] Commit: `feat(helpdesk): add helpdesk backend`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

**No iniciar 4C sin OK.**

---

## Fase 4C — Frontend Helpdesk

### Tareas

- [ ] Portar componentes `04_Helpdesk`.
- [ ] Portar store `helpdesk`.
- [ ] Portar tipos y CSS.
- [ ] Registrar reducers.
- [ ] Agregar rutas `/helpdesk/*`.
- [ ] Agregar menú Helpdesk.
- [ ] Agregar `DemoMailNotice`.
- [ ] Agregar checkboxes `atiende_helpdesk` en Administración.
- [ ] `pnpm exec tsc --noEmit`.
- [ ] `pnpm run lint`.
- [ ] `pnpm run build`.

### Verificación

- [ ] Menú Helpdesk.
- [ ] Nuevo Ticket.
- [ ] Mis Tickets.
- [ ] Mesas.
- [ ] Detalle.
- [ ] Dashboard.
- [ ] Configuración.
- [ ] Aviso de correo.
- [ ] Flags de atención.

### Entrega

- [ ] Commit: `feat(helpdesk): add helpdesk interface`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

**No iniciar 4D sin OK.**

---

## Fase 4D — Datos demo

### Tareas

- [ ] Actualizar `DemoSeeder` con departamentos de soporte.
- [ ] Crear usuarios `DEMOTEC` y `DEMOSOL`.
- [ ] Crear roles y alcances.
- [ ] Enlazar categorías con departamentos.
- [ ] Crear `DemoTicketsSeeder`.
- [ ] Crear ~12 tickets variados.
- [ ] Agregar avances, etiquetas, encuesta, error de proveedor y reapertura.
- [ ] Actualizar README con credenciales y límites.
- [ ] `git diff --check`.

### Verificación

- [ ] `migrate:fresh --seed`.
- [ ] 12 tickets.
- [ ] Catálogos completos.
- [ ] Usuarios demo.
- [ ] Dashboard con métricas.
- [ ] Alcances correctos.
- [ ] Aviso de correo.

### Entrega

- [ ] Commit: `feat(demo): seed helpdesk sample data`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

---

## Cierre

- [ ] Checklist de [acceptance.md](acceptance.md).
- [ ] Reporte de archivos y verificaciones.
- [ ] Mover spec a `projects-completed` solo con OK del usuario.
