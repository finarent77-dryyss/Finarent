#!/bin/bash
# Hook build Clever Cloud (Linux) — mappe l'addon Postgres puis délègue au script Node.
set -e

if [ -n "$POSTGRESQL_ADDON_URI" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$POSTGRESQL_ADDON_URI"
  echo "✓ DATABASE_URL ← POSTGRESQL_ADDON_URI"
fi

npm run build:standalone
