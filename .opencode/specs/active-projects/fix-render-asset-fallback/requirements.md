# Requisitos

- Las solicitudes de rutas frontend deben continuar devolviendo
  `welcome.blade.php` mediante el catch-all existente.
- El catch-all no debe capturar las rutas de primer nivel `api`, `HSS1` ni
  `build`, incluyendo sus subrutas.
- Un asset inexistente bajo `/build/assets/` debe terminar en una respuesta 404,
  no en HTML de la aplicación con MIME `text/html`.
- La corrección no debe cambiar MIME headers manualmente ni alterar las rutas
  frontend o los aliases legacy existentes.
- La especificación permanece activa hasta la validación del cambio.
