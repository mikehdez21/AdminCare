# Tareas — Helpdesk completo

## Fase 4A — Esquema, modelos y alcances

### Tareas

- [x] Crear `app/Support/SchemaTable.php`.
- [x] Crear `app/Models/Concerns/UsesHelpdeskTable.php`.
- [x] Crear migraciones `SQLITE/046`–`062`.
- [x] Crear migraciones `SQLITE/069` y `070`.
- [x] Crear columnas `atiende_helpdesk` en departamentos y usuarios.
- [x] Crear los 16 modelos de `app/Models/Helpdesk/`.
- [x] Actualizar `User` y `Departamento`.
- [x] Agregar `helpdesk.*` a `config/permisos.php`.
- [x] Crear `AlcanceService`.
- [x] Actualizar `AuthController` con `alcances` y `departamentos_atiende`.
- [x] Actualizar seeders de permisos/alcances.
- [x] Actualizar UI de roles con alcances.
- [x] `git diff --check`.

### Verificación

- [ ] Usuario ejecuta `migrate:fresh --seed`.
- [ ] 17 tablas Helpdesk.
- [ ] Columnas nuevas.
- [ ] Login devuelve `alcances`.
- [ ] Roles UI muestra alcances.
- [ ] App sigue funcionando.
- [x] `pnpm exec tsc --noEmit`.
- [x] `pnpm run lint` sobre archivos modificados.
- [x] `pnpm run build`.

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

- [x] Portar controladores de `app/Http/Controllers/Helpdesk/`.
- [x] Portar servicios de `app/Services/Helpdesk/`.
- [x] Portar `NotificaUsuarios`, `TicketObserver` y notificaciones.
- [x] Portar vistas de correo.
- [x] Agregar rutas Helpdesk a `routes/api.php`.
- [x] Adaptar folio portable.
- [x] Adaptar dashboard `TO_CHAR`.
- [x] Adaptar `DB::table('helpdesk...')`.
- [x] Configurar `config/demo.php` y short-circuit de correo.
- [x] `git diff --check`.

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
