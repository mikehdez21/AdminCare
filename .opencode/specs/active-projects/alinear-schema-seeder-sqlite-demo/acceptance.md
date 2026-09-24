# Acceptance — Criterios que el usuario confirmará

## Funcional (demo SQLite)
- [ ] Crear un empleado desde `Empleados/Add` ya NO falla por `email_empleado`/`firma_movimientos`
      NOT NULL (verificación del usuario; requiere recrear/BD corregida).
- [ ] Editar un empleado desde `Empleados/Edit` funciona igual que antes.
- [ ] La lista `EmpleadosControl.tsx` sigue mostrando correctamente `jefatura_empleado` y los
      campos habituales.
- [ ] Al editar un empleado que es jefatura, el checkbox `jefatura_empleado` aparece marcado y
      el formulario conserva `true` (fix EditEmpleado.tsx).
- [ ] En `Activos Fijos → Depreciación`, el histórico muestra `id_depreciacionaf` con valor
      (antes `undefined` por mismatch de PK SQLite).
- [ ] El `DemoSeeder` se completa sin errores al recrear la BD demo
      (`migrate:fresh --seed --force --path=database/migrations/SQLITE`).

## Esquema SQLite (verificación por el usuario o revisión)
- [ ] `tableEmpleados.email_empleado` y `firma_movimientos` son nullable; `email_empleado`
      conserva `unique()`.
- [ ] `tableAF_DepreciacionActivo` usa PK `id_depreciacionaf`.
- [ ] `tableAF_DepreciacionActivo` declara `id_estatus_depreciacion` y
      `fecha_calculo_depreciacion` NOT NULL y el unique `(id_activo_fijo, anio_depreciacionaf)`
      (alineado con 041).
- [ ] `Empleado::$fillable` incluye `email_empleado`, `telefono_empleado`, `firma_movimientos`.
- [ ] `Depreciacion::$fillable` y `MovimientosActivos::$fillable` no contienen campos fantasma
      (`metodo_depreciacionaf`, `id_usuario`).

## Calidad / repo
- [ ] `git diff --check` limpio.
- [ ] `pnpm exec tsc --noEmit` pasa (frontend sin cambios funcionales).
- [ ] No hay cambios en autenticación, permisos, rutas, sesiones ni migraciones Postgres.
- [ ] No se introducen secretos ni datos reales.

## Despliegue Render (acción del usuario)
- [ ] En el dashboard de Render (o re-aplicando el blueprint), las env vars cumplen el guard:
      `DEMO_MODE=true`, `DB_CONNECTION=sqlite`, `DEMO_DATABASE_ALLOW_RESET=true`,
      `DB_DATABASE=database/admincare-demo.db`, y `DB_URL` vacío/ausente.
- [ ] El deploy deja de fallar con "Refusing Render demo reset".

## Confirmación final
- [ ] El usuario confirma explícitamente que el trabajo está completo y correcto antes de
      archivar la spec en `projects-completed/`.