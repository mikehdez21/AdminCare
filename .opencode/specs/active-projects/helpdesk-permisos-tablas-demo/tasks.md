# Tareas por fases

## Regla general

Cada fase debe:

1. Leer los archivos del main y del fork antes de editar.
2. Portar por diff, no reemplazar archivos completos cuando el fork tenga cambios demo.
3. Ejecutar `git diff --check`.
4. Ejecutar validación frontend cuando aplique.
5. Reportar archivos modificados, verificaciones ejecutadas y no ejecutadas.
6. No ejecutar `php.exe`, `php artisan serve`, `npm run dev` ni servidores locales.
7. Hacer **un commit + push a `main` por fase**.
8. Esperar el build de Render y la revisión manual del usuario antes de continuar.

El flujo detallado está en [delivery.md](delivery.md).

Antes de empezar, copiar esta spec a:

```text
.opencode/specs/active-projects/helpdesk-permisos-tablas-demo/
```

Según el AGENTS del proyecto, ninguna carpeta validada debe permanecer en `active-projects`; al cierre se mueve a `projects-completed` solo con confirmación del usuario.

---

## Fase 0 — Spec en el repo, preparación y baseline

### Objetivo

Tener la spec dentro del repo, un punto de partida claro y evitar mezclar cambios.

### Tareas

- Copiar la spec a `.opencode/specs/active-projects/helpdesk-permisos-tablas-demo/`.
- Confirmar referencia del main: `develop` en `b53d2ca`.
- Confirmar que el fork está limpio (`git status`).
- Revisar `.env` demo: `DB_CONNECTION=sqlite`, `DEMO_MODE`, `QUEUE_CONNECTION`.
- Documentar que la base local se regenerará con `migrate:fresh --seed`.
- Guardar baseline de:
  - `git diff --check`.
  - `pnpm exec tsc --noEmit`.
  - `pnpm run lint`.
  - `pnpm run build`.
- Commit de la spec:
  - `docs(specs): add helpdesk demo parity plan`
- Push a `main`.
- Esperar build de Render.
- El usuario puede revisar la spec; no hay cambios funcionales.

### Verificación

- Spec dentro del repo.
- Sin cambios de código.
- Baseline registrado.
- Build de Render exitoso.
- Usuario confirma que puede regenerar la SQLite demo.

### Salida

Spec aprobada, baseline y build inicial.

**Gate:** no iniciar Fase 1 hasta que el usuario confirme la Fase 0.

---

## Fase 1 — Esquema Helpdesk y modelos

### Objetivo

Crear la estructura de base de datos y los modelos, sin UI ni rutas todavía.

### Tareas

1. Crear helper de nombres de esquema:
   - `app/Support/SchemaTable.php` (nombre sugerido).
   - Método `helpdesk(string $table): string`.
2. Crear trait:
   - `app/Models/Concerns/UsesHelpdeskTable.php`.
   - Mismo patrón que `UsesAlmacenGeneralTable`.
3. Crear migraciones adaptadas en `database/migrations/SQLITE/`:
   - `046` a `062` de Helpdesk.
   - `059` y `060` de banderas.
   - `069` de alcances.
   - `070` de último acceso.
4. Adaptar migraciones:
   - `CREATE SCHEMA` solo PostgreSQL.
   - Nombres planos en SQLite.
   - Quitar `after()` y `->primary()` extra en SQLite.
   - Semillas de catálogos con IDs resueltos por nombre.
5. Crear los 16 modelos de `app/Models/Helpdesk/`:
   - `CategoriaTicket`, `SubcategoriaTicket`, `TituloTicket`, `PrioridadTicket`, `EstatusTicket`, `SLANivel`, `Ticket`, `ActividadTicket`, `AvanceTicket`, `EncuestaSatisfaccion`, `Etiqueta`, `TicketTecnico`, `ProveedorError`, `SistemaProveedor`, `ModuloSIHO`, `ErrorProveedor`.
   - `$table` plano + `UsesHelpdeskTable`.
   - Relaciones, scopes, casts y fillable del main.
6. Actualizar:
   - `app/Models/User.php`: `departamentos()`, scopes, `routeNotificationForMail`, fillable/casts.
   - `app/Models/Departamento.php`: `atiende_helpdesk`.
7. Verificar que `AppServiceProvider` siga cargando `database/migrations/SQLITE` y omitiendo las migraciones PostgreSQL viejas.

### Archivos principales

```text
app/Support/SchemaTable.php
app/Models/Concerns/UsesHelpdeskTable.php
app/Models/Helpdesk/*.php
app/Models/User.php
app/Models/Departamento.php
database/migrations/SQLITE/046..070*.php
```

### Verificación

- `git diff --check`.
- Revisión estática de nombres de tabla y FKs.
- Grep: no debe quedar `helpdesk.` hardcodeado en modelos ni migraciones SQLite.
- Usuario ejecuta `php artisan migrate:fresh --seed` y reporta resultado.
- `php artisan migrate:status` muestra las migraciones nuevas.

### Salida

Base demo con tablas Helpdesk, columnas y pivotes.

---

## Fase 2 — Permisos backend y frontend base

### Objetivo

Reemplazar el sistema de permisos de sidebar por capacidades y alcances, sin Helpdesk aún.

### Tareas backend

1. Crear `config/permisos.php` adaptado.
2. Crear `app/Support/Permisos.php`.
3. Crear `app/Services/Permisos/AlcanceService.php`.
4. Actualizar `AuthController`:
   - Inyectar `AlcanceService`.
   - Agregar `alcances` a login/check/permissions.
   - Agregar `user.departamentos_atiende`.
   - Actualizar `ultimo_acceso`.
   - Conservar logout/logout-inactive del fork.
5. Reemplazar `database/seeders/table_PermissionsSeeder.php`.
6. Crear `database/seeders/table_AlcancesSeeder.php`.
7. Actualizar `table_RolesSeeder.php` y `DemoSeeder.php` para roles demo.
8. Reescribir `routes/api.php`:
   - Almacén por `almacen.*`.
   - Contabilidad por `contabilidad.*`.
   - Administrador por `admin.*`.
   - Catálogos compartidos por `catalogos.*`.
   - `nav.dashboard` para dashboard.
   - Mantener QR/formas de pago y restricciones demo.
9. Agregar permisos de Helpdesk al catálogo aunque las rutas se activen en Fase 3.

### Tareas frontend

1. Portar `utils/permissions.ts` y `utils/alcances.ts`.
2. Actualizar `authActions.ts`, `authReducer.ts` y `@types/mainTypes.ts`.
3. Actualizar `Sidebar_OptionsList.tsx` y submenús de Almacén/Contabilidad/Administrador.
4. Portar cambios de Roles:
   - `ModalAlcanceRol.tsx`.
   - `ModalInfoPermiso.tsx`.
   - `TablaPermisosRol.tsx`.
   - `AddRol`, `EditRol`, `RolesControl`, `ShowPermisosRole`.
   - `rolesApi.ts`.
5. Eliminar condiciones de render con permisos `sidebar_*`.

### Verificación

- Grep de `sidebar_` en `routes/api.php` y `frontend/src/js`: sin coincidencias activas.
- `pnpm exec tsc --noEmit`.
- `pnpm run lint`.
- `pnpm run build`.
- Usuario inicia sesión con DEMOADMIN y confirma que Almacén/Administración siguen funcionando.
- Usuario confirma que el login devuelve `alcances`.

### Salida

Sistema de permisos nuevo funcionando en los módulos existentes.

---

## Fase 3 — Backend Helpdesk

### Objetivo

Portar controladores, servicios, rutas y notificaciones de Helpdesk.

### Tareas

1. Copiar/adaptar controladores:
   - `TicketController`, `AvanceController`, `EncuestaController`.
   - `CategoriaController`, `SubcategoriaController`, `TituloController`.
   - `PrioridadController`, `SLANivelController`, `EstatusController`, `EtiquetaController`.
   - `ModuloSIHOController`, `ProveedorErrorController`, `SistemaProveedorController`.
   - `HelpdeskDashboardController`, `EmpleadoController`.
2. Copiar/adaptar servicios:
   - `TicketService`, `TicketQueryService`, `AvanceService`.
3. Copiar/adaptar soporte:
   - `NotificaUsuarios`, `TicketObserver`.
   - `TicketNuevo`, `TicketEstadoCambiado`.
   - Vistas `resources/views/emails/helpdesk/*`.
4. Agregar rutas Helpdesk a `routes/api.php` con permisos nuevos.
5. Adaptar SQLite:
   - Folio portable.
   - `TO_CHAR` del dashboard.
   - `DB::table('helpdesk...')`.
   - `lockForUpdate` si aplica.
6. Configurar correo demo:
   - `config/demo.php`.
   - `DEMO_MAIL_ENABLED=false`.
   - Short-circuit en `NotificaUsuarios`.
   - `MAIL_MAILER=log`, `QUEUE_CONNECTION=sync`.
7. Revisar que los controladores no dependan de `ResumenHome`, `Extensiones` ni `/HSS1`.

### Verificación

- `git diff --check`.
- Revisión estática de rutas y permisos.
- Usuario prueba con API/Postman:
  - Login.
  - Catálogos.
  - Crear ticket.
  - Listar tickets.
  - Cambiar estatus.
  - Cerrar.
- No debe intentar conexión SMTP.
- No debe haber errores SQLite de sintaxis.

### Salida

API Helpdesk funcional, sin frontend dedicado todavía.

---

## Fase 4 — Frontend Helpdesk

### Objetivo

Portar la UI de Helpdesk y conectarla a las rutas nuevas.

### Tareas

1. Portar componentes `04_Helpdesk`.
2. Portar store `store/helpdesk`.
3. Portar tipos `@types/HelpdeskTypes`.
4. Portar CSS `css/04_Helpdesk`.
5. Registrar reducers en `store/store.ts`.
6. Agregar rutas en `App.tsx`:
   - `/helpdesk/*` y subrutas.
7. Agregar `SubMenuOptions_Helpdesk.tsx` al sidebar.
8. Agregar `DemoMailNotice` en pantallas de Helpdesk.
9. Adaptar URLs de API al prefijo `/api`.
10. Revisar imports `@/` y `@styles/`.
11. Revisar que no se importen componentes de Home/Resumen que no existen en el fork.

### Verificación

- `pnpm exec tsc --noEmit`.
- `pnpm run lint`.
- `pnpm run build`.
- Usuario prueba en navegador:
  - Menú Helpdesk.
  - Nuevo ticket.
  - Mis tickets.
  - Mesa de ayuda.
  - Detalle.
  - Dashboard.
  - Configuración.
- Aviso de correo visible.

### Salida

Módulo Helpdesk usable en la demo.

---

## Fase 5 — Tablas/listados Administrador y Almacén

### Objetivo

Portar orden, filtros y paginación del main.

### Tareas backend

1. Actualizar `app/Http/Controllers/Concerns/Paginable.php` al del main.
2. Portar por diff los controladores:
   - Administrador: Departamentos, Empleado, Roles, Ubicacion, User.
   - Almacén: ActivosFijos, Factura, MovimientosActivosFijos, Proveedor.
3. Conservar cambios demo:
   - Cuota.
   - SQLite.
   - QR.
   - Respuestas existentes.
4. Agregar `atiende_helpdesk` a validaciones de Departamento y Usuario.
5. Revisar que los controladores no dependan de clases no portadas.

### Tareas frontend

1. Portar `TablaEntidades.tsx`.
2. Portar `useOrdenFiltroCliente.ts`.
3. Actualizar `usePaginacionRtk.ts`, `usePaginacionServidor.ts`.
4. Portar `utils/tabla.ts`, `@types/tablaTypes.ts`, `@types/paginacionTypes.ts`.
5. Portar CSS `00_Utils/TablaEntidades.css`.
6. Actualizar los 9 controles definidos en `frontend.md`.
7. Agregar checkbox `atiende_helpdesk` en Departamentos y Usuarios.

### Verificación

- `pnpm exec tsc --noEmit`.
- `pnpm run lint`.
- `pnpm run build`.
- Usuario prueba orden/filtros/paginación en cada entidad.
- Revisar que las acciones de crear/editar/eliminar sigan funcionando.
- Revisar que la cuota demo siga activa.

### Salida

Listados mejorados sin regresiones en Administrador/Almacén.

---

## Fase 6 — Datos demo

### Objetivo

Poblar la demo con catálogos y tickets variados.

### Tareas

1. Actualizar `DemoSeeder`:
   - Departamentos de soporte.
   - Empleados.
   - Usuarios DEMOADMIN, DEMOTEC, DEMOSOL, DEMOALMACEN.
   - Roles y permisos.
   - Alcances globales de Admin.
2. Crear `Helpdesk/DemoTicketsSeeder.php`.
3. Crear ~12 tickets con:
   - Folios deterministas.
   - Fechas de enero/febrero 2026.
   - Estatus y prioridades variados.
   - Avances visibles e internos.
   - Etiquetas.
   - Error de proveedor.
   - Encuesta.
   - Reapertura.
   - Tickets sin responsable.
4. Enlazar categorías con departamentos de soporte.
5. Actualizar README con:
   - Usuarios demo y contraseñas.
   - Límite de correo.
   - Reset de la demo.
6. Mantener datos sintéticos y correos `.invalid`/`.demo`.

### Verificación

- Usuario ejecuta `php artisan migrate:fresh --seed`.
- Conteos:
  - 17 tablas Helpdesk.
  - 12 tickets.
  - Catálogos completos.
  - 4 departamentos de soporte.
  - 4 usuarios demo.
- Login con cada usuario.
- Los listados muestran datos.
- El dashboard tiene métricas.
- La encuesta y el error de proveedor se ven en el detalle.

### Salida

Demo poblada y reproducible.

---

## Fase 7 — Verificación y cierre

### Objetivo

Validar el conjunto completo y documentar.

### Tareas

1. `git diff --check`.
2. `grep` de permisos viejos:
   - `sidebar_`
   - `_navbar_`
   - `.control`
3. `grep` de `HSS1` en frontend nuevo (no debe reintroducirse).
4. `pnpm exec tsc --noEmit`.
5. `pnpm run lint`.
6. `pnpm run build`.
7. Revisión estática de rutas contra `routes/api.php`.
8. Pruebas manuales del usuario:
   - Login Admin.
   - Login técnico.
   - Login solicitante.
   - Crear, asignar, avanzar, cerrar y encuestar un ticket.
   - Verificar 403 para usuario sin permiso.
   - Verificar aviso de correo.
   - Verificar QR público y cuota demo.
9. Actualizar README y documentación de la demo.
10. Reportar:
    - Archivos modificados.
    - Verificaciones ejecutadas.
    - Verificaciones no ejecutadas y por qué.
    - Riesgos pendientes.
11. Mover la spec del proyecto a `projects-completed` solo con confirmación explícita del usuario.

### Verificación final

Ver `acceptance.md`.

### Salida

Tarea cerrada con evidencia y limitaciones documentadas.

---

## Orden recomendado de commits

Si el usuario autoriza commits, usar mensajes normales (no caveman) y separar:

1. `feat(db): esquema helpdesk y columnas de atencion`
2. `feat(permisos): catalogo por capacidades y alcances`
3. `feat(helpdesk): backend de tickets y catalogos`
4. `feat(helpdesk): interfaz de mesa de ayuda`
5. `feat(tablas): orden, filtros y paginacion en admin y almacen`
6. `feat(demo): datos sinteticos de helpdesk`
7. `docs(demo): limites de correo y credenciales`

Si el usuario no lo pide, no se crean commits.
