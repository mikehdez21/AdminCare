# API

- Base nueva: `/api`.
- Login: `POST /api/auth/login`, con `AuthController@login`, sesión y CSRF
  existentes.
- El inventario actual contiene **156 acciones de endpoint API**, contando cada
  acción de los `apiResource` (7 por recurso), sin contar la ruta web QR.
- La resolución API QR queda en `/api/activosfijos/qraf/{codigoQR}` y la ruta
  web pública histórica sigue en `/activosfijos/qraf/{codigoQR}`.
- `/api/HSS1/...` deja de existir; no se añade compatibilidad de transición.

El 500 de login no se atribuye a una causa sin evidencia. Debe revisarse el
log de Render para la solicitud exacta, incluyendo el mensaje/stack trace y el
`error_id` si la respuesta lo proporciona.
