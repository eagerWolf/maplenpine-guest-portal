import Database from 'better-sqlite3'
import {mkdtempSync,mkdirSync,writeFileSync,readdirSync,readFileSync,rmSync,statSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {spawnSync} from 'node:child_process'
import {expect,it} from 'vitest'

it('backs up committed WAL data and restores the database and exact protected encryption configuration',()=>{
 const root=mkdtempSync(join(tmpdir(),'mp-backup-'))
 let db:Database.Database|undefined
 try {
  mkdirSync(join(root,'data/uploads'),{recursive:true});mkdirSync(join(root,'data/contracts'));writeFileSync(join(root,'data/uploads/image.txt'),'image fixture');writeFileSync(join(root,'data/contracts/contract.txt'),'private contract fixture')
  db=new Database(join(root,'data','portal.db'));db.pragma('journal_mode=WAL')
  db.exec("CREATE TABLE reservations(id INTEGER PRIMARY KEY,door TEXT); INSERT INTO reservations VALUES(1,'Pine'),(2,'Maple');")
  const config='NUXT_SETTINGS_ENCRYPTION_KEY=test-only-encryption-key\nPORTAL_DISABLE_BACKGROUND_TASKS=true\n'
  writeFileSync(join(root,'.env'),config)
  const result=spawnSync(process.execPath,[resolve('scripts/backup-portal.mjs'),'--verify-restore'],{cwd:root,env:{...process.env,PORTAL_BACKUP_ROOT:join(root,'snapshots')},encoding:'utf8'})
  expect(result.status,result.stderr).toBe(0)
  const snapshot=join(root,'snapshots',readdirSync(join(root,'snapshots'))[0]!)
  const restored=new Database(join(snapshot,'restore-check/data/portal.db'),{readonly:true})
  expect(restored.prepare('SELECT door FROM reservations ORDER BY id').all()).toEqual([{door:'Pine'},{door:'Maple'}]);restored.close()
  expect(readFileSync(join(snapshot,'restore-check/.env'),'utf8')).toBe(config)
  expect(readFileSync(join(snapshot,'restore-check/data/uploads/image.txt'),'utf8')).toBe('image fixture')
  expect(readFileSync(join(snapshot,'restore-check/data/contracts/contract.txt'),'utf8')).toBe('private contract fixture')
  expect(JSON.parse(readFileSync(join(snapshot,'restore-verified.json'),'utf8')).checksumMatch).toBe(true)
  if(process.platform!=='win32')expect(statSync(join(snapshot,'.env')).mode & 0o777).toBe(0o600)
 } finally {db?.close();rmSync(root,{recursive:true,force:true})}
})
