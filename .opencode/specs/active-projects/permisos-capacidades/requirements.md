# Requisitos — Permisos por capacidad

## 1. Objetivo

Adoptar el catálogo de permisos del main para los módulos existentes, sin cambiar el comportamiento de rutas ni menús.

## 2. Requisitos funcionales

### RF-01 — Catálogo

- Crear `config/permisos.php` con dominios:
  - `nav`
  - `almacen`
  - `contabilidad`
  - `admin`
  - `catalogos`
- Recursos y acciones:
  - `nav.dashboard.lectura`
  - `almacen.lectura`, `almacen.escritura`, `almacen.eliminar`
  - `contabilidad.depreciacion.lectura`, `.escritura`
  - `contabilidad.metodos.lectura`, `.escritura`, `.eliminar`
  - `contabilidad.auditoria.lectura`, `.escritura`, `.eliminar`
  - `admin.usuarios.*`
  - `admin.empleados.*`
  - `admin.roles.*`
  - `admin.departamentos.*`
  - `admin.ubicaciones.*`
  - `catalogos.departamentos.lectura`
  - `catalogos.ubicaciones.lectura`
  - `catalogos.empleados.lectura`
- No incluir `helpdesk.*` todavía.

### RF-02 — Helper de permisos

- `App\Support\Permisos` debe:
  - Leer el catálogo.
  - Expandir acciones con la cadena lectura → escritura → eliminar.
  - Exponer `tiene()` y `middleware()`.
  - Exponer metadatos para la UI de roles.

### RF-03 — Seeder aditivo

- `table_PermissionsSeeder` sigue creando los permisos legacy actuales.
- Además crea los permisos del catálogo nuevo.
- No borra permisos.
- No cambia asignaciones existentes de forma destructiva.

### RF-04 — Roles demo

- `Admin` conserva todos los permisos (legacy + nuevos).
- `Almacen` conserva los permisos legacy y recibe los nuevos de Almacén.
- Los roles existentes no pierden acceso.

### RF-05 — UI de roles

- La pantalla de Roles muestra el catálogo nuevo agrupado por dominio.
- Muestra etiqueta, descripción y acciones.
- Al guardar, **preserva los permisos legacy** que el rol ya tenía.
- No permite que un guardado de la UI nueva rompa las rutas antiguas.
- Muestra una nota de que los permisos legacy se retiran en la siguiente fase.

### RF-06 — Compatibilidad

- `routes/api.php` no cambia.
- Los menús actuales no cambian.
- Login y sesión no cambian.
- No se agregan `alcances` al payload.

## 3. Requisitos no funcionales

- Sin migraciones de base de datos.
- Sin secretos.
- Sin cambios en producción.
- Compatible con SQLite y PostgreSQL.
- Sin dependencias nuevas.
- La app debe quedar usable antes del push manual del usuario.

## 4. Casos borde

- Un rol con permisos legacy que no aparecen en el catálogo nuevo: se conservan al guardar.
- Un rol sin permisos nuevos: puede seguir usando la app por los legacy.
- Admin: siempre todos.
- Permiso nuevo sin endpoint todavía: se siembra, pero no se usa en rutas hasta Spec 2.

## 5. Criterios de aceptación

Ver [acceptance.md](acceptance.md).
