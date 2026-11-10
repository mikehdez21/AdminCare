# Tareas — Tablas y listados

## Fase 3.1 — Backend

- [x] Portar `Paginable` del main.
- [x] Portar controladores de Administrador por diff:
  - [x] Departamentos.
  - [x] Empleados.
  - [x] Roles.
  - [x] Ubicaciones.
  - [x] Usuarios.
- [x] Portar controladores de Almacén por diff:
  - [x] Activos Fijos.
  - [x] Facturas.
  - [x] Movimientos.
  - [x] Proveedores.
- [x] Conservar cuota demo.
- [x] Conservar ajustes SQLite con `App\Support\SchemaTable`.
- [x] Revisar imports.
- [x] `git diff --check`.

## Fase 3.2 — Frontend

- [x] Portar `TablaEntidades.tsx`.
- [x] Portar `useOrdenFiltroCliente.ts`.
- [x] Actualizar `usePaginacionRtk.ts` y `usePaginacionServidor.ts`.
- [x] Portar `utils/tabla.ts`, tipos y CSS.
- [x] Portar los CSS por módulo del main para alinear `list_entitiesDiv_<modulo>` e IDs `#<modulo>_th_*`/`#<modulo>_td_*`.
- [x] Actualizar los 9 controles.
- [x] Actualizar `ListActivoFijo.tsx` para pasar orden/filtros a la tabla.
- [x] Añadir `getDepartamentosActivos` y `getEmpleadosActivos`.
- [x] `pnpm exec tsc --noEmit`.
- [x] ESLint directo sobre archivos modificados.
- [ ] `pnpm run lint`. Falla por errores preexistentes de indentación en `App.tsx`, ajenos a esta fase.
- [x] `pnpm run build`.

## Verificación manual

- [ ] `php artisan migrate:fresh --seed` (usuario).
- [ ] Administrador: ordenar/filtrar/paginar cada tabla.
- [ ] Almacén: ordenar/filtrar/paginar cada tabla.
- [ ] Crear/editar/eliminar sigue funcionando.
- [ ] Cuota demo sigue activa.
- [ ] Sin 500 por filtros inválidos.
- [ ] Sin `per_page`: lista completa.

## Entrega

- [ ] Commit: `feat(tables): add sorting filtering and server pagination`
- [ ] **Sin push.** El commit queda local.
- [ ] Usuario revisa el commit.
- [ ] Usuario hace push manualmente.
- [ ] Render build OK.
- [ ] Usuario revisa la app.
- [ ] Usuario responde OK.

**No iniciar Spec 4 sin OK.**
