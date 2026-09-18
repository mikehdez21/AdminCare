# Aceptación

- No existe `Route::prefix('HSS1')` en `routes/api.php`.
- Las rutas API canónicas comienzan por `/api/` y no existe alias
  `/api/HSS1/...`.
- Se conservan métodos, middleware, permisos, throttle, controladores y
  envelopes de respuesta.
- `POST /api/auth/login` sigue apuntando a `AuthController@login` y conserva
  sesión/CSRF.
- `/activosfijos/qraf/{codigoQR}` continúa siendo una ruta web pública.
- `git diff --check` pasa y las validaciones estáticas disponibles no requieren
  iniciar servidores ni ejecutar `php.exe`.
