# Frontend — Cambios

## 1. `frontend/src/js/components/Login/FormLogin/LoginFormInputs.tsx`
Bug: el mensaje de login exitoso se setea y se borra en el mismo tick antes de renderizar
(`setShowLoginMessage(true)` luego `setShowLoginMessage(false); setLoginMessage('')` y
`navigate('/app')`). Con React 18 el render único del handler usa los estados finales
(`false`/`''`), así que `LoginMessages` nunca muestra el mensaje.

Fix requerido:
- En la rama de éxito, mostrar el mensaje de forma que sea visible y luego navegar, por
  ejemplo:
  - `setLoginMessage(resultAction.message); setIsSuccess(true); setShowLoginMessage(true);`
  - Navegar después de un pequeño retraso (p.ej. `await new Promise(r => setTimeout(r, 800));`
    o `setTimeout(() => navigate('/app'), 800)`) para que el usuario lea el mensaje.
  - Alternativa aceptable: usar SweetAlert (patrón ya usado en logout) que muestre
    "Login exitoso!" y navegue al confirmar.
- Rama de fallo: mantener el comportamiento actual (ya muestra el mensaje).

## 2. `frontend/src/js/store/authReducer.ts`
Bug: `logout.fulfilled` borra el estado de autenticación SIEMPRE, incluso cuando
`payload.success === false` (líneas ~68-78), contradiciendo el comentario de
`LogoutModal.tsx:70-76` que espera que un logout fallido NO limpie la sesión.

Fix requerido:
- En `logout.fulfilled`, solo limpiar `isAuthenticated/user/role/permissions/departamento`
  cuando `payload.success === true` (o `sessionInvalid === true`). Si es un fallo,
  mantener el estado de autenticación y exponer `error=payload.message`.
- No cambiar el manejo de `logout.pending`.

## 3. `frontend/src/js/variableApi.ts`
Bug: axios no define `timeout` (default 0 = sin límite); un request colgado (cold start de
Render free/restart) deja login/logout sin feedback.

Fix requerido:
- En `axiosInstance = axios.create({...})` añadir un `timeout` razonable (p.ej. 30000 ms).
- No cambiar la lógica CSRF ni los interceptores.

## 4. `LogoutModal.tsx`
- Verificar que con el fix del reducer el flujo sigue correcto: `success` → limpia+redirige
  y recarga; `sessionInvalid` → mismo camino; fallo → Swal de error sin desloguear.

## Verificación
- `pnpm exec tsc --noEmit` desde `frontend/`
- GitHub Actions/CI (si aplica), `git diff --check`.