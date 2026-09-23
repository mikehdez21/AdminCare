# Architecture

`config/cache.php` usa `env('CACHE_STORE', 'database')` como store predeterminado.
Por ello, el Blueprint de Render establece `CACHE_STORE=file`; el cache se guarda
en `storage/framework/cache/data` y la migración de permisos no intenta consultar
la tabla SQLite `cache`. El ejemplo de entorno y la documentación reflejan la
misma configuración. `render-demo-reset.sh` mantiene sus guardas de modo demo,
conexión SQLite, ruta exacta, opt-in y ausencia de `DB_URL`.
