import Database from 'better-sqlite3'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let db: Database.Database
vi.mock('../server/db/index', () => ({ getDb: () => db, today: () => '2026-10-20' }))
const headers = vi.fn()
vi.stubGlobal('setHeader', headers)
const { default: handler } = await import('../server/api/public/news.get')

beforeEach(() => {
  headers.mockClear()
  db = new Database(':memory:')
  db.exec(`CREATE TABLE news (id INTEGER, title TEXT, content TEXT, created_at TEXT,
    active INTEGER, valid_from TEXT, valid_to TEXT, recurring INTEGER, internal_note TEXT)`)
  const insert = db.prepare('INSERT INTO news VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  for (const [id, active, from, to, recurring] of [
    [1, 1, null, null, 0], [2, 0, null, null, 0],
    [3, 1, null, '2026-10-19', 0], [4, 1, '2026-10-21', null, 0],
    [5, 1, '10-01', '11-01', 1], [6, 1, '12-01', '01-31', 1],
  ]) insert.run(id, '{"en":"Hello","sl":"Pozdrav"}', '{"en":"Public news"}', '2026-10-01', active, from, to, recurring, 'PRIVATE')
})
afterEach(() => db.close())

it('serves only current published news without authentication or private columns', async () => {
  const result = await handler({} as never)
  expect(result.items.map(n => n.id)).toEqual([5, 1])
  expect(JSON.stringify(result)).not.toContain('PRIVATE')
  expect(Object.keys(result.items[0]).sort()).toEqual(
    ['id', 'title', 'content', 'createdAt', 'active', 'validFrom', 'validTo', 'recurring'].sort(),
  )
  expect(headers).toHaveBeenCalledWith({}, 'Access-Control-Allow-Origin', '*')
  expect(headers).toHaveBeenCalledWith({}, 'Cache-Control', 'no-store')
})
