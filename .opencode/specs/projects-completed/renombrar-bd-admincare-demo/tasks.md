# Tareas — Renombrar BD demo a `admincare-demo.db`

1. **Renombrar/eliminar archivos**
   - `database/database.sqlite` → `database/admincare-demo.db` (con `Move-Item`, conservando datos).
   - Eliminar `database/review.sqlite`.

2. **Configuración Laravel**
   - `.env` (local): `DB_DATABASE=database/admincare-demo.db`.
   - `.env.example`: `DB_DATABASE=database/admincare-demo.db`.
   - `config/database.php:37`: `database_path('admincare-demo.db')`.

3. **Docker / Render / scripts**
   - `Dockerfile:20`: `touch database/admincare-demo.db`.
   - `render.yaml:26`: `value: database/admincare-demo.db`.
   - `scripts/render-demo-reset.sh:9,16`: literal `database/admincare-demo.db`.
   - `scripts/ensure-sqlite.php:6`: `'admincare-demo.db'`.

4. **Gitignore**
   - `.gitignore`: añadir `/database/*.db` y `/*.db` (manteniendo las líneas `.sqlite`).
   - `database/.gitignore`: añadir `*.db`.

5. **Documentación operativa**
   - `README.md:46,72,87`: `database/database.sqlite` → `database/admincare-demo.db`.

6. **Verificación**
   - `grep database.sqlite` → solo specs históricas en projects-completed.
   - `git status`: no debe trackearse la BD.
   - `git diff --check`.