# Tasks — Implementación ordenada

> Verificación estática/sin servidores; `php.exe` prohibido para agentes.

## T1. Backend — `AuthController@logout` (backend-agent)
- Reorganizar `logout()`:
  - Mantener `Auth::check()` guard al inicio.
  - `Auth::logout()`, `session()->invalidate()`, `session()->regenerateToken()`.
  - Cambiar el `catch (\Exception $e)` de la parte de sesión a
    `catch (\Throwable $e)` + `report($e)` + logging con `error_id` (reutilizar patrón de
    `logLoginFailure` o crear `logLogoutFailure`), y devolver 500 JSON con
    `{ success:false, message: 'Error interno del servidor...', error_id }`.
  - Mantener el catch de `QueryException` para mensaje de BD.
- Verificar/decidir sobre el doble middleware de sesión en `bootstrap/app.php`
  (`EnsureFrontendRequestsAreStateful` de Sanctum ya trae StartSession/EncryptCookies y
  además `$middleware->api()` los agrega). Evaluar si eliminar la duplicación es seguro:
  - Inspeccionar `routes/api.php`, consumidores, y qué esperan.
  - Solo aplicar el cambio si puedes demostrar que no rompe el flujo de sesión/CSRF; si hay
    duda razonable, NO modificar el middleware y documentar la recomendación en el reporte.
- NO ejecutar php.exe/artisan (política). Verificación estática + `git diff --check`.

## T2. Frontend — `LoginFormInputs.tsx` (frontend-agent)
- Hacer visible el mensaje de login exitoso (delay antes de navegar o SweetAlert),
  preservando la rama de fallo. Ver `frontend.md`.

## T3. Frontend — `authReducer.ts` (frontend-agent)
- `logout.fulfilled`: no limpiar auth cuando `success === false`; mantener el estado.
  Ver `frontend.md`.

## T4. Frontend — `variableApi.ts` (frontend-agent)
- Añadir `timeout: 30000` a la instancia axios. No tocar interceptores.

## T5. Verificación de tipos (frontend-agent)
- `pnpm exec tsc --noEmit` desde `frontend/`; `git diff --check`.

## T6. Revisión (reviewer-agent)
- Revisar diff completo, coherencia backend/frontend, y que el flujo de logout fallido ya no
  desloguea de forma incoherente.
- `git diff --check`.

## T7. Validación con el usuario
- Confirmar contra `acceptance.md`; ejecutar/confirmar logs de Render (error_id) para
  verificar la causa exacta del 500 de logout; archivar la spec tras confirmación.