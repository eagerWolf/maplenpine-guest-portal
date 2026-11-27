export const HEARTBEAT_TIMEOUT_MS = 2 * 60_000
export const REBOOT_AFTER_MS = 60 * 60_000
export const RECOVERY_TIMEOUT_MS = 5 * 60_000
export const STALLED_JOB_MS = 12 * 60_000
export const workerReasons = ['ready','dry_run','session_unavailable','session_disconnected','desktop_unavailable','probe_failed'] as const
export type WorkerReason = typeof workerReasons[number]
export interface WorkerHealth { ready: boolean; reason: WorkerReason; receivedAt: string; unavailableSince?: string }
export interface WatchdogIncident { id: string; startedAt: string; reason: string; rebootAt?: string; bootBefore?: string; failedAt?: string; resolvedAt?: string; deferred?: boolean }
export interface WatchdogInput { lastSeen?: string; health?: WorkerHealth; oldestJobAt?: string; bootId?: string; systemSeen?: string }
export function workerProblem(input: WatchdogInput, time: number): string | null {
  const health = input.health
  if (health) {
    if (time - Date.parse(health.receivedAt) > HEARTBEAT_TIMEOUT_MS) return 'heartbeat_missing'
    if (!health.ready || health.reason === 'dry_run') return health.reason
  } else if (!input.lastSeen || time - Date.parse(input.lastSeen) > 15 * 60_000) return 'heartbeat_missing'
  if (input.systemSeen && time-Date.parse(input.systemSeen)>3*60_000) return 'system_watchdog_missing'
  if (input.oldestJobAt && time - Date.parse(input.oldestJobAt) > STALLED_JOB_MS) return 'job_stalled'
  return null
}
export function canClaimWorkerJobs(health: WorkerHealth | undefined, time: number): boolean {
  // Compatibility during rollout: once health is reported, stale or blocked GUI is fail-closed.
  return !health || (health.ready && health.reason === 'ready' && time - Date.parse(health.receivedAt) <= HEARTBEAT_TIMEOUT_MS)
}
export function recoveryConfirmed(input: WatchdogInput, incident: WatchdogIncident, time: number): boolean {
  if (!input.health || workerProblem({...input,oldestJobAt:incident.rebootAt ? undefined : input.oldestJobAt},time)) return false
  if (!incident.rebootAt) return true
  return !!input.bootId && input.bootId !== incident.bootBefore
    && !!input.systemSeen && time - Date.parse(input.systemSeen) <= HEARTBEAT_TIMEOUT_MS
    && Date.parse(input.health.receivedAt) > Date.parse(incident.rebootAt)
}
export function mayRequestReboot(incident: WatchdogIncident, time: number): boolean {
  return !incident.resolvedAt && !incident.rebootAt && time - Date.parse(incident.startedAt) >= REBOOT_AFTER_MS
}
export const workerProblemLabels: Record<string,string> = {
  system_watchdog_missing:'Sistemski watchdog se ne javlja; samodejni reboot trenutno ni zagotovljen.',
  heartbeat_missing:'Worker se ne javlja.', session_unavailable:'Ni uporabniške Windows seje.',
  session_disconnected:'Windows seja je odklopljena.', desktop_unavailable:'Windows namizje je zaklenjeno ali nedostopno.',
  probe_failed:'Pripravljenosti Windows namizja ni mogoče preveriti.', dry_run:'Worker je v simulacijskem načinu.',
  job_stalled:'eKey opravilo traja več kot 12 minut; potreben je pregled.',
}
