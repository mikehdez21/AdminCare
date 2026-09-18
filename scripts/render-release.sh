#!/bin/sh
set -eu

# Keep releaseCommand as an optional early initialization path. start also
# invokes this guarded reset because Render may skip releaseCommand on restart.
sh scripts/render-demo-reset.sh
