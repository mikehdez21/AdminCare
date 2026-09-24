# Architecture — Frente de arreglos login/logout

## Capas afectadas
1. **Backend (Laravel 11):** `app/Http/Controllers/AuthController.php`
   - Reorganizar `logout()` para que la invalidación de sesión sea tolerante y nunca falle
     por una excepción no-QueryException de forma silenciosa:
     - `Auth::logout()` + `session()->invalidate()` + `regenerateToken()` dentro del try.
     - catch `\Throwable` (no solo `\Exception`), con `report($e)` y logging de la clase
       exacta de excepción + `error_id` (patrón ya usado por `login()`).
     - En caso de excepción, devolver un 500 JSON coherente con `error_id` para correlacionar
       con los stderr de Render.
   - Verificar doble aplicación de middleware de sesión en `bootstrap/app.php`:
     Sanctum (`EnsureFrontendRequestsAreStateful`) YA agrega `StartSession`/`EncryptCookies`
     para requests stateful, y además `$middleware->api()` los agrega explícitamente
     (`bootstrap/app.php:40-47`) → posible doble StartSession/EncryptCookies.
     - El backend-agent debe EVALUAR y, si es seguro (validando contra los consumidores
       actuales y sin romper CSRF/sesiones), eliminar la duplicación; o documentar por qué se
       conserva. Este es un cambio delicado: no debe hacerse sin verificación de rutas.
   - `login()` ya maneja `\Throwable` con `error_id`; mantener sin cambios salvo que el
     análisis de middleware lo justifique.

2. **Frontend (React/TS):**
   - `frontend/src/js/components/Login/FormLogin/LoginFormInputs.tsx`:
     - No borrar el mensaje de éxito en el mismo tick: mostrar el mensaje y navegar
       después (p.ej. `setTimeout`/`await` breve) o usar el patrón SweetAlert ya usado en
       logout, para que "Login exitoso" sea visible.
     - Rama de fallo: mantener y asegurar que el mensaje se renderiza (ya funciona).
   - `frontend/src/js/store/authReducer.ts:68-78`:
     - `logout.fulfilled` actualmente borra el auth SIEMPRE (aun con `success:false`),
       contradiciendo el comentario de `LogoutModal.tsx:70-76`. Ajustar para que, si
       `success===false`, NO limpie el estado de autenticación (mantiene la sesión tal como
       documenta el componente).
   - `frontend/src/js/variableApi.ts`:
     - Añadir `timeout` razonable a axios (p.ej. 30s) para que el login/logout nunca
       queden colgados sin feedback.

## Flujo esperado tras el fix
- Logout OK → 200 `success:true` → frontend limpia y redirige a `/login`.
- Logout con error → 500 JSON con `error_id` → Swal claro; si el reducer no limpia auth
  ante fallo, el usuario permanece en la app (no deslogueado incoherentemente).
- Login OK → mensaje "Login exitoso!" visible antes/además de navegar a `/app`.
- Login fallido → mensaje de error visible (ya funcionaba, se preserva).