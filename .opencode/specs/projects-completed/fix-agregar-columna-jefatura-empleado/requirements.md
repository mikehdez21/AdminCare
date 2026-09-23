# Fix: agregar columna `jefatura_empleado` a `tableEmpleados`

## Objetivo

Corregir el error de producción:

```
SQLSTATE[HY000]: General error: 1 table tableEmpleados has no column named jefatura_empleado
(Connection: sqlite, SQL: insert into "tableEmpleados" (...) values (...))
```

El modelo `App\Models\Empleado`, el controlador `EmpleadoController` y el frontend
trabajan con `jefatura_empleado`, pero ninguna migración del esquema SQLite crea esa
columna. La BD local y la demo de Render (que se recrea con `migrate:fresh`) carecen
de ella, por lo que cualquier alta/edición de empleado falla.

## Criterio de aceptación (contrato preservado)

- El alta y la edición de un empleado deben seguir enviando y recibiendo
  `jefatura_empleado` como booleano (sin cambios de API ni frontend).
- El esquema SQLite de `tableEmpleados` debe incluir `jefatura_empleado` tras migrar.
- La migración debe ser segura e idempotente para bases existentes (incluida la BD
  demo local y la de Render) y no romper `migrate:fresh` + seed.
- Verificación no ejecutable por los agentes (política `php.exe`): aplicar la
  migración y comprobar el alta/edición corriendo la app queda para el usuario.

## Fuera de alcance

- No se tocan controladores, modelo, rutas, API ni frontend.
- No se resuelve aquí el commit pendiente del rename de BD
  (`renombrar-bd-admincare-demo`); es un trabajo separado ya implementado.