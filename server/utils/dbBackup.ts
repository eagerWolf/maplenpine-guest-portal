import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { getDb } from '../db/index'

const RETAIN = 14

export async function backupDatabase(reference = new Date()): Promise<string> {
  const backupDir = join(process.cwd(), 'data', 'backups')
  mkdirSync(backupDir, { recursive: true })
  const day = reference.toISOString().slice(0, 10)
  const destination = join(backupDir, `portal-${day}.db`)
  if (!existsSync(destination) || statSync(destination).size === 0) await getDb().backup(destination)

  const backups = readdirSync(backupDir)
    .filter(name => /^portal-\d{4}-\d{2}-\d{2}\.db$/.test(name))
    .sort()
    .reverse()
  for (const old of backups.slice(RETAIN)) unlinkSync(join(backupDir, old))
  return destination
}
