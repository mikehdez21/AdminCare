# Aceptación

- `pdo_sqlite` se instala antes del bootstrap SQLite y de Composer.
- `database/database.sqlite` existe cuando Composer dispara `php artisan package:discover`.
- El Dockerfile contiene una sola creación explícita del archivo en build y conserva la comprobación de `pdo_sqlite`.
- La etapa frontend, `render-release.sh` y `render-start.sh` no se modifican ni pierden su comportamiento.
- `git diff --check` pasa y no se ejecutan servidores ni `php.exe`.
