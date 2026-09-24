# Tasks — Implementación

## T1. Backend — `AuthController.php` (backend-agent)
- En `logout()`: reemplazar `Auth::logout()` por `Auth::guard('web')->logout()`.
- Evaluar y (si procede) cambiar `Auth::check()` por `Auth::guard('web')->check()` en `logout()`
  para ser explícito con el guard de sesión.
- En `logoutInactive()`: reemplazar `Auth::logout()` por `Auth::guard('web')->logout()`.
- Mantener `session()->invalidate()` y `session()->regenerateToken()`.
- NO cambiar `login()`, `check()`, `permissions()`, `register()`, catchs, helpers de log,
  rutas ni middleware.
- Verificación estática + `git diff --check`; NO ejecutar php.exe/artisan.

## T2. Verificación (backend-agent)
- `git diff --check`.
- Relectura completa del método reescrito (guard `web` explícito, usos de `Auth::guard('web')`
  coherentes).
- Reportar confrontación con el stacktrace de producción (BadMethodCallException en la línea del
  `Auth::logout()`).

## T3. Revisión (reviewer-agent)
- Validar que el fix es coherente con Sanctum/SessionGuard y no altera el resto.
- `git diff --check`.

## T4. Validación con el usuario
- Confirmar contra `acceptance.md` tras desplegar (logout en prod ya no debe arrojar 500;
  idealmente confirmar el nuevo intento de logout en logs).