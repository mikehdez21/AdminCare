# Criterios de aceptación — Renombrar BD demo a `admincare-demo.db`

- [ ] `database/review.sqlite` eliminado.
- [ ] Existe `database/admincare-demo.db` con el esquema/datos de la demo (contenido preservado).
- [ ] `DB_DATABASE` (`.env` local y `.env.example`) = `database/admincare-demo.db`.
- [ ] `config/database.php`, `Dockerfile`, `render.yaml`, `scripts/render-demo-reset.sh`
      y `scripts/ensure-sqlite.php` usan `admincare-demo.db` (sin referencias a `database.sqlite`).
- [ ] `.gitignore` y `database/.gitignore` excluyen `*.db`.
- [ ] `README.md` menciona `database/admincare-demo.db`.
- [ ] `grep database.sqlite` solo aparece en `.opencode/specs/projects-completed/**` (histórico).
- [ ] `git status` no muestra la BD como candidata a commit.
- [ ] `git diff --check` sin errores de esta tarea.