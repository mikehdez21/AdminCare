# Arquitectura

- `render.yaml` mantiene un único servicio Docker demo con `DEMO_MODE=true`, `DB_CONNECTION=sqlite`, `DB_DATABASE=database/database.sqlite` y `DEMO_DATABASE_ALLOW_RESET=true`.
- `scripts/render-release.sh` prepara el directorio y archivo SQLite, valida esas cuatro condiciones y ejecuta el único reset/seed del release.
- `scripts/render-start.sh` solo prepara el archivo y arranca Laravel; no migra ni siembra. Un restart no equivale a un release.
- `routes/console.php` conserva comandos no relacionados, pero no registra un comando de seed condicional usado por Render.
- La protección pertenece al script de release y a la configuración explícita del servicio demo; `APP_ENV=production` no convierte este flujo en un reset aplicable a una base productiva porque requiere las banderas demo y la ruta SQLite exacta.
