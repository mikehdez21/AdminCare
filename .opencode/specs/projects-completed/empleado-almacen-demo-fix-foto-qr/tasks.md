# Tasks — Implementación ordenada

## T1. Backend — Fallback foto + Seeder Almacén (backend-agent)
- En `app/Http/Controllers/AdminControllers/EmpleadoController.php`:
  - `index()` líneas 50-52: fallback de foto a `asset('img/profile_users/defaultProfile.png')`
    cuando `foto_empleado` es null.
  - Evaluar `update()` (~línea 235) con el mismo criterio si procede.
- En `database/seeders/DemoSeeder.php`:
  - Departamento `Almacén` (`firstOrCreate`).
  - Empleado demo de Almacén (foto null).
  - Usuario demo de almacén (`DEMOALMACEN`, credenciales del working tree).
  - Rol `Almacen` con los permisos de almacén que pide el usuario, **incluyendo las variantes
    `.lectura`, `.escritura` y `.control` para cada uno de los 9 módulos** (36 permisos: base +
    3 variantes por módulo). Verifica con las rutas (`routes/api.php`) qué permisos/acciones exige
    el acceso de lectura y navegación de Almacén (sidebar/submenu/navbar); asigna las tres acciones
    a los módulos de Almacén y nada de admin. Las variantes existen en BD vía
    `table_PermissionsSeeder` (llamado antes en el mismo seeder).
  - `assignRole` y manejo de idempotencia (no duplicar al re-correr).
- NO ejecutar php.exe/artisan. Verificar con `git diff --check` y relectura.

## T2. Frontend — ShowPhotoEmpleado fix + limpieza ActivoQRPublic (frontend-agent)
- `ShowPhotoEmpleado.tsx`: defaultImage real + `onError` sin bucle (ver frontend.md).
- `ActivoQRPublic.tsx`: limpiar la línea en blanco con espacios (línea 240); NO re-introducir
  la sección ni el import.
- `tsc --noEmit`, eslint, `git diff --check`.

## T3. Revisión (reviewer-agent)
- Revisar diffs completos, contrato de permisos (rol Almacén sin admin), fallback de foto,
  y que ActivoQRPublic quedó limpio.
- `git diff --check`.

## T4. Validación con el usuario
- Confirmar contra `acceptance.md` (login demo_almacén, foto visible, QR público sin sección
  adicional, build OK). Solo tras confirmación se archiva la spec.