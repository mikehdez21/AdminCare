# Requisitos

- En cada release de Render, reconstruir desde cero la SQLite demo con `php artisan migrate:fresh --seed --force`.
- Ejecutar el reset únicamente cuando el servicio está configurado como demo, usa SQLite, tiene habilitado explícitamente el reset demo y apunta al archivo SQLite de Render.
- Usar el `DatabaseSeeder` vigente, que incluye `DemoSeeder`, para que el dataset publicado corresponda siempre al código actual.
- Eliminar el flujo condicional `demo:seed-if-empty` del release y no dejar dos mecanismos de seed que puedan contradecirse.
- No introducir reset destructivo genérico para producción, persistent disk ni base externa.
- Documentar la pérdida intencional de cambios demo en cada release, el filesystem efímero de Render y que un restart sin release no ejecuta `releaseCommand`.
