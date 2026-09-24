# Frontend — Cambios

## 1. `frontend/src/js/pages/ActivoQRPublic.tsx` (VALIDAR, no re-escribir)
- Cambio manual del usuario: eliminó la sección "Detalles Adicionales" (con costo/fecha/lote/
  observaciones y el bloque `knownAssetFields`/`additionalFields`) y el import sin uso
  `formatMexicanCurrency`. Quedó una línea en blanco con espacios en la posición de la sección
  (línea 240) — limpiar tabs/espacios sobrantes sin re-introducir contenido.
- Verificar `tsc --noEmit` y `eslint`.

## 2. `frontend/src/js/components/99_Administrador/Empleados/ShowPhotoEmpleado.tsx` (FIX)
- Cambiar `defaultImage` de `/storage/fotosEmpleados/defaultProfile.png` a
  `/img/profile_users/defaultProfile.png` (asset real del build).
- En `onError` del `<img>`: evita asignar la misma URL si ya se intentó la default; ejemplo:
  ```ts
  onError={(e) => {
    const current = e.currentTarget.src;
    if (!current.endsWith('/img/profile_users/defaultProfile.png')) {
      e.currentTarget.src = '/img/profile_users/defaultProfile.png';
    }
  }}
  ```
- Mantener el resto (modal, títulos, botones) sin cambios.
- Opcional: si `empleadoToShow.foto_empleado` es `null` directamente usar la default sin
  disparar el `onError` (usar la constante en el cálculo inicial, como ya hace).

## 3. Verificaciones
- `pnpm exec tsc --noEmit` desde `frontend/`
- `eslint` sobre los archivos modificados
- `git diff --check`
- NO ejecutar `pnpm dev` ni servidores.