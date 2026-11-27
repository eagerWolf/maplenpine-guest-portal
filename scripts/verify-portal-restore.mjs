import { mkdtempSync, mkdirSync, cpSync, copyFileSync, readFileSync, writeFileSync, rmSync, existsSync, chmodSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseEnv } from 'node:util'
import { createHash, createDecipheriv } from 'node:crypto'
import { spawn } from 'node:child_process'
import Database from 'better-sqlite3'
import { createServer } from 'node:net'
const arg=name=>{const i=process.argv.indexOf(name);return i<0 ? undefined : process.argv[i+1]}
const snapshot=resolve(arg('--snapshot') || '')
const release=resolve(arg('--release') || '.output')
const port=Number(arg('--port') || '3099')
if(!arg('--snapshot') || !Number.isInteger(port) || port<1024 || port>65535)throw Error('Usage: --snapshot /private/snapshot --release /compatible/.output [--port 3099]')
const portProbe=createServer()
await new Promise((ok,fail)=>{portProbe.once('error',fail);portProbe.listen(port,'127.0.0.1',ok)})
await new Promise((ok,fail)=>portProbe.close(error=>error ? fail(error) : ok()))
const manifest=JSON.parse(readFileSync(join(snapshot,'manifest.json'),'utf8'))
const digest=f=>createHash('sha256').update(readFileSync(f)).digest('hex')
if(digest(join(snapshot,'portal.db'))!==manifest.databaseSha256 || digest(join(snapshot,'.env'))!==manifest.configSha256)throw Error('Snapshot checksum mismatch')
for(const [file,sha] of Object.entries(manifest.files || {})) {
 if(file.includes('..') || file.startsWith('/') || digest(join(snapshot,'files',file))!==sha)throw Error('Snapshot file checksum mismatch')
}
const root=mkdtempSync(join(tmpdir(),'maplenpine-restore-'));chmodSync(root,0o700)
let child,logs=''
try {
 mkdirSync(join(root,'data'),{mode:0o700})
 copyFileSync(join(snapshot,'portal.db'),join(root,'data/portal.db'))
 copyFileSync(join(snapshot,'.env'),join(root,'.env'))
 chmodSync(join(root,'.env'),0o600);chmodSync(join(root,'data/portal.db'),0o600)
 if(existsSync(join(snapshot,'files')))cpSync(join(snapshot,'files'),join(root,'data'),{recursive:true})
 const env=parseEnv(readFileSync(join(root,'.env'),'utf8'))
 const db=new Database(join(root,'data/portal.db'),{readonly:true})
 let encryptedSettings=0
 try {
  if(db.pragma('integrity_check',{simple:true})!=='ok')throw Error('Restored database integrity failure')
  for(const [table,count] of Object.entries(manifest.counts)) {
   const actual=db.prepare(`SELECT COUNT(*) AS n FROM "${table.replaceAll('"','""')}"`).get().n
   if(actual!==count)throw Error('Restored row count mismatch')
  }
  const key=env.NUXT_SETTINGS_ENCRYPTION_KEY?.trim()
  const rows=db.prepare("SELECT value FROM app_settings WHERE value LIKE 'enc:v1:%'").all()
  if(rows.length && !key)throw Error('Missing settings encryption key')
  for(const {value} of rows) {
   const [iv,tag,data]=value.slice(7).split(':')
   const decipher=createDecipheriv('aes-256-gcm',createHash('sha256').update(key).digest(),Buffer.from(iv,'base64'))
   decipher.setAuthTag(Buffer.from(tag,'base64'))
   Buffer.concat([decipher.update(Buffer.from(data,'base64')),decipher.final()]);encryptedSettings++
  }
 } finally {db.close()}
 // Every external scheduler and delivery path is disabled, including the new watchdog.
 const safe={NODE_ENV:'production',PORT:String(port),NITRO_PORT:String(port),NITRO_HOST:'127.0.0.1',HOST:'127.0.0.1',NUXT_PUBLIC_BASE_URL:`http://127.0.0.1:${port}`,PORTAL_DISABLE_BACKGROUND_TASKS:'true',PORTAL_BENTRAL_SYNC_ENABLED:'false',PORTAL_INTEGRATION_OUTBOX_ENABLED:'false',BENTRAL_GUEST_MESSAGES_ENABLED:'false',PORTAL_WHATSAPP_ENABLED:'false',PORTAL_EMAIL_ENABLED:'false',PORTAL_WORKER_WATCHDOG_ENABLED:'false',PORTAL_WORKER_ALERTS_ENABLED:'false'}
 child=spawn(process.execPath,[join(release,'server/index.mjs')],{cwd:root,env:{...process.env,...env,...safe},stdio:['ignore','pipe','pipe']})
 child.stdout.on('data',b=>{logs=(logs+b).slice(-10000)})
 child.stderr.on('data',b=>{logs=(logs+b).slice(-10000)})
 let spawnError=false;child.on('error',()=>{spawnError=true})
 let ready=false
 for(let i=0;i<60;i++) {
  if(spawnError || child.exitCode!==null)throw Error('Restored application failed to start (private logs withheld)')
  try {
   const res=await fetch(`http://127.0.0.1:${port}/login`,{signal:AbortSignal.timeout(1000)})
   if(res.status===200 && (await res.text()).includes('<html')){ready=true;break}
  } catch {}
  await new Promise(r=>setTimeout(r,500))
 }
 if(!ready)throw Error('Restored application did not become ready')
 const denied=await fetch(`http://127.0.0.1:${port}/api/orchestrator/watchdog`,{method:'POST',signal:AbortSignal.timeout(2000)})
 if(denied.status!==401)throw Error('Restored authentication guard failed')
 const proof={verifiedAt:new Date().toISOString(),integrity:'ok',checksumsMatch:true,countsMatch:true,encryptedSettingsVerified:encryptedSettings,loginHttp:200,unauthenticatedWatchdogHttp:401,host:'127.0.0.1',port,externalAutomationEnabled:false,releaseIndexSha256:digest(join(release,'server/index.mjs'))}
 writeFileSync(join(snapshot,'application-restore-verified.json'),JSON.stringify(proof,null,2),{mode:0o600})
 console.log(JSON.stringify(proof))
} finally {
 if(child && child.exitCode===null) {
  child.kill('SIGTERM')
  await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,5000))])
  if(child.exitCode===null)child.kill('SIGKILL')
 }
 rmSync(root,{recursive:true,force:true})
}
