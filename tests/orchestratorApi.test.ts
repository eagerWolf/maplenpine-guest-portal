import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let db: Database.Database
let body: unknown

vi.mock('../server/db/index', () => ({
  getDb: () => db,
  now: () => '2026-08-01T12:00:00.000Z',
  guestTokenExpiry: () => '2026-08-10T00:00:00.000Z',
}))
vi.mock('../server/utils/email', () => ({ getEmailConfig: () => ({ configured: false }), sendGuestPin: vi.fn() }))
vi.mock('../server/utils/bentral', () => ({ patchBentralEntranceCode: vi.fn() }))
vi.mock('../server/utils/notify', () => ({ notifyAdmins: vi.fn().mockResolvedValue(undefined) }))

vi.stubGlobal('getHeader', (event: { authorization?: string }, name: string) => name === 'authorization' ? event.authorization : undefined)
vi.stubGlobal('readBody', async () => body)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { baseUrl: 'https://portal.test' }, bentralApiKey: '' }))
vi.stubGlobal('requireUserSession', async () => ({ user: { id: 1, email: 'admin@test.si', role: 'admin' } }))
vi.stubGlobal('getRouterParam', (event: { id?: string }, name: string) => name === 'id' ? event.id : undefined)

const jobsHandler = (await import('../server/api/orchestrator/jobs.get')).default as (event: { authorization?: string }) => Promise<{ jobs: unknown[] }>
const resultsHandler = (await import('../server/api/orchestrator/results.post')).default as (event: { authorization?: string }) => Promise<{ success: boolean; processed: number; duplicates: number }>
const { queueExpiredManagedCodeCleanup } = await import('../server/utils/jobs')
const retryHandler = (await import('../server/api/admin/orchestrator/jobs/[id]/retry.post')).default as (event: { id: string }) => Promise<{ success: boolean }>
const { processIntegrationOutbox } = await import('../server/utils/integrationOutbox')
const { checkOrchestratorHealth } = await import('../server/utils/orchestratorHealth')
const retryOutboxHandler = (await import('../server/api/admin/orchestrator/outbox/[id]/retry.post')).default as (event: { id: string }) => Promise<{ success: boolean }>

function seedDb() {
  db = new Database(':memory:')
  db.exec(`
    CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE reservations (
      id INTEGER PRIMARY KEY, bentral_reservation_id TEXT, door TEXT, first_name TEXT, last_name TEXT,
      check_in TEXT, check_out TEXT, status TEXT, pin TEXT, access_valid_from TEXT, access_valid_until TEXT,
      guest_count INTEGER, guest_email TEXT, guest_phone TEXT, guest_lang TEXT, guest_lang_override TEXT,
      bentral_arrival TEXT, bentral_departure TEXT, bentral_status TEXT, bentral_unit_id TEXT, bentral_unit_name TEXT,
      bentral_updated_at TEXT, bentral_created_at TEXT, bentral_paired_reservation_id TEXT,
      bentral_paired_unit_id TEXT, bentral_paired_unit_name TEXT, created_at TEXT, updated_at TEXT
    );
    CREATE TABLE jobs (
      id INTEGER PRIMARY KEY, reservation_id INTEGER, action TEXT, status TEXT, triggered_by TEXT, payload TEXT,
      result TEXT, reason TEXT, created_at TEXT, updated_at TEXT, attempt_count INTEGER DEFAULT 0, lease_expires_at TEXT
    );
    CREATE TABLE guest_tokens (id INTEGER PRIMARY KEY, reservation_id INTEGER, token TEXT, expires_at TEXT, created_at TEXT);
    CREATE TABLE audit_log (id INTEGER PRIMARY KEY, user_id INTEGER, user_email TEXT, action TEXT, detail TEXT, created_at TEXT);
    CREATE TABLE integration_outbox (
      id INTEGER PRIMARY KEY, unique_key TEXT UNIQUE, type TEXT, payload TEXT, status TEXT DEFAULT 'pending',
      attempt_count INTEGER DEFAULT 0, next_attempt_at TEXT, last_error TEXT, created_at TEXT, updated_at TEXT, completed_at TEXT
    );
    INSERT INTO app_settings VALUES ('orchestrator_api_key', 'secret', '2026-08-01T00:00:00.000Z');
    INSERT INTO app_settings VALUES ('auto_publish_ekey', '1', '2026-08-01T00:00:00.000Z');
    INSERT INTO app_settings VALUES ('orchestrator_lease_minutes', '30', '2026-08-01T00:00:00.000Z');
    INSERT INTO app_settings VALUES ('orchestrator_max_attempts', '5', '2026-08-01T00:00:00.000Z');
    INSERT INTO reservations VALUES (
      1, 'R-1', 'Maple', 'Ana', 'Novak', '2026-08-02', '2026-08-05', 'active', NULL,
      '2026-08-02 13:00', '2026-08-05 11:30', NULL, NULL, NULL, NULL, NULL,
      NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-01', '2026-08-01'
    );
    INSERT INTO jobs VALUES (
      1, 1, 'insert', 'pending', 'test',
      '{"jobId":"R-1","action":"insert","door":"Maple","firstName":"Ana","lastName":"Novak","validFrom":"2026-08-02 13:00","validTo":"2026-08-05 11:30"}',
      NULL, NULL, '2026-08-01T10:00:00.000Z', NULL, 0, NULL
    );
  `)
}

describe('Orchestrator HTTP endpointa', () => {
  beforeEach(() => seedDb())

  it('vrne 401 brez pravilnega tokena', async () => {
    await expect(jobsHandler({ authorization: 'Bearer wrong' })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('prevzame opravilo, doda interni ID in lease', async () => {
    const response = await jobsHandler({ authorization: 'Bearer secret' })
    expect(response.jobs).toEqual([expect.objectContaining({ jobId: 'R-1', _internalJobId: 1, action: 'insert' })])
    expect(db.prepare('SELECT status, attempt_count, lease_expires_at FROM jobs WHERE id = 1').get()).toMatchObject({
      status: 'in_progress', attempt_count: 1,
    })
  })

  it('po poteku lease-a ponovno ponudi obtičano opravilo', async () => {
    db.prepare("UPDATE jobs SET status = 'in_progress', lease_expires_at = '2026-08-01T11:59:00.000Z'").run()
    const response = await jobsHandler({ authorization: 'Bearer secret' })
    expect(response.jobs).toHaveLength(1)
    expect(db.prepare('SELECT status, attempt_count FROM jobs WHERE id = 1').get()).toEqual({ status: 'in_progress', attempt_count: 1 })
  })

  it('po največjem številu poskusov opravilo ustavi kot failed', async () => {
    db.prepare("UPDATE app_settings SET value = '1' WHERE key = 'orchestrator_max_attempts'").run()
    db.prepare("UPDATE jobs SET status = 'in_progress', attempt_count = 1, lease_expires_at = '2026-08-01T11:59:00.000Z'").run()
    const response = await jobsHandler({ authorization: 'Bearer secret' })
    expect(response.jobs).toHaveLength(0)
    expect(db.prepare('SELECT status FROM jobs WHERE id = 1').get()).toEqual({ status: 'failed' })
  })

  it('administrator lahko neuspešno opravilo ročno vrne v vrsto', async () => {
    db.prepare("UPDATE jobs SET status = 'failed', attempt_count = 5, result = '{}'").run()
    expect(await retryHandler({ id: '1' })).toEqual({ success: true })
    expect(db.prepare('SELECT status, attempt_count, result FROM jobs WHERE id = 1').get()).toEqual({ status: 'pending', attempt_count: 0, result: null })
  })

  it('sprejme rezultat samo enkrat in ponovitev obravnava kot duplicate', async () => {
    await jobsHandler({ authorization: 'Bearer secret' })
    body = { results: [{ _internalJobId: 1, jobId: 'R-1', status: 'success', pin: '1234' }] }
    expect(await resultsHandler({ authorization: 'Bearer secret' })).toMatchObject({ processed: 1, duplicates: 0 })
    expect(await resultsHandler({ authorization: 'Bearer secret' })).toMatchObject({ processed: 0, duplicates: 1 })
    expect(db.prepare('SELECT pin FROM reservations WHERE id = 1').get()).toEqual({ pin: '1234' })
    expect(db.prepare('SELECT COUNT(*) count FROM guest_tokens').get()).toEqual({ count: 1 })
    expect(db.prepare('SELECT COUNT(*) count FROM integration_outbox').get()).toEqual({ count: 2 })
  })

  it('zavrne uspešen insert brez veljavnega štirimestnega PIN-a', async () => {
    await jobsHandler({ authorization: 'Bearer secret' })
    body = { results: [{ _internalJobId: 1, status: 'success' }] }
    await expect(resultsHandler({ authorization: 'Bearer secret' })).rejects.toMatchObject({ statusCode: 400 })
    expect(db.prepare('SELECT status FROM jobs WHERE id = 1').get()).toEqual({ status: 'in_progress' })
  })

  it('ob napaki outbox zapisa atomsko povrne job, PIN in guest token', async () => {
    await jobsHandler({ authorization: 'Bearer secret' })
    db.exec("CREATE TRIGGER reject_outbox BEFORE INSERT ON integration_outbox BEGIN SELECT RAISE(ABORT, 'outbox unavailable'); END")
    body = { results: [{ _internalJobId: 1, status: 'success', pin: '1234' }] }
    await expect(resultsHandler({ authorization: 'Bearer secret' })).rejects.toThrow(/outbox unavailable/)
    expect(db.prepare('SELECT status FROM jobs WHERE id = 1').get()).toEqual({ status: 'in_progress' })
    expect(db.prepare('SELECT pin FROM reservations WHERE id = 1').get()).toEqual({ pin: null })
    expect(db.prepare('SELECT COUNT(*) count FROM guest_tokens').get()).toEqual({ count: 0 })
  })

  it('zabeleži neuspešen rezultat', async () => {
    await jobsHandler({ authorization: 'Bearer secret' })
    body = { results: [{ _internalJobId: 1, status: 'failed', reason: 'eKey unavailable' }] }
    expect(await resultsHandler({ authorization: 'Bearer secret' })).toMatchObject({ processed: 1 })
    expect(db.prepare('SELECT status, reason FROM jobs WHERE id = 1').get()).toEqual({ status: 'failed', reason: 'eKey unavailable' })
  })

  it('za dnevni izbris izbere samo dokazano upravljane MPAUTO kode', () => {
    db.prepare("UPDATE reservations SET pin = '1234', access_valid_until = '2026-07-31 11:00'").run()
    db.prepare("UPDATE jobs SET status = 'success'").run()
    db.prepare(`INSERT INTO reservations SELECT 2, 'R-2', door, 'Ročni', last_name, check_in, check_out, status, '9999', access_valid_from, '2026-07-31 11:00', guest_count, guest_email, guest_phone, guest_lang, guest_lang_override, bentral_arrival, bentral_departure, bentral_status, bentral_unit_id, bentral_unit_name, bentral_updated_at, bentral_created_at, bentral_paired_reservation_id, bentral_paired_unit_id, bentral_paired_unit_name, created_at, updated_at FROM reservations WHERE id = 1`).run()
    expect(queueExpiredManagedCodeCleanup('2026-08-01T12:00:00.000Z')).toBe(1)
    expect(db.prepare("SELECT reservation_id FROM jobs WHERE action = 'cancel'").all()).toEqual([{ reservation_id: 1 }])
  })

  it('outbox dokonča Bentral brez enot, email pa trajno obdrži za retry', async () => {
    db.prepare("UPDATE reservations SET guest_email = 'ana@example.com' WHERE id = 1").run()
    db.prepare(`INSERT INTO integration_outbox VALUES
      (1, 'email-1', 'guest_pin_email', '{"reservationId":1,"pin":"1234","portalLink":"https://portal.test/g"}', 'pending', 0, '2026-08-01T12:00:00.000Z', NULL, '2026-08-01', '2026-08-01', NULL),
      (2, 'bentral-1', 'bentral_ekey', '{"reservationId":1,"pin":"1234"}', 'pending', 0, '2026-08-01T12:00:00.000Z', NULL, '2026-08-01', '2026-08-01', NULL)
    `).run()
    expect(await processIntegrationOutbox('2026-08-01T12:00:00.000Z')).toEqual({ completed: 1, retried: 1, failed: 0 })
    expect(db.prepare("SELECT status, attempt_count FROM integration_outbox WHERE id = 1").get()).toEqual({ status: 'pending', attempt_count: 1 })
  })

  it('administrator lahko trajno neuspešno integracijo ponovno aktivira', async () => {
    db.prepare(`INSERT INTO integration_outbox VALUES (1, 'failed-1', 'bentral_ekey', '{}', 'failed', 12, '2026-08-01', 'error', '2026-08-01', '2026-08-01', NULL)`).run()
    expect(await retryOutboxHandler({ id: '1' })).toEqual({ success: true })
    expect(db.prepare('SELECT status, attempt_count, last_error FROM integration_outbox WHERE id = 1').get()).toEqual({ status: 'pending', attempt_count: 0, last_error: null })
  })

  it('watchdog opozori samo ob spremembi offline/online stanja', async () => {
    const future = new Date(Date.now() + 20 * 60_000)
    expect(await checkOrchestratorHealth(future)).toBe('offline')
    expect(db.prepare("SELECT value FROM app_settings WHERE key = 'orchestrator_health_state'").get()).toEqual({ value: 'offline' })
    expect(db.prepare("SELECT type FROM integration_outbox").all()).toEqual([{ type: 'admin_notification' }])
    db.prepare(`INSERT INTO app_settings VALUES ('orchestrator_last_seen', ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(future.toISOString(), future.toISOString())
    expect(await checkOrchestratorHealth(future)).toBe('online')
    expect(db.prepare("SELECT value FROM app_settings WHERE key = 'orchestrator_health_state'").get()).toEqual({ value: 'online' })
    expect(db.prepare("SELECT COUNT(*) count FROM integration_outbox").get()).toEqual({ count: 2 })
  })
})
