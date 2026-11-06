#!/usr/bin/env bash
set -euo pipefail

# Build on the target OS/architecture: better-sqlite3 contains native code.
# Default is a read-only transfer preview. --apply explicitly transfers/restarts.
MODE="${1:---preview}"
[[ "$MODE" == --preview || "$MODE" == --apply ]] || { echo 'Usage: deploy.sh [--preview|--apply]' >&2; exit 1; }
: "${DEPLOY_SERVER:?Set DEPLOY_SERVER, e.g. deploy@staging-host}"
: "${DEPLOY_DIR:?Set an absolute DEPLOY_DIR, e.g. /opt/maplenpine-staging}"
[[ "$DEPLOY_SERVER" =~ ^[a-zA-Z0-9_.@-]+$ && "$DEPLOY_SERVER" != -* ]] || { echo 'Invalid DEPLOY_SERVER' >&2; exit 1; }
[[ "$DEPLOY_DIR" =~ ^/[a-zA-Z0-9_/-]+$ && "$DEPLOY_DIR" != / && "$DEPLOY_DIR" != */../* && "$DEPLOY_DIR" != */.. ]] || { echo 'Invalid DEPLOY_DIR' >&2; exit 1; }
cd "$(dirname "$0")/.."
[[ -f .output/server/index.mjs ]] || { echo 'Run npm run check on the target OS/architecture first.' >&2; exit 1; }
flags=(-az --delete)
if [[ "$MODE" == --preview ]]; then
  flags+=(--dry-run --itemize-changes)
else
  : "${DEPLOY_APP_NAME:?Set a separate PM2 name, e.g. maplenpine-staging}"
  : "${DEPLOY_PORT:?Set the target port, e.g. 3002}"
  [[ "$DEPLOY_APP_NAME" =~ ^[a-zA-Z0-9_-]+$ && "$DEPLOY_PORT" =~ ^[0-9]+$ ]] || { echo 'Invalid app name or port' >&2; exit 1; }
  (( DEPLOY_PORT >= 1024 && DEPLOY_PORT <= 65535 )) || { echo 'Port must be 1024-65535' >&2; exit 1; }
  [[ "$(uname -s)" == Linux ]] || { echo 'Build and deploy from Linux matching the target architecture; do not ship macOS native modules.' >&2; exit 1; }
fi
# Delete only obsolete build files inside .output, never the application root.
rsync "${flags[@]}" .output/ "$DEPLOY_SERVER:$DEPLOY_DIR/.output/"
config_flags=(-az)
[[ "$MODE" != --preview ]] || config_flags+=(--dry-run --itemize-changes)
rsync "${config_flags[@]}" ecosystem.config.cjs "$DEPLOY_SERVER:$DEPLOY_DIR/"
if [[ "$MODE" == --apply ]]; then
  ssh "$DEPLOY_SERVER" "cd '$DEPLOY_DIR' && PM2_APP_NAME='$DEPLOY_APP_NAME' PORT='$DEPLOY_PORT' pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save"
fi
