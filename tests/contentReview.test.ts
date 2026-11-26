import Database from 'better-sqlite3'
import {expect,it} from 'vitest'
import {readFileSync} from 'node:fs'
// @ts-expect-error Standalone operator script is intentionally JavaScript.
import {applyContentReview} from '../scripts/apply-content-review.mjs'
const review=JSON.parse(readFileSync(new URL('../scripts/content-review-2026-11-26.json',import.meta.url),'utf8'))
function fixture() {
 const db=new Database(':memory:')
 for(const table of new Set<string>(review.patches.map((p:any)=>p.table))) {
  const rows=review.patches.filter((p:any)=>p.table===table)
  const fields=[...new Set<string>(rows.flatMap((p:any)=>Object.keys(p.expected)))]
  db.exec(`CREATE TABLE ${table}(id INTEGER PRIMARY KEY,${fields.map(k=>`${k}`).join(',')},updated_at TEXT${table==='restaurants'?',location_id INTEGER':''})`)
  for(const p of rows) {
   const keys=Object.keys(p.expected)
   db.prepare(`INSERT INTO ${table}(id,${keys.join(',')}) VALUES (?,${keys.map(()=>'?').join(',')})`).run(p.id,...Object.values(p.expected))
  }
 }
 db.exec('CREATE TABLE locations(id INTEGER PRIMARY KEY,name TEXT,country TEXT,address TEXT,google_maps_url TEXT,created_at TEXT)')
 return db
}
it('reviews all 61 entries with five-language copy and location links instead of directions',()=>{
 expect(review.patches).toHaveLength(61)
 for(const p of review.patches) {
  for(const key of ['title','description','text'])if(p.changes[key]) {
   const value=JSON.parse(p.changes[key])
   for(const lang of ['sl','en','de','hr','sr'])expect(value[lang]?.trim()).toBeTruthy()
  }
  for(const key of ['buttons','links'])for(const link of JSON.parse(p.changes[key] || '[]')) {
   for(const lang of ['sl','en','de','hr','sr'])expect(link.label[lang]?.trim()).toBeTruthy()
   expect(link.href).not.toMatch(/\/maps\/dir|[?&](saddr|daddr|origin|destination|travelmode)=/)
  }
 }
})
it('backs a repeatable selective update without touching unrelated records',()=>{
 const db=fixture()
 try {
  db.exec("INSERT INTO locations VALUES(99,'Bled','Slovenia',NULL,NULL,'original')")
  expect(applyContentReview(db,review)).toMatchObject({changed:61,locations:10,apply:false})
  expect(db.prepare('SELECT COUNT(*) n FROM locations').get()).toEqual({n:1})
  applyContentReview(db,review,{apply:true})
  expect(applyContentReview(db,review,{apply:true})).toMatchObject({changed:0,unchanged:61,locations:0})
  expect(db.prepare('SELECT name,created_at FROM locations WHERE id=99').get()).toEqual({name:'Bled',created_at:'original'})
 }finally{db.close()}
})
it('rejects concurrent edits atomically instead of overwriting an administrator',()=>{
 const db=fixture()
 try {
  db.prepare('UPDATE house_rules SET text=? WHERE id=2').run('new host instruction')
  const before=db.prepare('SELECT title FROM suggestions WHERE id=1').get()
  expect(()=>applyContentReview(db,review,{apply:true})).toThrow('Content changed since review')
  expect(db.prepare('SELECT title FROM suggestions WHERE id=1').get()).toEqual(before)
  expect(db.prepare('SELECT COUNT(*) n FROM locations').get()).toEqual({n:0})
 }finally{db.close()}
})
