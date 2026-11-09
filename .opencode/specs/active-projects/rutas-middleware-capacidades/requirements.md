# Requisitos — Rutas y middleware

## 1. Objetivo

Proteger los endpoints existentes con las capacidades nuevas y alinear los menús, sin cambiar contratos ni controladores.

## 2. Requisitos funcionales

### RF-01 — Middleware de rutas

- Usar `App\Support\Permisos::middleware()`.
- Separar lectura, escritura y eliminar.
- Mantener `auth:sanctum` y la sesión.
- No cambiar rutas ni métodos.

### RF-02 — Mapeo

| Módulo | Lectura | Escritura | Eliminar |
|---|---|---|---|
| Almacén | `almacen.lectura` | `almacen.escritura` | `almacen.eliminar` |
| Depreciación | `contabilidad.depreciacion.lectura` | `.escritura` | — |
| Métodos | `contabilidad.metodos.lectura` | `.escritura` | `.eliminar` |
| Auditoría | `contabilidad.auditoria.lectura` | `.escritura` | `.eliminar` |
| Usuarios | `admin.usuarios.lectura` | `.escritura` | `.eliminar` |
| Empleados | `admin.empleados.lectura` | `.escritura` | `.eliminar` |
| Roles | `admin.roles.lectura` | `.escritura` | `.eliminar` |
| Departamentos | `admin.departamentos.lectura` | `.escritura` | `.eliminar` |
| Ubicaciones | `admin.ubicaciones.lectura` | `.escritura` | `.eliminar` |
| Dashboard | `nav.dashboard.lectura` | — | — |

### RF-03 — Catálogos compartidos

- Selects de otros módulos pueden leer:
  - `catalogos.departamentos.lectura`
  - `catalogos.ubicaciones.lectura`
  - `catalogos.empleados.lectura`
- Se permiten con OR con el permiso de Administración correspondiente.

### RF-04 — Menús

- `Sidebar_OptionsList` usa capacidades.
- Submenús de Almacén, Contabilidad y Administrador usan capacidades.
- No quedan condiciones `sidebar_*`, `almacengeneral_navbar_*` ni `.control`.

### RF-05 — Retiro legacy

- `table_PermissionsSeeder` deja de crear permisos legacy.
- El guardado de roles deja de hacer la unión legacy de Spec 1.
- La base demo se regenera; no se migran permisos legacy.

### RF-06 — Compatibilidad

- No cambian URLs, métodos ni payloads.
- No cambian controladores.
- No se tocan QR público ni impresora.
- No se toca Helpdesk.

## 3. Requisitos no funcionales

- La app debe quedar usable antes del push manual del usuario.
- Un usuario sin permiso recibe 403, no 500.
- Un usuario con permiso legacy ya no depende de él.
- No se agregan dependencias.

## 4. Criterios de aceptación

Ver [acceptance.md](acceptance.md).
