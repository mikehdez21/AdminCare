# Criterios de aceptación

## 1. Base de datos

- [ ] `php artisan migrate:fresh --seed` termina sin errores en SQLite.
- [ ] Existen las 17 tablas de Helpdesk:
  - [ ] `tableRef_CategoriasTicket`
  - [ ] `tableRef_SubcategoriasTicket`
  - [ ] `tableRef_TitulosTicket`
  - [ ] `tableRef_PrioridadesTicket`
  - [ ] `tableRef_EstatusTicket`
  - [ ] `tableRef_SLANiveles`
  - [ ] `tableMA_Tickets`
  - [ ] `tableMA_ActividadTicket`
  - [ ] `tableMA_AvancesTicket`
  - [ ] `tableMA_EncuestaSatisfaccion`
  - [ ] `tableMA_Etiquetas`
  - [ ] `tableInter_ticketsEtiquetas`
  - [ ] `tableInter_ticketsTecnicos`
  - [ ] `tableMA_ProveedoresError`
  - [ ] `tableMA_SistemasProveedor`
  - [ ] `tableMA_ModulosSIHO`
  - [ ] `tableMA_ErroresProveedor`
- [ ] Existe `tableInter_rolesAlcances`.
- [ ] `tableDepartamentos` tiene `atiende_helpdesk`.
- [ ] `tableUsuarios` tiene `atiende_helpdesk` y `ultimo_acceso`.
- [ ] Las migraciones son compatibles con SQLite y PostgreSQL.
- [ ] No se modificó ninguna base de producción.

## 2. Datos demo

- [ ] Se crean los departamentos `Sistemas`, `Servicios Generales`, `Mantenimiento` y `Biomédica`.
- [ ] Los cuatro están marcados con `atiende_helpdesk = true`.
- [ ] Existen los usuarios demo:
  - [ ] `DEMOADMIN`
  - [ ] `DEMOTEC`
  - [ ] `DEMOSOL`
  - [ ] `DEMOALMACEN`
- [ ] Existen ~12 tickets con folios `TK-2026-0001` a `TK-2026-0012`.
- [ ] Hay tickets en estatus variados.
- [ ] Hay prioridades variadas.
- [ ] Hay avances visibles e internos.
- [ ] Hay al menos un ticket con etiqueta.
- [ ] Hay al menos un ticket con error de proveedor.
- [ ] Hay al menos un ticket con encuesta.
- [ ] Hay al menos un ticket reabierto.
- [ ] Hay tickets sin responsable.
- [ ] El dashboard muestra métricas no vacías.

## 3. Helpdesk funcional

- [ ] El menú Helpdesk aparece con permisos.
- [ ] El menú no aparece sin permisos.
- [ ] `/helpdesk` abre Nuevo Ticket.
- [ ] `/helpdesk/mis-tickets` abre Mis Tickets.
- [ ] `/helpdesk/mesas` abre Mesas de Ayuda.
- [ ] `/helpdesk/ticket` abre el detalle.
- [ ] `/helpdesk/dashboard` abre el dashboard.
- [ ] `/helpdesk/configuracion` abre la configuración.
- [ ] Se puede crear un ticket con categoría, subcategoría, título, prioridad y ubicación.
- [ ] El folio se genera sin errores en SQLite.
- [ ] Se puede asignar responsable y colaboradores.
- [ ] Se pueden registrar avances visibles e internos.
- [ ] Se puede cambiar estatus respetando transiciones.
- [ ] Se puede cerrar y calificar con encuesta.
- [ ] Se puede reabrir un ticket.
- [ ] Se puede marcar y consultar error de proveedor.
- [ ] El detalle muestra actividad, avances, etiquetas y encuesta.
- [ ] Las acciones no permitidas devuelven 403 o mensaje de validación.

## 4. Permisos y alcances

- [ ] El login devuelve `permissions` y `alcances`.
- [ ] El login devuelve `user.departamentos_atiende`.
- [ ] `Admin` tiene todos los permisos.
- [ ] `Admin` tiene alcance global de Helpdesk.
- [ ] `HelpdeskTecnico` ve tickets de su departamento.
- [ ] `HelpdeskSolicitante` solo ve sus tickets.
- [ ] Un usuario sin `helpdesk.tickets.lectura` recibe 403 en la mesa.
- [ ] Un usuario sin `helpdesk.mis_tickets.escritura` no puede crear tickets.
- [ ] Las rutas de Administrador usan `admin.*`.
- [ ] Las rutas de Almacén usan `almacen.*`.
- [ ] Las rutas de Contabilidad usan `contabilidad.*`.
- [ ] Los catálogos compartidos usan `catalogos.*`.
- [ ] La UI de Roles muestra el catálogo nuevo.
- [ ] La UI permite asignar alcance a `helpdesk.tickets` y `helpdesk.reportes`.
- [ ] No quedan condiciones de render con permisos `sidebar_*`.

## 5. Tablas y listados

- [ ] Administrador/Departamentos permite ordenar, filtrar y paginar.
- [ ] Administrador/Empleados permite ordenar, filtrar y paginar.
- [ ] Administrador/Roles permite ordenar, filtrar y paginar.
- [ ] Administrador/Ubicaciones permite ordenar, filtrar y paginar.
- [ ] Administrador/Usuarios permite ordenar, filtrar y paginar.
- [ ] Almacén/Activos Fijos permite ordenar, filtrar y paginar.
- [ ] Almacén/Facturas permite ordenar, filtrar y paginar.
- [ ] Almacén/Movimientos permite ordenar, filtrar y paginar.
- [ ] Almacén/Proveedores permite ordenar, filtrar y paginar.
- [ ] Las acciones de crear/editar/eliminar siguen funcionando.
- [ ] Los filtros inválidos no generan 500.
- [ ] Sin `per_page`, la respuesta sigue siendo compatible.

## 6. Correo demo

- [ ] `DEMO_MAIL_ENABLED=false` está documentado.
- [ ] `MAIL_MAILER=log` y `QUEUE_CONNECTION=sync` están configurados en la demo.
- [ ] Crear un ticket no genera error de correo.
- [ ] Cambiar estatus/cerrar no genera error de correo.
- [ ] No se abre conexión SMTP.
- [ ] No se encolan jobs de correo.
- [ ] El aviso de correo se ve en las pantallas de Helpdesk.
- [ ] El aviso no bloquea formularios.

## 7. Calidad técnica

- [ ] `git diff --check` sin errores.
- [ ] `pnpm exec tsc --noEmit` sin errores.
- [ ] `pnpm run lint` sin errores nuevos.
- [ ] `pnpm run build` exitoso.
- [ ] No hay imports rotos por mayúsculas/minúsculas.
- [ ] No se introducen secretos ni correos reales.
- [ ] No se ejecutó `php.exe` por parte de agentes.
- [ ] No se modificó producción.
- [ ] La spec se movió a `projects-completed` solo con confirmación del usuario.

## 8. Verificación manual del usuario

El usuario debe ejecutar en su terminal:

```sh
php artisan migrate:fresh --seed
```

Luego:

1. Iniciar sesión con `DEMOADMIN`.
2. Abrir Helpdesk.
3. Crear un ticket.
4. Asignarlo a `DEMOTEC`.
5. Iniciar sesión con `DEMOTEC` y atenderlo.
6. Cerrar el ticket.
7. Iniciar sesión con `DEMOSOL` y calificar.
8. Verificar que `DEMOSOL` no ve tickets de otros.
9. Verificar el aviso de correo.
10. Revisar Administrador y Almacén: orden, filtros, paginación.
11. Revisar que la cuota demo siga funcionando en Almacén.
12. Revisar QR público.

## 9. Limitaciones aceptadas

- No hay envío real de correos.
- No hay ResumenHome/Home.
- No hay Extensiones PDF.
- No hay suite completa de tests del main.
- La cuota demo no incluye Helpdesk.
- La demo es efímera en Render: un reinicio puede perder datos y sesiones.
- No se porta el guard de inactividad del main.

## 10. Criterio de cierre

La tarea se considera terminada cuando:

- Todos los puntos obligatorios de este documento están marcados.
- El usuario validó la demo en su entorno.
- Se reportaron archivos modificados, verificaciones y riesgos.
- La spec se archivó según el AGENTS del proyecto.
