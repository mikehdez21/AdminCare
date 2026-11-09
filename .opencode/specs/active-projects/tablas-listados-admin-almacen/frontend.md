# Frontend — Tablas y listados

## Componente compartido

`TablaEntidades.tsx` debe manejar:

- Encabezados.
- Orden por columna.
- Filtros por columna.
- Paginación.
- Estado de carga.
- Acciones por fila.

## Hooks

- `useOrdenFiltroCliente`: estado local de orden/filtros para tablas no paginadas.
- `usePaginacionServidor`: envía `page`, `per_page`, `search`, `sort`, `direction`, `filtros`.
- `usePaginacionRtk`: integración con RTK Query.
- `utils/tabla.ts`: helpers de orden/filtro.
- `@types/tablaTypes.ts`.
- `@types/paginacionTypes.ts`.

## Controles a actualizar

Administrador:

- `DepartamentoControl.tsx`.
- `EmpleadosControl.tsx`.
- `RolesControl.tsx`.
- `UbicacionControl.tsx`.
- `UsuariosControl.tsx`.

Almacén:

- `TablaActivosFijos.tsx`.
- `FacturasControl.tsx`.
- `MovimientoIndividual.tsx`.
- `ProveedorControl.tsx`.

## Reglas

- No romper formularios modales.
- No romper acciones de eliminar.
- No romper la cuota demo.
- No cambiar el layout general.
- Mantener estilos existentes.
- Reutilizar `Paginacion.tsx` si el main lo conserva.
- No agregar filtros de Helpdesk.

## Validación

```sh
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Manual:

- Ordenar cada tabla.
- Filtrar por cada columna habilitada.
- Buscar.
- Paginar.
- Cambiar entre páginas con filtros activos.
- Crear/editar/eliminar.
