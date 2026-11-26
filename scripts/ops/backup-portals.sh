#!/usr/bin/env bash
set -u
umask 077
export PATH=/usr/bin:/bin
export NVM_DIR=/home/deploy/.nvm
. "$NVM_DIR/nvm.sh"
mkdir -p /home/deploy/portal-backups/automatic
exec 9>/home/deploy/portal-backups/automatic/backup.lock
flock -n 9 || exit 0
result=0
for target in staging production; do
 if [[ "$target" == staging ]]; then folder=/opt/maplenpine-staging; else folder=/home/deploy/apps/maplenpine-production; fi
 printf '%s %s backup starting\n' "$(date -u +%FT%TZ)" "$target"
 (cd "$folder" && PORTAL_BACKUP_ROOT="/home/deploy/portal-backups/automatic/$target" node scripts/backup-portal.mjs --verify-restore) || result=1
done
exit "$result"
