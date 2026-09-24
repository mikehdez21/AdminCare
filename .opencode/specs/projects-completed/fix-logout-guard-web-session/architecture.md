# Architecture — Logout con guard web explícito

## Diagnóstico (validado con log de Rend el 2026-09-24)
- Request `POST /api/auth/logout` → middleware `auth:sanctum` → `Authenticate::authenticate()`
  hace `Auth::shouldUse('sanctum')`, cambiando el guard por defecto durante la request.
- `Auth::logout()` = `Auth::guard()` (default = sanctum = RequestGuard) → `__call('logout')` no
  existe → `BadMethodCallException`.

## Capas afectadas
Únicamente backend, un archivo: `app/Http/Controllers/AuthController.php`.

### Cambios
1. `logout()` (línea ~222):
   - `Auth::logout()` → `Auth::guard('web')->logout()`.
   - Opcional recomendado: `if (!Auth::guard('web')->check())` para el guard de sesión.
   - Mantener `session()->invalidate()` + `session()->regenerateToken()`.
2. `logoutInactive()` (línea ~275):
   - `Auth::logout()` → `Auth::guard('web')->logout()`.
   - Mantener invalidación y regeneración de sesión.

## Por qué `Auth::guard('web')` es correcto aquí
- `login()` autentica contra el guard `web` (SessionGuard) y guarda `session(['user_id' => ...])`.
- La sesión a invalidar es la sesión web (cookie Laravel + driver file en Render).
- `RequestGuard`/Sanctum es solo para validação token/stateful y no gestiona la sesión de logout.

## Flujo esperado tras el fix
- 200 `{success:true, message:'Sesión cerrada exitosamente.'}` y sesión/anidad CSRF invalidadas.
- Fallo de cualquier operación → catch QueryException/Throwable con `error_id` (sin cambios).