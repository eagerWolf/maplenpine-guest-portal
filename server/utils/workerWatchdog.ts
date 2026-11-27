import { randomUUID } from 'node:crypto'
import { getDb, now } from '../db/index'
import { enqueueIntegration, processIntegrationOutbox } from './integrationOutbox'
import { canClaimWorkerJobs, mayRequestReboot, recoveryConfirmed, workerProblem, workerProblemLabels, RECOVERY_TIMEOUT_MS, STALLED_JOB_MS, type WorkerHealth, type WatchdogIncident, type WatchdogInput } from '../../shared/workerWatchdog'
export function watchdogSetting(key: string): string | undefined {
  return (getDb().prepare('SELECT value FROM app_settings WHERE key=?').get(key) as {value:string}|undefined)?.value
}
export function setWatchdogSetting(key: string, value: string) {
  getDb().prepare('INSERT INTO app_settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').run(key,value,now())
}
function jsonSetting<T>(key: string): T | undefined {
  try { return JSON.parse(watchdogSetting(key) || 'null') || undefined } catch { return undefined }
}
export function workerWatchdogInput(): WatchdogInput {
  const job = getDb().prepare("SELECT MIN(updated_at) AS started FROM jobs WHERE status='in_progress'").get() as {started:string|null}
  return {lastSeen:watchdogSetting('orchestrator_last_seen'),health:jsonSetting<WorkerHealth>('orchestrator_gui_health'),
    oldestJobAt:job.started || undefined,bootId:watchdogSetting('orchestrator_boot_id'),systemSeen:watchdogSetting('orchestrator_system_seen')}
}
export function workerCanClaimJobs() {
  const incident = jsonSetting<WatchdogIncident>('orchestrator_watchdog_incident')
  if (incident?.rebootAt && !incident.resolvedAt) return false
  return canClaimWorkerJobs(workerWatchdogInput().health,Date.now())
}
function alert(incident: WatchdogIncident, suffix: string, event: 'orchestrator_offline'|'orchestrator_recovered'|'orchestrator_reboot'|'orchestrator_recovery_failed', title: string, detail: string) {
  enqueueIntegration(`worker-watchdog:${incident.id}:${suffix}`,'admin_notification',{event,subject:title,emailHtml:'<p>Preverite stanje Windows workerja v portalu.</p>',whatsappText:`${title}\n${detail}`})
}
let recoveryTimer: ReturnType<typeof setTimeout> | undefined
let recoveryTimerKey=''
function scheduleRecoveryCheck(incident: WatchdogIncident | undefined) {
  const key=incident?.rebootAt && !incident.resolvedAt && !incident.failedAt ? incident.id+':'+incident.rebootAt : ''
  if(key===recoveryTimerKey)return
  if(recoveryTimer)clearTimeout(recoveryTimer)
  recoveryTimerKey=key
  if(!key || !incident?.rebootAt)return
  recoveryTimer=setTimeout(()=>{
    recoveryTimerKey=''
    try { evaluateWorkerWatchdog(); void processIntegrationOutbox().catch(()=>console.error('[watchdog] Alert delivery needs retry')) }
    catch { console.error('[watchdog] Recovery check failed; scheduled monitor will retry') }
  },Math.max(0,Date.parse(incident.rebootAt)+RECOVERY_TIMEOUT_MS-Date.now()))
  recoveryTimer.unref?.()
}
export function evaluateWorkerWatchdog(reference = new Date()): WatchdogIncident | undefined {
  return getDb().transaction(() => {
    const input=workerWatchdogInput(), time=reference.getTime(), timestamp=reference.toISOString()
    let incident=jsonSetting<WatchdogIncident>('orchestrator_watchdog_incident')
    // A pre-reboot lease may still be in the database until the next job poll.
    if (incident?.rebootAt && incident.resolvedAt && time-Date.parse(incident.resolvedAt)<STALLED_JOB_MS && input.oldestJobAt && Date.parse(input.oldestJobAt)<Date.parse(incident.rebootAt)) input.oldestJobAt=undefined
    const problem=workerProblem(input,time)
    // The new watchdog starts only after the GUI worker has reported its first readiness.
    if (!input.health && !input.systemSeen) return undefined
    // An inconclusive probe pauses hardware immediately, but a single slow PowerShell startup must not page the owner.
    if (problem==='probe_failed' && (!incident || incident.resolvedAt) && time-Date.parse(input.health?.unavailableSince || input.health?.receivedAt || timestamp)<60000) return incident
    if (problem && (!incident || incident.resolvedAt)) {
      incident={id:randomUUID(),startedAt:input.health?.unavailableSince || timestamp,reason:problem}
      alert(incident,'problem','orchestrator_offline','Windows worker potrebuje pregled',`${workerProblemLabels[problem]} ${problem==='system_watchdog_missing' ? 'Preverite sistemsko opravilo na Windows.' : 'Nova PIN opravila se izvajajo le pri pripravljenem namizju. Po eni uri je predviden en varen ponovni zagon.'}`)
    }
    if (!incident || incident.resolvedAt) { scheduleRecoveryCheck(incident); return incident }
    if (recoveryConfirmed(input,incident,time)) {
      incident.resolvedAt=timestamp
      alert(incident,'recovered','orchestrator_recovered','Windows worker ponovno deluje','Povezava in uporabno Windows namizje sta potrjena. Obdelava PIN opravil se lahko nadaljuje.')
    } else if (incident.rebootAt && !incident.failedAt && time-Date.parse(incident.rebootAt)>=RECOVERY_TIMEOUT_MS) {
      incident.failedAt=timestamp
      alert(incident,'recovery-failed','orchestrator_recovery_failed','Obnova Windows workerja ni potrjena','V petih minutah po odobrenem rebootu ni bilo potrditve novega zagona in uporabnega namizja. Potreben je ročni pregled; novega samodejnega reboota ne bo.')
    }
    setWatchdogSetting('orchestrator_watchdog_incident',JSON.stringify(incident))
    scheduleRecoveryCheck(incident)
    return incident
  })()
}
export function reportWorkerHealth(ready: boolean, reason: WorkerHealth['reason']) {
  const receivedAt=now()
  const previous=jsonSetting<WorkerHealth>('orchestrator_gui_health')
  const unavailableSince=ready ? undefined : (!previous?.ready ? previous?.unavailableSince || receivedAt : receivedAt)
  setWatchdogSetting('orchestrator_gui_health',JSON.stringify({ready,reason,receivedAt,unavailableSince}))
  setWatchdogSetting('orchestrator_last_seen',receivedAt)
  evaluateWorkerWatchdog()
}
export function reportSystemWatchdog(body: {bootId:string;busy:boolean;action?:string;incidentId?:string}) {
  return getDb().transaction(() => {
    setWatchdogSetting('orchestrator_boot_id',body.bootId)
    setWatchdogSetting('orchestrator_system_seen',now())
    const incident=evaluateWorkerWatchdog()
    const enabled=watchdogSetting('orchestrator_watchdog_reboot_enabled')==='1'
    const time=Date.now()
    if (!enabled || !incident || !mayRequestReboot(incident,time) || !workerProblem(workerWatchdogInput(),time)) return {command:'none'}
    if (body.busy) {
      if (!incident.deferred) {
        incident.deferred=true
        alert(incident,'deferred','orchestrator_reboot','Ponovni zagon Windows je zadržan','eKey ali PIN opravilo je še aktivno. Zaradi varnosti dostopov ga ne bomo prekinili.')
        setWatchdogSetting('orchestrator_watchdog_incident',JSON.stringify(incident))
      }
      return {command:'none'}
    }
    if (body.action!=='ack-reboot') return {command:'prepare-reboot',incidentId:incident.id}
    if (body.incidentId!==incident.id) return {command:'none'}
    // Consume the single reboot attempt before authorizing Windows. Lost responses never cause a retry loop.
    incident.rebootAt=new Date(time).toISOString();incident.bootBefore=body.bootId
    setWatchdogSetting('orchestrator_watchdog_incident',JSON.stringify(incident))
    scheduleRecoveryCheck(incident)
    alert(incident,'reboot','orchestrator_reboot','Windows VM gre v ponovni zagon','Težava traja vsaj eno uro. Odobren je en ponovni zagon; obnovo preverjamo največ pet minut.')
    return {command:'reboot',incidentId:incident.id}
  })()
}
export function workerWatchdogSummary() {
  const input=workerWatchdogInput()
  const problem= input.health ? workerProblem(input,Date.now()) : null
  return {reported:!!input.health,ready:!!input.health && !problem,reason:problem,
    label:input.health ? (problem ? workerProblemLabels[problem] : 'Windows namizje je pripravljeno za eKey.') : 'Watchdog še ni poslal stanja namizja.',
    lastReport:input.health?.receivedAt || null,systemLastSeen:input.systemSeen || null,
    incident:jsonSetting<WatchdogIncident>('orchestrator_watchdog_incident') || null,
    rebootEnabled:watchdogSetting('orchestrator_watchdog_reboot_enabled')==='1'}
}
