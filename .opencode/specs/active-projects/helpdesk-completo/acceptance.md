# Aceptación — Helpdesk completo

## 4A — Esquema y alcances

- [ ] `migrate:fresh --seed` sin errores SQLite.
- [ ] 17 tablas Helpdesk.
- [ ] `atiende_helpdesk` en departamentos y usuarios.
- [ ] `ultimo_acceso`.
- [ ] `tableInter_rolesAlcances`.
- [ ] Migraciones compatibles con PostgreSQL.
- [ ] Login devuelve `alcances`.
- [ ] Roles UI muestra alcances.
- [ ] App sigue funcionando.
- [ ] Build frontend OK.

## 4B — Backend

- [ ] Rutas `/api/helpdesk/*` responden.
- [ ] Catálogos completos.
- [ ] Crear ticket con folio único.
- [ ] Listar tickets con alcance.
- [ ] Cambiar estatus respetando transiciones.
- [ ] Asignar técnicos.
- [ ] Registrar avances.
- [ ] Cerrar y encuestar.
- [ ] Marcar error de proveedor.
- [ ] Dashboard con métricas.
- [ ] Sin SMTP.
- [ ] Sin errores SQLite.

## 4C — Frontend

- [ ] Menú Helpdesk visible con permisos.
- [ ] Menú oculto sin permisos.
- [ ] Nuevo Ticket.
- [ ] Mis Tickets.
- [ ] Mesas.
- [ ] Detalle.
- [ ] Dashboard.
- [ ] Configuración.
- [ ] Aviso de correo visible.
- [ ] Checkboxes `atiende_helpdesk`.
- [ ] `pnpm exec tsc --noEmit` OK.
- [ ] `pnpm run lint` OK o preexistentes documentados.
- [ ] `pnpm run build` OK.

## 4D — Datos demo

- [ ] 12 tickets.
- [ ] Folios `TK-2026-0001` a `TK-2026-0012`.
- [ ] Estatus y prioridades variados.
- [ ] Avances visibles e internos.
- [ ] Etiquetas.
- [ ] Error de proveedor.
- [ ] Encuesta.
- [ ] Reapertura.
- [ ] Sin responsable en algunos.
- [ ] Usuarios demo funcionando.
- [ ] Dashboard no vacío.

## Permisos

- [ ] Admin ve todo.
- [ ] Técnico ve su departamento.
- [ ] Solicitante ve solo sus tickets.
- [ ] Sin permiso: 403.
- [ ] Global solo por fila explícita.

## Demo y seguridad

- [ ] No hay correos reales.
- [ ] No hay secretos.
- [ ] No se tocó producción.
- [ ] QR público sigue funcionando.
- [ ] Cuota demo sigue activa.
- [ ] No se ejecutó `php.exe` por agentes.
- [ ] Usuario validó en la app.
- [ ] Spec archivada solo con OK.
