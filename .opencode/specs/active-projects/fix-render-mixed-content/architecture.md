# Arquitectura

`bootstrap/app.php` configura el middleware global de Laravel 11 mediante
`Middleware::trustProxies`. Render usa direcciones de proxy dinámicas, por lo
que en producción se usa el valor convencional `'*'`; la confianza está
limitada al entorno `production`, que es el entorno del servicio Render. En
entornos locales se pasa una lista vacía y no se aceptan headers reenviados de
clientes directos.

La terminación TLS continúa ocurriendo en Render. Una vez que Laravel confía
en el proxy, Symfony Request puede interpretar `X-Forwarded-Proto` y los
helpers `asset()`/`url()` generan URLs HTTPS. `render.yaml` fija además la
URL canónica pública del servicio para generación de URLs desde consola.
