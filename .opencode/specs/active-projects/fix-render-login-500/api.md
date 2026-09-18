# API

- `POST /api/auth/login` mantiene los estados 200, 401, 403 y 422 existentes.
- Los fallos inesperados devuelven HTTP 500 con `success: false`, mensaje
  genérico y `error_id`; nunca incluyen stack trace, contraseña, cookies o
  tokens.
- No se reintroducen aliases ni prefijos `HSS1` en las rutas API.
