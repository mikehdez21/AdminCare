# Base de datos — Renombrar BD demo a `admincare-demo.db`

## Cambio
- `database/database.sqlite` → `database/admincare-demo.db` (renombrar
  preservando el archivo y su esquema/datos actuales).
- `database/review.sqlite` → **eliminar** (sobrante de una verificación previa).
- El archivo sigue siendo ignorado por Git.

## Verificación de datos
- El archivo renombrado debe conservar el tamaño/contenido previo
  (388 KB aprox. con las tablas y el seed actual).
- No se ejecutan migraciones nuevas: solo cambio de nombre de archivo y de
  referencias de configuración.