# Criterios de aceptación

- [ ] En Render, una petición HTTPS con `X-Forwarded-Proto: https` hace que
  `request()->isSecure()` sea verdadera y que los assets generados usen
  `https://`.
- [x] La solución usa `->trustProxies(...)`, compatible con Laravel 11.9+.
- [x] El arranque local no depende de `app()->environment()` ni del binding
  `env` durante el bootstrap.
- [x] `render.yaml` configura `APP_URL` con esquema HTTPS.
- [x] `git diff --check` termina correctamente.
- [ ] La revisión del cambio confirma que no hubo modificaciones a Vite ni al
  manifest.
