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

- [x] Portar componentes `04_Helpdesk`.
- [x] Portar store `helpdesk`.
- [x] Portar tipos y CSS.
- [x] Registrar reducers.
- [x] Agregar rutas `/helpdesk/*`.
- [x] Agregar menú Helpdesk.
- [x] Agregar `DemoMailNotice`.
- [x] Agregar checkboxes `atiende_helpdesk` en Administración.
- [x] `pnpm exec tsc --noEmit`.
- [x] ESLint directo sobre archivos modificados.
- [x] `pnpm run lint`.
- [x] `pnpm run build`.

### Correcciones posteriores a 4C

- [x] CSS del submenú Helpdesk en el sidebar (`#SubMenu_Helpdesk`).
- [x] Aviso de correo alineado con `div_SectionSelected`.
- [x] `.buttonAdd` global en `app.css`.
- [x] Quitar proveedores de error demo (`Reliv`, `Vayver`, `Eden`, `HSS`).
- [x] Quitar sistemas de proveedor demo (`SIHO`, `ECE`, `Surfing`).
- [x] Renombrar “Módulos de SIHO” a “Módulos de Sistemas”.
- [x] Limpieza de datos existentes con migración `071`.

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

- [x] Actualizar `DemoSeeder` con departamentos de soporte.
- [x] Crear usuarios `DEMOTEC` y `DEMOSOL`.
- [x] Crear roles y alcances.
- [x] Enlazar categorías con departamentos.
- [x] Crear `DemoHelpdeskSeeder`.
- [x] Crear 12 tickets variados.
- [x] Agregar avances, etiquetas, encuesta, error de proveedor y reapertura.
- [x] Actualizar README con credenciales y límites.
- [x] `git diff --check`.

### Verificación

- [ ] `migrate:fresh --seed`.
- [ ] 12 tickets.
- [ ] Catálogos completos.
- [ ] Usuarios demo.
- [ ] Dashboard con métricas.
- [ ] Alcances correctos.
- [ ] Aviso de correo.

### Entrega

- [x] Commit: `feat(demo): seed helpdesk sample data`
- [x] **Sin push.** El commit queda local.
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
