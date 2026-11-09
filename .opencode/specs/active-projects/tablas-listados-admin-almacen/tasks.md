# Tareas — Tablas y listados

## Fase 3.1 — Backend

- [ ] Portar `Paginable` del main.
- [ ] Portar controladores de Administrador por diff:
  - [ ] Departamentos.
  - [ ] Empleados.
  - [ ] Roles.
  - [ ] Ubicaciones.
  - [ ] Usuarios.
- [ ] Portar controladores de Almacén por diff:
  - [ ] Activos Fijos.
  - [ ] Facturas.
  - [ ] Movimientos.
  - [ ] Proveedores.
- [ ] Conservar cuota demo.
- [ ] Conservar ajustes SQLite.
- [ ] Revisar imports.
- [ ] `git diff --check`.

## Fase 3.2 — Frontend

- [ ] Portar `TablaEntidades.tsx`.
- [ ] Portar `useOrdenFiltroCliente.ts`.
- [ ] Actualizar `usePaginacionRtk.ts` y `usePaginacionServidor.ts`.
- [ ] Portar `utils/tabla.ts`, tipos y CSS.
- [ ] Actualizar los 9 controles.
- [ ] `pnpm exec tsc --noEmit`.
- [ ] `pnpm run lint`.
- [ ] `pnpm run build`.

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
- [ ] Push a `main`.
- [ ] Render build OK.
- [ ] Usuario revisa.
- [ ] Usuario responde OK.

**No iniciar Spec 4 sin OK.**
