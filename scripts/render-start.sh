#!/bin/sh
set -eu

mkdir -p database
touch database/database.sqlite
php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
