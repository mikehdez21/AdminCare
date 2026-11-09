# Requisitos — Tablas y listados

## 1. Objetivo

Mejorar los listados de Administrador y Almacén sin cambiar las rutas ni los permisos existentes.

## 2. Requisitos funcionales

### RF-01 — Listados

Cada entidad debe permitir:

- Ordenar por columnas permitidas.
- Filtrar por columna.
- Búsqueda global.
- Paginación de servidor.
- Conservar filtros al cambiar de página.
- Volver a la página 1 al cambiar búsqueda/orden/filtro.

### RF-02 — Entidades

Administrador:

- Departamentos.
- Empleados.
- Roles.
- Ubicaciones.
- Usuarios.

Almacén:

- Activos Fijos.
- Facturas.
- Movimientos individuales.
- Proveedores.

### RF-03 — Backend

- Portar `Paginable` del main.
- Cada controlador declara:
  - Columnas ordenables.
  - Orden default.
  - Filtros permitidos.
  - Campos de búsqueda.
- `sort`, `direction` y `filtros` se validan contra whitelist.
- Valores inválidos se ignoran, nunca 500.

### RF-04 — Compatibilidad

- Sin `per_page`: respuesta completa como hoy.
- Con `per_page`: `data` + `meta`.
- No cambiar URLs ni métodos.
- No cambiar payloads de creación/edición.
- No romper cuota demo.
- No romper SQLite.

### RF-05 — Frontend

- Componente `TablaEntidades` compartido.
- Encabezados ordenables.
- Filtros por columna.
- Paginación.
- Mantener acciones de crear/editar/eliminar.
- Mantener estilos actuales.

## 3. Requisitos no funcionales

- Sin dependencias nuevas.
- Sin migraciones.
- Sin cambios de permisos.
- Sin Helpdesk.
- La app debe quedar usable después del push.

## 4. Criterios de aceptación

Ver [acceptance.md](acceptance.md).
