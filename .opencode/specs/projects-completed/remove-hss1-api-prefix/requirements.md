# Requisitos

- Eliminar `HSS1` de todas las rutas API de AdminCare.
- Publicar los mismos endpoints bajo `/api/...`, conservando método HTTP,
  middleware, permisos, throttle, controladores y respuestas.
- No registrar aliases `/api/HSS1/...`.
- Mantener la ruta web pública `/activosfijos/qraf/{codigoQR}`.
- Mantener intactos el controller, la sesión, CSRF y la respuesta de
  `POST /api/auth/login`; el 500 de Render debe confirmarse con sus logs.
