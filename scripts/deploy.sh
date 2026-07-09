#!/usr/bin/env bash
set -e

SERVER="root@<SERVER_IP>"
APP_DIR="/opt/maplenpine-portal"

echo "→ Building..."
npm run build

echo "→ Syncing to server..."
rsync -az --delete \
  .output/ \
  ecosystem.config.cjs \
  "$SERVER:$APP_DIR/"

echo "→ Restarting PM2..."
ssh "$SERVER" "cd $APP_DIR && pm2 reload ecosystem.config.cjs --update-env"

echo "✓ Deploy done"
