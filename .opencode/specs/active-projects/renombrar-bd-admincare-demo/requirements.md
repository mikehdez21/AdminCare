# Requisitos — Renombrar BD demo a `admincare-demo.db`

## Solicitud del usuario
- Eliminar `database/review.sqlite` (archivo sobrante de una verificación anterior).
- El archivo de base de datos que se genera **local** y en **Render** (deploy) debe
  llamarse `admincare-demo.db` (en lugar de `database.sqlite`).

## Alcance
- Renombrar el archivo local `database/database.sqlite` → `database/admincare-demo.db`
  preservando su contenido (la BD demo existente).
- Actualizar todas las referencias a `database/database.sqlite` / `database.sqlite`
  en configuración, scripts, Docker, Render y documentación operativa.
- Ajustar los `.gitignore` para que el nuevo nombre `.db` siga excluido del repo.
- **No** modificar las specs históricas ya archivadas en
  `.opencode/specs/projects-completed/` (documento de registro).

## Archivos afectados (referencias a actualizar y verificar)
1. `database/database.sqlite` → renombrar a `database/admincare-demo.db` (conservar datos).
2. `database/review.sqlite` → eliminar.
3. `.env` local: `DB_DATABASE=database/database.sqlite` → `database/admincare-demo.db`.
4. `.env.example`: idem.
5. `config/database.php:37`: fallback `database_path('database.sqlite')` → `database_path('admincare-demo.db')`.
6. `Dockerfile:20`: `touch database/database.sqlite` → `touch database/admincare-demo.db`.
7. `render.yaml:26`: `value: database/database.sqlite` → `value: database/admincare-demo.db`.
8. `scripts/render-demo-reset.sh:9,16`: idem.
9. `scripts/ensure-sqlite.php:6`: `'database.sqlite'` → `'admincare-demo.db'`.
10. `.gitignore`: añadir cobertura `.db` (`/database/*.db`, `/*.db`).
11. `database/.gitignore`: añadir cobertura `.db` (`*.db`).
12. `README.md:46,72,87`: `database/database.sqlite` → `database/admincare-demo.db`.
13. Verificar que no queden referencias operativas a `database.sqlite`
    (grep final). Las menciones en specs completadas son histórico y se conservan.

## Criterios de aceptación
- No existe `database/review.sqlite`.
- Existe `database/admincare-demo.db` con la BD demo (contenido preservado).
- `DB_DATABASE` (local y Render) apunta a `database/admincare-demo.db`.
- Docker/build, scripts de reset y ensure-sqlite generan/usar el mismo nombre.
- `git status` NO trackea la BD (sigue ignorada).
- `grep database.sqlite` solo retorna las specs históricas en projects-completed.