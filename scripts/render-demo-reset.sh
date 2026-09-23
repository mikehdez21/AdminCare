#!/bin/sh
set -eu

# This reset is intentionally destructive, but only for the Render demo.
# Keep the guard next to the command so every caller gets the same protection.
if [ "${DEMO_MODE:-}" != "true" ] \
    || [ "${DB_CONNECTION:-}" != "sqlite" ] \
    || [ "${DEMO_DATABASE_ALLOW_RESET:-}" != "true" ] \
    || [ "${DB_DATABASE:-}" != "database/admincare-demo.db" ] \
    || [ -n "${DB_URL:-}" ]; then
    echo "Refusing Render demo reset: DEMO_MODE=true, SQLite, the demo reset opt-in, the Render SQLite path, and no DB_URL are required." >&2
    exit 1
fi

mkdir -p database
touch database/admincare-demo.db
# The demo migrations live in database/migrations/SQLITE. An explicit --path
# makes migrate:fresh forward that exact path to migrate, so neither the root
# (which still holds the legacy PostgreSQL 008) nor the legacy almacengeneral/
# and logs/ subdirectories are scanned at reset time.
php artisan migrate:fresh --seed --force --path=database/migrations/SQLITE
