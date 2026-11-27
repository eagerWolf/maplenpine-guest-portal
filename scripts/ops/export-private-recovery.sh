#!/usr/bin/env bash
# Run as deploy AFTER backup-portals.sh. Contains secrets: never serve publicly or commit.
set -euo pipefail
umask 077
root=/home/deploy/portal-backups
mkdir -p "$root/export"
exec 8>"$root/export/export.lock"
flock -n 8 || exit 0
work=$(mktemp -d "$root/export/.building-XXXXXXXX")
trap 'rm -rf "$work"' EXIT
for target in staging production; do
  snapshot=$(find "$root/automatic/$target" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)
  test -f "$snapshot/restore-verified.json"
  mkdir -p "$work/$target/snapshot"
  for name in .env portal.db manifest.json restore-verified.json application-restore-verified.json files; do
    if [[ -e "$snapshot/$name" ]]; then cp -a "$snapshot/$name" "$work/$target/snapshot/"; fi
  done
  if [[ "$target" == staging ]]; then app=/opt/maplenpine-staging; else app=/home/deploy/apps/maplenpine-production; fi
  cp -a "$app/.output" "$work/$target/"
  cp "$app/ecosystem.config.cjs" "$work/$target/"
done
mkdir "$work/infrastructure"
cp /etc/caddy/Caddyfile "$work/infrastructure/"
crontab -l > "$work/infrastructure/deploy.crontab"
cp /home/deploy/backup-portals.sh "$work/infrastructure/"
printf '%s\n' 'Private recovery: databases, original encryption keys, uploads and compatible ARM releases.' 'Windows/eKey database and licences must be backed up separately.' 'Keep all senders OFF until recovery reconciliation is complete.' > "$work/README.txt"
(cd "$work" && find . -type f -print0 | sort -z | xargs -0 sha256sum > "$root/export/.manifest.tmp")
mv "$root/export/.manifest.tmp" "$work/SHA256SUMS"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
archive="$root/export/maplenpine-private-$stamp.tar.gz"
tar -czf "$archive.tmp" -C "$work" .
mv "$archive.tmp" "$archive"
sha256sum "$archive" > "$archive.sha256"
chmod 600 "$archive" "$archive.sha256"
printf 'Private recovery archive ready: %s\n' "$archive"
