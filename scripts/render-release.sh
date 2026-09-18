#!/bin/sh
set -eu

mkdir -p database
touch database/database.sqlite

# This release command is intentionally destructive, but only for the Render
# demo. Keep the checks here so a copied script cannot reset a non-demo DB.
if [ "${DEMO_MODE:-}" != "true" ] \
    || [ "${DB_CONNECTION:-}" != "sqlite" ] \
    || [ "${DEMO_DATABASE_ALLOW_RESET:-}" != "true" ] \
    || [ "${DB_DATABASE:-}" != "database/database.sqlite" ]; then
    echo "Refusing Render demo reset: DEMO_MODE=true, SQLite, the demo reset opt-in, and the Render SQLite path are required." >&2
    exit 1
fi

# The command always rebuilds the demo from the current migrations and
# DatabaseSeeder (which calls DemoSeeder). It is the only release seed flow.
php artisan migrate:fresh --seed --force
