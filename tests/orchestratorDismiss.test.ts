import Database from 'better-sqlite3'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
let db: Database.Database
vi.mock('../server/db/index', () => ({ getDb: () => db, now: () => '2026-11-27T08:00:00Z' }))
const handler = (await import('../server/api/admin/orchestrator/jobs/[id]/dismiss.post')).default
beforeEach(() => {
  db = new Database(':memory:')
  db.exec(`CREATE TABLE jobs(id INTEGER PRIMARY KEY,status TEXT,reason TEXT,lease_expires_at TEXT,updated_at TEXT);
    CREATE TABLE audit_log(user_id,user_email,action,detail,created_at);
    INSERT INTO jobs VALUES(1,'failed','Device sync not confirmed',NULL,NULL),(2,'in_progress',NULL,'future',NULL),(3,'pending',NULL,NULL,NULL),(4,'success',NULL,NULL,NULL);`)
  vi.stubGlobal('requireUserSession', async () => ({user:{id:1,email:'admin@example.com',role:'admin'}}))
  vi.stubGlobal('getRouterParam', () => '1')
  vi.stubGlobal('createError', (value: {statusCode:number;statusMessage:string}) => Object.assign(new Error(value.statusMessage),value))
})
afterEach(() => { db.close(); vi.unstubAllGlobals() })
it('dismisses failed jobs without deleting evidence or claiming hardware success and audits the action', async () => {
  await handler({} as any)
  expect(db.prepare('SELECT status,reason FROM jobs WHERE id=1').get()).toEqual({status:'dismissed',reason:'Device sync not confirmed'})
  expect(db.prepare('SELECT action FROM audit_log').get()).toEqual({action:'dismiss_orchestrator_job'})
  await expect(handler({} as any)).rejects.toThrow('samo neuspešno')
})
it('cannot dismiss queued, running or successful jobs', async () => {
  for (const id of ['2','3','4']) {
    vi.stubGlobal('getRouterParam', () => id)
    await expect(handler({} as any)).rejects.toThrow('samo neuspešno')
  }
  expect(db.prepare('SELECT COUNT(*) n FROM audit_log').get()).toEqual({n:0})
})
it('rejects non-admins and invalid identifiers', async () => {
  vi.stubGlobal('requireUserSession',async () => ({user:{role:'staff'}}))
  await expect(handler({} as any)).rejects.toThrow('Ni dovoljenja')
  vi.stubGlobal('requireUserSession',async () => ({user:{role:'admin'}}))
  vi.stubGlobal('getRouterParam', () => '1oops')
  await expect(handler({} as any)).rejects.toThrow('Neveljavno')
})
it('rolls back dismissal if audit logging fails', async () => {
  db.exec('DROP TABLE audit_log')
  await expect(handler({} as any)).rejects.toThrow()
  expect(db.prepare('SELECT status FROM jobs WHERE id=1').get()).toEqual({status:'failed'})
})
