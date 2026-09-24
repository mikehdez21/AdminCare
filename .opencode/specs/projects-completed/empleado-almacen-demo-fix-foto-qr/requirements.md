# Requirements — Empleado demo de Almacén + fix foto empleado + limpieza QR

## Frentes
1. **Validar y conservar la modificación manual de `frontend/src/js/pages/ActivoQRPublic.tsx`**:
   el usuario quitó la sección "Detalles Adicionales" (bloque `knownAssetFields`/`additionalFields`
   y la sección de costo/fecha/lote/observaciones) y el import `formatMexicanCurrency` sin uso.
   Objetivo: mantener el cambio limpio y verificar que compile (tsc/build), sin re-introducir la sección.

2. **Bug: "Ver foto" de Empleados se queda cargando infinitamente en Network.**
   - Síntoma: módulo Empleados (EmpleadosControl), click en icono de foto
     (`<FaImagePortrait id='imageIcon' onClick={...} />`, EmpleadosControl.tsx:266) → modal
     `ShowPhotoEmpleado` → `<img>` que nunca termina de cargar.
   - Causa raíz confirmada por exploración:
     - `ShowPhotoEmpleado.tsx:19` usa `defaultImage = '/storage/fotosEmpleados/defaultProfile.png'`.
     - Ese asset **no existe**: `storage/app/public/fotosEmpleados/` no tiene archivos, no hay
       symlink `public/storage` (Dockerfile/scripts no ejecutan `storage:link`), y
       `routes/web.php:14-16` (catch-all) responde **HTML 200** en vez de imagen.
     - `EmpleadoController.php:50-52` devuelve `asset('storage/fotosEmpleados/defaultProfile.png')`
       cuando `foto_empleado` es null (caso demo).
     - `ShowPhotoEmpleado.tsx:42-45` en `onError` reasigna `src` a la misma URL fallida → bucle
       infinito de reintentos; con `php artisan serve` single-threaded (render-start.sh:7) las
       peticiones de imágenes se encolan y quedan "pending".
   - Fix: usar el asset real `img/profile_users/defaultProfile.png` (sí existe en
     `frontend/public/img/profile_users/defaultProfile.png` y se copia en el build), tanto en el
     backend (fallback) como en el frontend (`defaultImage`), y evitar que `onError` reintente la
     misma URL.

3. **Seeder: agregar un empleado del departamento Almacén con permisos SOLO de almacén (nada de admin).**
   - Permisos solicitados (textos de UI → nombre de permiso):
     - Sidebar Menu Almacenes → `sidebar_menu_almacenes`
     - Sidebar Submenu Almacenes Almacengeneral → `sidebar_submenu_almacenes_almacengeneral`
     - Almacengeneral Navbar Inicio → `almacengeneral_navbar_inicio`
     - Almacengeneral Navbar Facturas → `almacengeneral_navbar_facturas`
     - Almacengeneral Navbar Activos → `almacengeneral_navbar_activos`
     - Almacengeneral Navbar Movimientosactivos → `almacengeneral_navbar_movimientosactivos`
     - Almacengeneral Navbar Etiquetas → `almacengeneral_navbar_etiquetas`
     - Almacengeneral Navbar Proveedores → `almacengeneral_navbar_proveedores`
     - Almacengeneral Navbar Parametros → `almacengeneral_navbar_parametros`
   - **Niveles de acción:** además de los 9 permisos base, asignar las variantes
     `.lectura`, `.escritura` y `.control` a cada uno de esos módulos (convención del proyecto,
     ver `table_PermissionsSeeder.php:57-69`, `permissions.ts` y `RolesController::expandirPermisosConBase`).
     Total: 9 módulos × (base + 3 variantes) = 36 permisos. Sin permisos de Admin.
   - Debe crearse en `DemoSeeder` (es el único que corre vía `DatabaseSeeder`): empleado,
     usuario demo de almacén y rol con esos permisos (o asignación directa), sin permisos de Admin.
   - **Credenciales finales (editadas por el usuario en el working tree):**
     - Admin: `DEMOADMIN` / `demoadmin`
     - Almacén: `DEMOALMACEN` / `demoalmacen` (alineado con el placeholder del login)

## No objetivos
- No cambiar autenticación, CSRF, rutas, middleware ni esquema.
- No re-introducir la sección eliminada del QR público.
- No dar permisos de admin al usuario demo de almacén. La asignación de lectura/escritura/control
  es exclusivamente sobre los módulos de Almacén, evaluada contra las rutas autorizadas.