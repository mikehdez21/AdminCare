# Criterios de aceptación

- [ ] En Render, una petición HTTPS con `X-Forwarded-Proto: https` hace que
  `request()->isSecure()` sea verdadera y que los assets generados usen
  `https://`.
- [x] La solución usa `->trustProxies(...)`, compatible con Laravel 11.9+.
- [x] En desarrollo local no se confían proxies ni headers reenviados.
- [x] `render.yaml` configura `APP_URL` con esquema HTTPS.
- [ ] `git diff --check` termina correctamente.
- [ ] La revisión del cambio confirma que no hubo modificaciones a Vite ni al
  manifest.
