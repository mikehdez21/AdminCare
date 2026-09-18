# Requisitos

- Laravel debe reconocer `X-Forwarded-Proto: https` cuando AdminCare recibe
  tráfico HTTPS a través del proxy de Render.
- La configuración debe usar el patrón `trustProxies` de Laravel 11 y no
  modificar Vite ni el manifest.
- Las solicitudes locales directas no deben confiar en headers reenviados por
  el cliente.
- Render debe conservar una `APP_URL` pública con esquema `https`.
- La especificación permanece activa hasta la revisión del cambio.
