#!/bin/sh
set -eu

# This reset is intentionally destructive, but only for the Render demo.
# Keep the guard next to the command so every caller gets the same protection.
if [ "${DEMO_MODE:-}" != "true" ] \
    || [ "${DB_CONNECTION:-}" != "sqlite" ] \
    || [ "${DEMO_DATABASE_ALLOW_RESET:-}" != "true" ] \
    || [ "${DB_DATABASE:-}" != "database/database.sqlite" ] \
    || [ -n "${DB_URL:-}" ]; then
    echo "Refusing Render demo reset: DEMO_MODE=true, SQLite, the demo reset opt-in, the Render SQLite path, and no DB_URL are required." >&2
    exit 1
fi

mkdir -p database
touch database/database.sqlite
php artisan migrate:fresh --seed --force
