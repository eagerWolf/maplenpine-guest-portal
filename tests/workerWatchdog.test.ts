import Database from 'better-sqlite3'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { canClaimWorkerJobs, HEARTBEAT_TIMEOUT_MS } from '../shared/workerWatchdog'
let db: Database.Database
const alerts=vi.hoisted(()=>vi.fn())
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
vi.mock('../server/utils/integrationOutbox',()=>({enqueueIntegration:alerts,processIntegrationOutbox:vi.fn().mockResolvedValue({})}))
const {reportWorkerHealth,reportSystemWatchdog,evaluateWorkerWatchdog,workerCanClaimJobs}=await import('../server/utils/workerWatchdog')
const bootA='2026-11-27T08:00:00.000Z',bootB='2026-11-27T10:01:00.000Z'
const start=Date.parse('2026-11-27T09:00:00Z')
function at(ms:number){vi.setSystemTime(start+ms)}
function blocked(){reportWorkerHealth(false,'desktop_unavailable')}
function report(bootId=bootA,busy=false,extra:object={}){return reportSystemWatchdog({bootId,busy,...extra}) as {command:string;incidentId?:string}}
beforeEach(()=>{
  vi.useFakeTimers();at(0);alerts.mockReset();db=new Database(':memory:')
  db.exec("CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT,updated_at TEXT); CREATE TABLE jobs(id INTEGER,status TEXT,updated_at TEXT); INSERT INTO app_settings VALUES('orchestrator_watchdog_reboot_enabled','1','');")
})
afterEach(()=>{db.close();vi.useRealTimers()})
it('blocks job claims on lock and stale health; sends one immediate incident alert',()=>{
  reportWorkerHealth(true,'ready');expect(workerCanClaimJobs()).toBe(true)
  at(1000);blocked();blocked();expect(workerCanClaimJobs()).toBe(false)
  expect(alerts).toHaveBeenCalledTimes(1)
  reportWorkerHealth(true,'ready');expect(alerts).toHaveBeenCalledTimes(2)
  at(HEARTBEAT_TIMEOUT_MS+2000);expect(workerCanClaimJobs()).toBe(false)
  expect(canClaimWorkerJobs(undefined,Date.now())).toBe(true) // compatible legacy rollout
})
it('waits a full hour and consumes a reboot attempt atomically before responding',()=>{
  blocked();at(3599999);expect(report().command).toBe('none')
  at(3600000);const instruction=report();expect(instruction.command).toBe('prepare-reboot')
  expect(report(bootA,false,{action:'ack-reboot',incidentId:'wrong'}).command).toBe('none')
  expect(report(bootA,false,{action:'ack-reboot',incidentId:instruction.incidentId}).command).toBe('reboot')
  expect(report(bootA,false,{action:'ack-reboot',incidentId:instruction.incidentId}).command).toBe('none')
  expect(workerCanClaimJobs()).toBe(false)
})
it('defers busy eKey without consuming the only reboot attempt or repeating alerts',()=>{
  blocked();at(3600000);expect(report(bootA,true).command).toBe('none');report(bootA,true)
  expect(alerts).toHaveBeenCalledTimes(2)
  expect(report().command).toBe('prepare-reboot')
})
it('requires new boot AND fresh GUI readiness; reports failed recovery once at five minutes',()=>{
  blocked();at(3600000);const instruction=report();report(bootA,false,{action:'ack-reboot',incidentId:instruction.incidentId})
  at(3601000);reportWorkerHealth(true,'ready');expect(evaluateWorkerWatchdog()?.resolvedAt).toBeUndefined()
  at(3900000);evaluateWorkerWatchdog();evaluateWorkerWatchdog()
  expect(alerts.mock.calls.filter(call=>call[0].endsWith(':recovery-failed'))).toHaveLength(1)
  expect(report().command).toBe('none')
  report(bootB);expect(evaluateWorkerWatchdog()?.resolvedAt).toBeUndefined() // old readiness expired
  reportWorkerHealth(true,'ready');expect(evaluateWorkerWatchdog()?.resolvedAt).toBeTruthy()
  expect(alerts.mock.calls.filter(call=>call[0].endsWith(':recovered'))).toHaveLength(1)
})
it('recovers after reboot with a stale claimed job so durable jobs can resume',()=>{
  blocked();at(3600000);const instruction=report();report(bootA,false,{action:'ack-reboot',incidentId:instruction.incidentId})
  db.prepare('INSERT INTO jobs VALUES(1,?,?)').run('in_progress',new Date(start).toISOString())
  at(3650000);report(bootB);reportWorkerHealth(true,'ready')
  expect(evaluateWorkerWatchdog()?.resolvedAt).toBeTruthy();expect(workerCanClaimJobs()).toBe(true)
})
it('disabled reboot still monitors and alerts but cannot authorize shutdown',()=>{
  db.exec("UPDATE app_settings SET value='0'");blocked();at(7200000)
  expect(report().command).toBe('none');expect(alerts).toHaveBeenCalledTimes(1)
})
it('heartbeat loss and stuck jobs are detected independently of a live GUI',()=>{
  reportWorkerHealth(true,'ready');at(HEARTBEAT_TIMEOUT_MS+1);evaluateWorkerWatchdog()
  expect(alerts).toHaveBeenCalledTimes(1)
  reportWorkerHealth(true,'ready');db.prepare('INSERT INTO jobs VALUES(1,?,?)').run('in_progress',new Date(start-12*60000).toISOString())
  evaluateWorkerWatchdog();expect(alerts.mock.calls.at(-1)?.[2].whatsappText).toMatch(/12 minut/)
})

it('sends the recovery failure at the five-minute deadline without waiting for cron',async()=>{
  blocked();at(3600000);const instruction=report();report(bootA,false,{action:'ack-reboot',incidentId:instruction.incidentId})
  await vi.advanceTimersByTimeAsync(5*60000)
  expect(alerts.mock.calls.filter(call=>call[0].endsWith(':recovery-failed'))).toHaveLength(1)
})
it('monitors first startup even if the GUI worker has never connected',()=>{
  report();expect(alerts).toHaveBeenCalledTimes(1)
})

it('one inconclusive probe pauses claims without paging, sustained failures alert once',()=>{
  reportWorkerHealth(true,'ready');at(1000);reportWorkerHealth(false,'probe_failed')
  expect(workerCanClaimJobs()).toBe(false);expect(alerts).not.toHaveBeenCalled()
  at(61000);reportWorkerHealth(false,'probe_failed');evaluateWorkerWatchdog()
  expect(alerts).toHaveBeenCalledTimes(1)
})
