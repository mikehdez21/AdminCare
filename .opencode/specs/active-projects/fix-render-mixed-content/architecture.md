# Arquitectura

`bootstrap/app.php` configura el middleware global de Laravel 11 mediante
`Middleware::trustProxies(at: '*')`. Render usa direcciones de proxy dinámicas,
por lo que se usa el valor convencional soportado por Laravel. La configuración
no consulta `app()->environment()` durante el bootstrap, cuando el binding
`env` todavía no está disponible. También permite que la aplicación arranque
localmente sin depender de un binding del contenedor todavía no registrado.

La terminación TLS continúa ocurriendo en Render. Una vez que Laravel confía
en el proxy, Symfony Request puede interpretar `X-Forwarded-Proto` y los
helpers `asset()`/`url()` generan URLs HTTPS. `render.yaml` fija además la
URL canónica pública del servicio para generación de URLs desde consola.
