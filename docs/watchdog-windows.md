# Windows eKey watchdog

The guest portal owns incident detection, alerting and the single reboot decision. Windows reports GUI readiness every minute. A separate SYSTEM scheduled task reports boot identity and fetches the narrowly scoped reboot decision even when the GUI worker is stopped or the session is locked. No QNAP credentials or VM power-control API are installed.

## Policy

- A confirmed lock/disconnected/noninteractive desktop pauses hardware operations and opens an incident immediately. Freshness is assessed using server receipt times.
- Missing GUI heartbeat: 2 minutes, evaluated by a minute scheduler. An inconclusive probe pauses operations immediately but must remain inconclusive for one minute before opening a new alert incident.
- A claimed job lasting more than 12 minutes is considered stalled. Missing SYSTEM watchdog reports are also shown and alerted.
- A continuously unresolved incident becomes reboot-eligible after 60 minutes. The SYSTEM task must reserve the same hardware cycle lock and verify no AutoHotkey/eKey admin process is running. Otherwise it reports deferral; it never kills an active hardware operation.
- Reboot authorization is consumed in the database before the response, and recorded locally before shutdown. Lost responses cannot cause repeated reboots. There is at most one reboot per incident.
- Recovery requires a changed boot identity, fresh SYSTEM reporting and a fresh ready GUI report after reboot authorization. A deadline timer checks five minutes after authorization; the minute scheduler is the restart fallback. Failure is alerted once, with no second reboot. A later confirmed recovery is still reported once.
- Pending results are flushed even when the desktop is unavailable; pending jobs remain durable. New claims are blocked after a reported GUI health becomes unavailable/stale or a reboot is awaiting recovery. Legacy workers remain compatible until their first readiness report.

## Activation

`PORTAL_WORKER_WATCHDOG_ENABLED=true` schedules monitoring independently of other disabled background tasks. `PORTAL_WORKER_ALERTS_ENABLED=true` enables only the four infrastructure event types through the shared approved WhatsApp template; it does not enable staff/guest notification flows. `orchestrator_watchdog_reboot_enabled=1` in app_settings authorizes the Windows reboot handshake. A monitoring-only rollout leaves this setting off.

The current Windows authority is **guesttest.maplenpine.com** using the existing configured orchestrator bearer token. Only one portal may be the reboot authority for this single Windows VM. Before activating production targets, explicitly move the protected SYSTEM config to the chosen production authority; never install two independent reboot watchdog tasks for the same VM.

SYSTEM task: `MapleAndPine-SystemWatchdog`, at startup and every minute. Protected code/config: `C:/ProgramData/MapleAndPine-SystemWatchdog`, writable only by SYSTEM/Administrators. Windows installation starts from `scripts/apply-watchdog-update.ps1` in the worker repository, retaining credentials and durable state with a source backup. The task uses process-scoped RemoteSigned; no global Execution Policy change.

Disable reboot with `orchestrator_watchdog_reboot_enabled=0`. Disable Windows polling with `Disable-ScheduledTask MapleAndPine-SystemWatchdog`. Preserve pending jobs/results. If credentials rotate, update the protected watchdog config as well. Backups are retained before portal deployment and before Windows source replacement.

## Validation 27 November 2026

Real session lock at 11:29:31 Europe/Ljubljana produced one alert. The incident timestamp alone was moved into the past for the controlled one-hour decision test; the actual policy threshold was unchanged, and the change was audited. SYSTEM authorized and initiated a single reboot at 11:31:38.090. With RDP and QNAP console not reopened, a new boot identity plus fresh GUI readiness confirmed recovery at 11:36:12.056: **4 minutes 34 seconds**. Twilio confirmed the problem alert read and both reboot/recovery notices delivered. There was no recovery-failure notification or second reboot in this incident.

Automated tests exercise authentication, constrained request payloads, no early reboot, busy deferral, duplicate/lost acknowledgment safety, exact five-minute failure notification, late recovery, new boot/GUI evidence, blocked claims, and preservation of unsent results. A follow-up robustness change tolerates slower PowerShell initialization and suppresses isolated inconclusive probe alarms.

A completely hung/offline VM cannot execute its SYSTEM task. The external portal will still alert, but power-on/reset via QNAP is outside this implementation. A VPS outage cannot send its own WhatsApp alert; independent external monitoring is a separate concern.
