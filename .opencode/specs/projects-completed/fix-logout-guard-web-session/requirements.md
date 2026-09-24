# Requirements — Fix logout: guard sanctum no implementa logout()

## Problema (log de producción Render confirmado)
```
production.ERROR: Authentication logout failed
{"error_id":"be9b8f8d-8273-482c-bbd3-f14b53bb0f93",
 "exception":"BadMethodCallException","code":"0",
 "path":"api/auth/logout","method":"POST"}
Method Illuminate\Auth\RequestGuard::logout does not exist.
```
Stacktrace: `AuthManager.php(340): Illuminate\Auth\RequestGuard->__call('logout')`
→ `AuthController.php(222): Facade::__callStatic('logout')`.

## Causa raíz (confirmada)
- La ruta `POST /api/auth/logout` está protegida por el middleware `auth:sanctum`.
- Al autenticar, `Illuminate\Auth\Middleware\Authenticate::authenticate()` invoca
  `Auth::shouldUse('sanctum')`, con lo que **el guard por defecto deja de ser `web`
  (SessionGuard) y pasa a ser `sanctum` (RequestGuard)**.
- `Auth::logout()` en el controller resuelve entonces al `RequestGuard`, que NO
  implementa `logout()` → `BadMethodCallException` → el `catch (\Throwable)`
  devuelve 500 con `error_id`.
- Afecta igualmente a `logoutInactive()` que usa el mismo `Auth::logout()`
  (`AuthController.php:275`).
- El `login()` no se ve afectado: es ruta pública (sin `auth:sanctum`), usa el guard
  `web` por defecto con `Auth::attempt()` y guarda `session(['user_id' => ...])`,
  por lo que la sesión web está correctamente autenticada al llegar al logout.

## Solución (patrón canónico de Laravel Sanctum para SPA logout)
- En `AuthController::logout()`: reemplazar `Auth::logout()` por
  `Auth::guard('web')->logout()`.
- En `AuthController::logoutInactive()`: idéntico cambio.
- Mantener `session()->invalidate()` y `session()->regenerateToken()` tras el logout.
- Considerar usar `Auth::guard('web')->check()` en logout para ser explícito con el
  guard de sesión (coherente con lo que se desautentica).

## Objetivos
- Logout exitoso en producción: 200 `{ success: true, message }`.
- Conservar todo el demás comportamiento (manejo de errores con `error_id`, envelope,
  contrato de `/api/auth/logout` y `/api/auth/logout-inactive`).

## Contrato preservado
- Endpoint `POST /api/auth/logout` y `POST /api/auth/logout-inactive` mantienen forma
  y códigos (200 éxito, 401 no autenticado, 500 error con `error_id`).
- No se cambia autenticación (Sanctum+sessions), rutas, CSRF, permisos ni middleware.
- No se modifica frontend ni base de datos.