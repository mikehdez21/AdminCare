# Requirements

- Render debe definir `CACHE_STORE=file` para la demo SQLite.
- Las migraciones `migrate:fresh --seed` no deben depender de una tabla `cache`.
- Deben conservarse `SESSION_DRIVER=file` y las protecciones del reset destructivo de la demo.
- No se deben introducir `CACHE_DRIVER` ni cambios innecesarios en las migraciones.
