# Criterios de aceptación — Rol Admin con todos los permisos

- [ ] La BD contiene exactamente el rol `Admin` (guard `web`).
- [ ] El rol `Admin` tiene TODOS los permisos presentes en la tabla
      `permissions` (mínimo los 84 del catálogo: 21 base + 63 de acción,
      incluido `sidebar_menu_helpdesk`).
- [ ] El permiso `sidebar_menu_helpdesk` existe en la tabla `permissions`.
- [ ] Existen permisos de acción `<modulo>.lectura`, `<modulo>.escritura` y
      `<modulo>.control` para cada uno de los 21 módulos (63 en total).
- [ ] El usuario demo `demo_admin` sigue asignado al rol `Admin`.
- [ ] Idempotencia: volver a ejecutar la migración 019 y los seeders no duplica
      roles ni filas en `role_has_permissions`.
- [ ] No se crearon roles distintos de `Admin` ni se modificaron permisos/schema
      de tablas de la aplicación.
- [ ] La construcción desde cero (`migrate:fresh --seed`) produce el mismo
      resultado (rol Admin con todos los permisos).
- [ ] `git diff --check` sin errores.