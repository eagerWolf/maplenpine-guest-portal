import Database from 'better-sqlite3'
import {readFileSync,mkdirSync,chmodSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {isDeepStrictEqual} from 'node:util'

const tables=new Set(['restaurants','suggestions','faq_items','howto_items','house_rules'])
const fields=new Set(['title','description','text','buttons','links','website','active','recurring','valid_from','valid_to','website_slug','youtube_url'])
function equal(a,b) {
 if(a===b)return true
 try{return isDeepStrictEqual(JSON.parse(a),JSON.parse(b))}catch{return false}
}
// An explicit review command, never an application startup migration.
export function applyContentReview(db,review,{apply=false}={}) {
 return db.transaction(()=>{
  let changed=0,unchanged=0,locations=0
  const plan=[]
  for(const patch of review.patches) {
   if(!tables.has(patch.table) || !Number.isInteger(patch.id))throw Error('Invalid review target')
   const row=db.prepare(`SELECT * FROM ${patch.table} WHERE id=?`).get(patch.id)
   if(!row)throw Error(`Missing ${patch.table}:${patch.id}`)
   const changes={}
   for(const [key,value] of Object.entries(patch.changes)) {
    if(!fields.has(key))throw Error('Invalid review field')
    if(equal(row[key],value))continue
    if(!Object.hasOwn(patch.expected,key) || !equal(row[key],patch.expected[key]))throw Error(`Content changed since review: ${patch.table}:${patch.id}:${key}`)
    changes[key]=value
   }
   if(Object.keys(changes).length) {plan.push({...patch,changes});changed++}else unchanged++
  }
  const locationPlan=[]
  for(const item of review.locations) {
   const row=db.prepare('SELECT location_id FROM restaurants WHERE id=?').get(item.restaurantId)
   if(!row)throw Error('Missing restaurant for location')
   if(row.location_id!==null) {
    const existing=db.prepare('SELECT name,address,google_maps_url FROM locations WHERE id=?').get(row.location_id)
    if(existing?.name===item.name && existing?.address===item.address && existing?.google_maps_url===item.google_maps_url)continue
    throw Error(`Restaurant location changed since review: ${item.restaurantId}`)
   }
   locationPlan.push(item);locations++
  }
  if(apply) {
   for(const patch of plan) {
    const keys=Object.keys(patch.changes)
    db.prepare(`UPDATE ${patch.table} SET ${keys.map(k=>`${k}=?`).join(',')},updated_at=? WHERE id=?`).run(...Object.values(patch.changes),new Date().toISOString(),patch.id)
   }
   for(const item of locationPlan) {
    let location=db.prepare('SELECT id FROM locations WHERE name=? AND address=? AND google_maps_url=?').get(item.name,item.address,item.google_maps_url)
    if(!location)location={id:db.prepare('INSERT INTO locations (name,country,address,google_maps_url,created_at) VALUES (?,\'Slovenia\',?,?,?)').run(item.name,item.address,item.google_maps_url,new Date().toISOString()).lastInsertRowid}
    db.prepare('UPDATE restaurants SET location_id=?,updated_at=? WHERE id=?').run(location.id,new Date().toISOString(),item.restaurantId)
   }
  }
  return {apply,changed,unchanged,locations}
 }).immediate()
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const review=JSON.parse(readFileSync(new URL('./content-review-2026-11-26.json',import.meta.url),'utf8'))
 const db=new Database(resolve('data/portal.db'),{fileMustExist:true})
 try {
  const preview=applyContentReview(db,review)
  console.log('Review:',JSON.stringify(preview))
  if(process.argv.includes('--apply')) {
   const folder=join('data','content-review-backups',new Date().toISOString().replace(/[:.]/g,'-'))
   mkdirSync(folder,{recursive:true,mode:0o700})
   await db.backup(join(folder,'portal.db'));chmodSync(join(folder,'portal.db'),0o600)
   console.log('Backup:',folder)
   console.log('Result:',JSON.stringify(applyContentReview(db,review,{apply:true})))
  }
 } finally {db.close()}
}
