# Requirements — Corregir logout 500 en Render y mensajes de login

## Problema (reportado en producción Render)
1. **Logout:** al cerrar sesión, el frontend muestra el Swal
   `Error al cerrar sesión` con `Error interno del servidor. Contacta a Sistemas.`
2. **Login:** no se muestra mensaje de login exitoso; en fallos reales el mensaje SÍ aparece,
   pero si el request se cuelga (sin timeout) tampoco hay feedback.

## Causa raíz (confirmada por exploración exhaustiva)

### Bug 1 — Logout 500
- El texto exacto `Error interno del servidor. Contacta a Sistemas.` (sin `Ref: <uuid>`)
  SOLO lo produce el `catch (\Exception $e)` de `AuthController::logout`
  (`app/Http/Controllers/AuthController.php:238-242`, línea 240), devolviendo 500.
- El `logout()` hace: `Auth::check()`, `Auth::logout()`, `session()->invalidate()`,
  `session()->regenerateToken()`. Las operaciones de sesión son en memoria; la escritura
  real del archivo de sesión ocurre DESPUÉS, en `StartSession::saveSession` (fuera del try),
  que sería capturada por `HandleDatabaseErrors` con `Ref:`. Como el usuario NO ve `Ref:`,
  la excepción es una **no-QueryException dentro del try** — el candidato técnicamente más
  sólido es una `PDOException` cruda de SQLite (conexión/lectura de DB) durante exec.
- Contexto agravante: Render hace `migrate:fresh --seed` en CADA arranque
  (`render-demo-reset.sh:21`, invocado por `render-start.sh`/`render-release.sh`), con
  filesystem efímero y `SESSION_DRIVER=file` (`render.yaml:31-32`). Cualquier request de
  sesión que toque una BD en estado inconsistente puede lanzar `PDOException`.
- **Confirmación obligatoria:** leer los `stderr` de Render (error_id / Ref / clase de
  excepción). Mientras tanto se implementa una corrección defensiva + logging detallado.

### Bug 2 — Mensaje de login no visible
- `frontend/src/js/components/Login/FormLogin/LoginFormInputs.tsx:38-46` (rama de éxito):
  `setLoginMessage(...); setIsSuccess(true); setShowLoginMessage(true); ... setShowLoginMessage(false); setLoginMessage(''); navigate('/app');`
  Con el batching de React 18 todo se aplica en un solo render con los valores finales
  `false`/`''`, y además `navigate('/app')` desmonta la página → **el mensaje de éxito
  nunca se ve**.
- `LoginMessages.tsx` solo muestra si `showMessage && true`; la rama de fallo SÍ muestra
  el mensaje (`LoginFormInputs.tsx:47-53`).
- Adicional: `variableApi.ts` no configura `timeout` en axios → un request colgado
  (cold start de Render free/restart) deja el login sin ningún feedback.

## Objetivos
- Que el logout nunca deje al usuario atrapado: o cierra sesión correctamente, o falla con
  mensaje accionable y sin borrar el estado de forma incoherente.
- Que login muestre mensaje claro de éxito y de fallo (o al menos no se "cuelgue" en silencio).
- Que el manejo de errores del backend registre la causa exacta para confirmar con logs.

## Contrato preservado
- Endpoints `/api/auth/login`, `/api/auth/logout` mantienen su forma de respuesta
  (`{ success, message, ... }`) y códigos HTTP.
- No se cambia autenticación (Sanctum+sessions), permisos, rutas ni CSRF.
- No se cambia la demo SQLite ni el flujo de Render.