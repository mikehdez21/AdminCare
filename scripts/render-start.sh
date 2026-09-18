#!/bin/sh
set -eu

# Render free services may restart without running releaseCommand. Initialize
# here as well, before Laravel starts serving requests.
sh scripts/render-demo-reset.sh
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
