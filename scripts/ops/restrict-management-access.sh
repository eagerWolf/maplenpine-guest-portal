#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run with sudo.'; exit 1; }
allowed=193.77.82.34
source_ip=${SSH_CONNECTION%% *}
[[ "$source_ip" == "$allowed" ]] || { echo 'Connect from the approved VPN IP first.'; exit 1; }
backup=/var/backups/maplenpine-access-$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 700 "$backup"
cp -p /etc/caddy/Caddyfile "$backup/Caddyfile"
sshfile=/etc/ssh/sshd_config.d/01-maplenpine-access.conf
[[ ! -e "$sshfile" ]] || cp -p "$sshfile" "$backup/ssh-access.conf"
rollback() {
 cp -p "$backup/Caddyfile" /etc/caddy/Caddyfile
 if [[ -f "$backup/ssh-access.conf" ]]; then cp -p "$backup/ssh-access.conf" "$sshfile"; else rm -f "$sshfile"; fi
 systemctl reload ssh || true
 systemctl reload caddy || true
}
trap rollback ERR
cat > /etc/caddy/Caddyfile <<'CADDY'
# Management paths are private; guest, cleaning and worker endpoints stay public.
(management_access) {
 @blocked_management {
  path /admin /admin/* /api/admin /api/admin/* /login /activate /forgot-password /reset-password /api/auth /api/auth/* /api/_auth /api/_auth/*
  not remote_ip 193.77.82.34/32
 }
 respond @blocked_management "Dostop je dovoljen samo prek VPN-ja." 403
 header X-Robots-Tag "noindex, nofollow"
}
guesttest.maplenpine.com {
 import management_access
 reverse_proxy 127.0.0.1:3002 {
  header_up X-Forwarded-For {remote_host}
 }
}
guest.maplenpine.com {
 import management_access
 reverse_proxy 127.0.0.1:3001 {
  header_up X-Forwarded-For {remote_host}
 }
}
CADDY
# Direct connections only. Revisit trusted client IP handling before enabling a CDN proxy.
printf 'AllowUsers deploy@193.77.82.34\n' > "$sshfile"
/usr/sbin/sshd -t
/usr/sbin/sshd -T -C user=deploy,addr=193.77.82.34,host=maplenpine | grep '^allowusers '
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl reload caddy
systemctl reload ssh
trap - ERR
printf 'Management access restricted. Backup: %s\nKeep this SSH session open and test a NEW connection.\n' "$backup"
