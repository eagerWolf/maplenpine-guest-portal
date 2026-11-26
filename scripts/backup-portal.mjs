import Database from 'better-sqlite3'
import { mkdirSync, copyFileSync, chmodSync, writeFileSync, readdirSync, rmSync, existsSync, cpSync, lstatSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// Run from the portal directory as its owner. Never invokes application integrations.
const root=resolve(process.env.PORTAL_BACKUP_ROOT || 'data/snapshots')
mkdirSync(root,{recursive:true,mode:0o700}); chmodSync(root,0o700)
const stamp=new Date().toISOString().replace(/[:.]/g,'-')
const destination=join(root,stamp)
mkdirSync(destination,{mode:0o700})
const source=new Database('data/portal.db',{fileMustExist:true})
try { await source.backup(join(destination,'portal.db')) } finally {source.close()}
chmodSync(join(destination,'portal.db'),0o600)
copyFileSync('.env',join(destination,'.env'));chmodSync(join(destination,'.env'),0o600)
const snapshot=new Database(join(destination,'portal.db'),{readonly:true})
let counts
try {
 if(snapshot.pragma('integrity_check',{simple:true})!=='ok')throw new Error('SQLite integrity check failed')
 counts=Object.fromEntries(snapshot.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(({name})=>[name,snapshot.prepare(`SELECT COUNT(*) AS n FROM "${name.replaceAll('"','""')}"`).get().n]))
} finally {snapshot.close()}
const files={}
function captureTree(directory,relative='') {
 for(const entry of readdirSync(directory,{withFileTypes:true})) {
  const name=relative ? relative+'/'+entry.name : entry.name
  const file=join(directory,entry.name)
  if(lstatSync(file).isSymbolicLink())throw new Error('Backup source contains a symbolic link')
  if(entry.isDirectory())captureTree(file,name)
  else if(entry.isFile())files[name]=createHash('sha256').update(readFileSync(file)).digest('hex')
 }
}
for(const name of ['uploads','contracts'])if(existsSync(join('data',name))) {
 const target=join(destination,'files',name)
 mkdirSync(target,{recursive:true,mode:0o700})
 cpSync(join('data',name),target,{recursive:true})
}
if(existsSync(join(destination,'files')))captureTree(join(destination,'files'))
const digest=file=>createHash('sha256').update(readFileSync(file)).digest('hex')
writeFileSync(join(destination,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),databaseSha256:digest(join(destination,'portal.db')),configSha256:digest(join(destination,'.env')),files,counts},null,2),{mode:0o600})
if(process.argv.includes('--verify-restore')) {
 const restored=join(destination,'restore-check')
 mkdirSync(join(restored,'data'),{recursive:true,mode:0o700})
 copyFileSync(join(destination,'portal.db'),join(restored,'data','portal.db'))
 copyFileSync(join(destination,'.env'),join(restored,'.env'))
 chmodSync(join(restored,'data','portal.db'),0o600);chmodSync(join(restored,'.env'),0o600)
 if(digest(join(restored,'data','portal.db'))!==digest(join(destination,'portal.db')) || digest(join(restored,'.env'))!==digest(join(destination,'.env')))throw new Error('Restore checksum mismatch')
 if(existsSync(join(destination,'files')))cpSync(join(destination,'files'),join(restored,'data'),{recursive:true})
 for(const [file,sha] of Object.entries(files))if(digest(join(restored,'data',file))!==sha)throw new Error('Restored file checksum mismatch')
 const db=new Database(join(restored,'data','portal.db'),{readonly:true})
 try {
  if(db.pragma('integrity_check',{simple:true})!=='ok')throw new Error('Restored database is invalid')
  for(const [name,count] of Object.entries(counts))if(db.prepare(`SELECT COUNT(*) AS n FROM "${name.replaceAll('"','""')}"`).get().n!==count)throw new Error('Restored table count mismatch')
 } finally {db.close()}
 writeFileSync(join(destination,'restore-verified.json'),JSON.stringify({verifiedAt:new Date().toISOString(),tables:Object.keys(counts).length,checksumMatch:true,files:Object.keys(files).length}),{mode:0o600})
 console.log('Restored database and protected configuration verified:',restored)
}
// Retain 30 completed snapshots; leave incomplete runs for inspection.
const complete=readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(e.name) && existsSync(join(root,e.name,'manifest.json'))).map(e=>e.name).sort().reverse()
for(const old of complete.slice(30))rmSync(join(root,old),{recursive:true})
console.log('Backup OK:',destination)
