# Architecture

`render-demo-reset.sh` owns the guarded `migrate:fresh --seed --force` flow,
including SQLite file preparation, so `render-release.sh` and
`render-start.sh` cannot drift in their safety checks. The start script calls
that flow before `php artisan serve` and preserves Render's `PORT`.

`render-release.sh` remains an optional early initialization path. The start
path is the guarantee for Render services that do not run `releaseCommand`.
