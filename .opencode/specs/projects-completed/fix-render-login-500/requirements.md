# Requisitos

- El login no debe escribir `ultimo_acceso`, porque la migración vigente de
  `tableUsuarios` no crea esa columna.
- Las excepciones del login deben capturarse como `Throwable`, registrarse con
  `error_id`, clase, código y contexto mínimo, sin credenciales, cookies,
  tokens ni el request completo.
- La API debe conservar respuestas JSON sin stack trace ni secretos.
- Render debe enviar los logs a `stderr` y reconocer su dominio como stateful
  para Sanctum, sin perder los valores locales por fallback.
- La relación opcional con departamento debe producir `No asignado` cuando no
  exista relación o departamento.
- Las rutas API deben continuar sin el prefijo eliminado `HSS1`.
