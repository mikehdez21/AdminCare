# Base de datos

- La base de Render es `database/database.sqlite` sobre el filesystem estándar efímero de Render.
- El `touch` de release y start solo garantiza que exista el archivo para PDO; no proporciona persistencia.
- `migrate:fresh` elimina las tablas existentes, ejecuta todas las migraciones y, con `--seed`, llama a `DatabaseSeeder`/`DemoSeeder`.
- Por diseño, cualquier escritura de la demo se pierde en cada release y el dataset queda determinado por las migraciones y seeders versionados.
- Un restart sin un nuevo release no vuelve a ejecutar el comando de release; además, el filesystem efímero puede perderse durante un restart.
- No se añade disco persistente ni se modifica el comportamiento de bases no SQLite/no demo.
