# Aceptación

- [ ] `render-release.sh` falla antes del reset si `DEMO_MODE`, `DB_CONNECTION`, `DEMO_DATABASE_ALLOW_RESET` o `DB_DATABASE` no tienen los valores demo esperados.
- [ ] Con la configuración de `render.yaml`, el release ejecuta exactamente `php artisan migrate:fresh --seed --force` después de preparar el archivo SQLite.
- [ ] No queda una llamada a `demo:seed-if-empty` en el flujo de Render ni un comando condicional equivalente en `routes/console.php`.
- [ ] `render-start.sh` no ejecuta migraciones ni seeders.
- [ ] README y spec advierten que cada release destruye cambios demo, que el filesystem es efímero y que un restart sin release no ejecuta `releaseCommand`.
- [ ] No se añaden persistent disk ni base externa y no se cambia el reset manual protegido fuera de su comentario descriptivo.
- [ ] `git diff --check` no reporta errores.
