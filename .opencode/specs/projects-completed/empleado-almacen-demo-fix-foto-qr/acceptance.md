# Acceptance — Criterios que el usuario confirmará

## Foto de empleado
- [ ] En el módulo Empleados, click en el icono de foto muestra la imagen
      (`defaultProfile.png` real o la foto del empleado) sin peticiones colgadas en Network.
- [ ] No hay reintentos infinitos: el fallback usa una URL que existe.

## Empleado de Almacén (demo)
- [ ] Al ejecutar el seeder existe un empleado del departamento Almacén y un usuario
      `DEMOALMACEN` con credenciales documentadas/finales.
- [ ] El rol `Almacen` tiene los 9 módulos de almacén con sus niveles de acción
      `.lectura`, `.escritura` y `.control` (36 permisos) y NO tiene permisos de admin.
- [ ] Al iniciar sesión con `DEMOALMACEN`, el usuario ve SOLO:
      - Sidebar Menu Almacenes
      - Sidebar Submenu Almacenes Almacengeneral
      - Almacengeneral Navbar Inicio/Facturas/Activos/Movimientosactivos/Etiquetas/Proveedores/Parametros
- [ ] NO ve menús de Admin ni tiene permisos de administración.
- [ ] El seeder es idempotente (no duplica registros al re-correr).

## QR público
- [ ] `ActivoQRPublic` ya no muestra la sección "Detalles Adicionales".
- [ ] Compila (tsc) y sin regresiones visibles en el QR público.

## Calidad
- [ ] `git diff --check` limpio.
- [ ] `pnpm exec tsc --noEmit` pasa (frontend).
- [ ] No se modifican: esquema SQLite, autenticación, CSRF, rutas, middleware.
- [ ] No se introducen secretos.

## Confirmación final
- [ ] El usuario confirma la validación antes de archivar la spec en `projects-completed`.