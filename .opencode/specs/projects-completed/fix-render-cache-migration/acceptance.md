# Acceptance

- `render.yaml` contiene exactamente `CACHE_STORE=file` y conserva `SESSION_DRIVER=file`.
- `.env.example` y README explican el uso del cache en archivos durante las migraciones SQLite.
- `config/cache.php` confirma `CACHE_STORE`; no se añade `CACHE_DRIVER`.
- `scripts/render-demo-reset.sh` conserva todas sus condiciones de seguridad.
- `git diff --check` termina correctamente.
