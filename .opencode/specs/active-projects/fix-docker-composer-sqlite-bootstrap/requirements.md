# Requisitos

- Crear `database/database.sqlite` en la imagen antes de ejecutar `composer install`.
- Mantener la instalación de `pdo_sqlite` antes de ese bootstrap y de Composer.
- Eliminar el `touch` duplicado posterior, conservando la comprobación de la extensión SQLite.
- No introducir secretos ni depender de variables de Render durante el build.
- Mantener intactas las etapas frontend, el release y el arranque runtime.
