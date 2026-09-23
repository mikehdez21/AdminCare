# Requisitos — Rol Admin con todos los permisos

## Objetivo
Garantizar que la base de datos (construcción SQLite de la demo y BD existentes)
contenga un único rol **Admin** al que se le hayan otorgado **todos** los
permisos del sistema.

## Historia de usuario
- Como usuario de la demo `demo_admin`, espero que al iniciar sesión el rol
  `Admin` tenga todos los permisos del catálogo de la aplicación, de modo que se
  muestren todas las secciones del sidebar y sea posible realizar todas las
  operaciones autorizadas por permisos.

## Requisitos funcionales
- RF-1: En una construcción nueva (`migrate:fresh --seed`), el seeder debe crear
  el rol `Admin` (guard `web`) con todos los permisos existentes en la tabla
  `permissions`.
- RF-2: El catálogo completo de permisos debe sembrarse (los 21 permisos
  definidos en `database/seeders/table_PermissionsSeeder.php`), no solo el
  subconjunto actualmente presente en `DemoSeeder`.
- RF-3: En una base de datos ya existente, una migración segura e idempotente
  debe asegurar que el rol `Admin` existe y que tiene asignados todos los
  permisos presentes en la tabla `permissions`.
- RF-4: El usuario demo `demo_admin` debe seguir asignado al rol `Admin`.
- RF-5: `table_PermissionsSeeder` debe sembrar, además de cada permiso base, los
  permisos por **acción** `module.lectura`, `module.escritura` y
  `module.control` para cada módulo del catálogo (convención usada por
  `frontend/src/js/utils/permissions.ts` y por la tabla de permisos de la UI
  `TablaPermisosRol.tsx`). Catálogo resultante: 21 base + 63 acciones = 84.

## Requisitos no funcionales
- RNF-1: Idempotencia: re-ejecutar migración y seeders no debe duplicar roles ni
  filas del pivot `role_has_permissions`.
- RNF-2: Seguridad: no crear ni modificar roles distintos de `Admin`; no tocar
  permisos existentes ni tablas de la aplicación.
- RNF-3: Comportamiento en Render: la demo se reconstruye con
  `php artisan migrate:fresh --seed --force --path=database/migrations/SQLITE`;
  el resultado debe incluir el rol Admin con todos los permisos.