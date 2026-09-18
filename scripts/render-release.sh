#!/bin/sh
set -eu

mkdir -p database
touch database/database.sqlite
php artisan migrate --force

# Seed only a new/empty demo database. This command is part of the production
# application and therefore also works with Composer --no-dev.
php artisan demo:seed-if-empty
