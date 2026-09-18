# Requirements

- `scripts/render-start.sh` must initialize the SQLite demo before Laravel
  starts, including when Render skips `releaseCommand`.
- The destructive reset must only run when `DEMO_MODE=true`,
  `DB_CONNECTION=sqlite`, `DEMO_DATABASE_ALLOW_RESET=true`, and
  `DB_DATABASE=database/database.sqlite`, with `DB_URL` unset or empty.
- A failed protection check must abort without creating or resetting the
  database.
- Every deploy/restart is demo-only: it destroys and regenerates synthetic
  data and must not be used for production.
