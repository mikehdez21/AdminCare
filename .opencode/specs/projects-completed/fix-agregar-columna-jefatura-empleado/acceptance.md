# Acceptance

El usuario confirmará que el trabajo está completo cuando:

- [ ] La migración `020_BD_principal_Empleados_add_jefatura_empleado.php` existe en
      `database/migrations/SQLITE/` y añade `jefatura_empleado` (boolean, default
      false) de forma idempotente.
- [ ] No se modificaron modelo, controlador, rutas, API ni frontend.
- [ ] Tras `php artisan migrate` (o `migrate:fresh --seed` en la demo), la BD local
      `database/admincare-demo.db` tiene la columna `jefatura_empleado`.
- [ ] En Render, la demo reconstruida no vuelve a lanzar
      `table tableEmpleados has no column named jefatura_empleado`.
- [ ] El alta y la edición de un empleado (incluido el campo "¿Es jefatura?") se
      guardan y muestran correctamente.
- [ ] Verificaciones estáticas ejecutadas por los agentes: `git diff --check`.

Nota: la ejecución de `php artisan migrate` y las pruebas de UI quedan del lado del
usuario por la política de `php.exe` de AGENTS.md; los agentes reportan qué se pudo
verificar y qué no.