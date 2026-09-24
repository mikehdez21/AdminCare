# Architecture

## Capas afectadas

### 1. Frontend — ActivoQRPublic (ya modificado por el usuario)
- `frontend/src/js/pages/ActivoQRPublic.tsx`: se eliminó la sección "Detalles Adicionales",
  `knownAssetFields` y el import `formatMexicanCurrency`. Mantener as-is; solo validar
  (tsc/eslint). No re-introducir código.

### 2. Frontend — ShowPhotoEmpleado (bug de foto infinito)
- `frontend/src/js/components/99_Administrador/Empleados/ShowPhotoEmpleado.tsx`:
  - Cambiar `defaultImage` de `'/storage/fotosEmpleados/defaultProfile.png'` a
    `'/img/profile_users/defaultProfile.png'` (asset real del build).
  - En `onError`, evitar reintentar la misma URL: si `e.currentTarget.src` ya es la default
    (comparar el path/sufijo), no reasignar (previene bucle infinito). Patrón sugerido:
    solo reasignar si la URL actual NO termina en `defaultProfile.png`.
- Modelo de datos: `foto_empleado` es string URL (backend) o `File`/URL local
  (`mainTypes.ts:60`); sin cambios de tipos.

### 3. Backend — EmpleadoController (URL de foto)
- `app/Http/Controllers/AdminControllers/EmpleadoController.php`:
  - En `index()` (líneas 50-52): cuando `foto_empleado` es null (o apunta al default inexistente),
    devolver `asset('img/profile_users/defaultProfile.png')` en lugar de
    `asset('storage/fotosEmpleados/defaultProfile.png')`.
  - Evaluar también el mismo fallback en `update()` (línea ~235) si aplica (cuando no hay foto).
  - NO tocar la lógica de subida (store/update) ni el `Storage::disk('public')`.

### 4. Backend — DemoSeeder (empleado Almacén)
- `database/seeders/DemoSeeder.php`:
  - Añadir un departamento `Almacén` (o reutilizar el existente de `table_DepartamentosSeeder`;
    en DemoSeeder conviene `firstOrCreate` por nombre para no depender del seeder base).
  - Crear empleado de Almacén (nombre demo, `foto_empleado` null para que el fallback real
    lo cubra en UI).
  - Crear usuario demo de almacén (ej. `demo_almacen`, password demo documentada, inactivo/activo
    según demo), con `id_empleado` y `id_departamento` de Almacén.
  - Otorgarle SOLO permisos de almacén:
    - Verificación del backend-agent: qué permisos exigen las rutas de almacén
      (`sidebar_menu_almacenes`, `sidebar_submenu_almacenes_almacengeneral`,
      `almacengeneral_navbar_*`) y sus acciones `.lectura`/`.control` según middleware de rutas.
    - Asignación mínima para navegar + ver su módulo; SIN admin ni acciones de escritura salvo
      las estrictamente necesarias (evaluado con evidencia de `routes/api.php` y los guards).
  - Crear rol dedicado `Almacen` (o `JAlmacenGeneral` si ya encaja) con esos permisos vía
    `Role::firstOrCreate` + `syncPermissions`, y asignarlo al usuario. Documentar decisión.
- Alternativa si el producto ya contempla el rol `JAlmacenGeneral` (table_RolesSeeder): podría
  usarse con `syncPermissions` de almacén — decidir con evidencia y documentar.

## Flujo esperado tras el fix
- Foto: modal muestra `defaultProfile.png` real (o la foto subida) sin peticiones colgadas ni
  reintentos en bucle.
- QR público: sin sección adicional, compila.
- Login `demo_almacen`: entra y ve SOLO el módulo Almacén (sidebar + submenu + navbar de
  AlmacenGeneral), sin accesos de Admin.