# Frontend — Cambios funcionales mínimos (observación del reviewer)

## Estado previo (controvertido y verificado)
- `frontend/src/js/@types/mainTypes.ts`: la interfaz `Empleados` ya declara
  `jefatura_empleado: boolean` y **no** declara `email_empleado` / `firma_movimientos` /
  `telefono_empleado` como requeridos. No debe alterarse.
- `frontend/src/js/@types/AlmacenGeneralTypes/depreciacionTypes.ts`: `DepreciacionRecord`
  ya espera `id_depreciacionaf: number` e `id_metodo_depreciacionaf?`. Correcto.
- `ListActivosDepreciacion.tsx` renderiza `activoHistorico.id_depreciacionaf` (líneas 656-657).
  Correcto tras la alineación de la PK SQLite.

## Bug funcional detectado en el review (a corregir)
- `frontend/src/js/components/99_Administrador/Empleados/EditEmpleado.tsx`:
  - En el `useEffect` de carga (líneas 82-113) NUNCA se sincroniza `jefaturaEmpleado` con
    `empleadoToEdit.jefatura_empleado`. El estado se inicializa en `false` (línea 30).
  - Consecuencia: al editar un empleado que es jefatura, el checkbox queda desmarcado y el
    formulario envía `jefatura_empleado = false` (línea 146), perdiendo el valor.
  - Fix: en la rama `if (empleadoToEdit)` del `useEffect` de carga agregar
    `setJefaturaEmpleado(empleadoToEdit.jefatura_empleado ?? false);`; en la rama `else`
    (reset) agregar `setJefaturaEmpleado(false);`.

## Descripción
- Único cambio de código frontend requerido en este proyecto: el fix de sincronización de
  `jefaturaEmpleado` en `EditEmpleado.tsx`.
- Verificación mínima (estáticas, sin servidores):
  - `pnpm exec tsc --noEmit` desde `frontend/`
  - `pnpm run build` (si es viable sin levantar servidor local).

## Riesgo
- Render compila sobre Linux; imports sensibles a mayúsculas. No se toca ningún import nuevo:
  sin riesgo adicional.