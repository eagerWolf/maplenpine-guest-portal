import Database from 'better-sqlite3'
import {expect,it,vi} from 'vitest'
const db=new Database(':memory:')
vi.mock('../server/db/index',async importOriginal=>({...await importOriginal<any>(),getDb:()=>db}))
vi.mock('node:fs',async importOriginal=>({...await importOriginal<any>(),mkdirSync:vi.fn(),copyFileSync:vi.fn()}))
vi.mock('../server/utils/whatsapp',()=>({getWhatsAppProvider:vi.fn()}))
vi.stubGlobal('defineNitroPlugin',(fn:any)=>fn)
it('fresh installation seeds reviewed seasons, translations and restaurant locations without overwriting later edits',async()=>{
 const init=(await import('../server/plugins/00.db-init')).default
 try {
  init({} as any)
  expect(db.prepare('SELECT COUNT(*) n FROM suggestions').get()).toEqual({n:19})
  const riding=db.prepare('SELECT title FROM suggestions WHERE id=14').get() as any
  expect(JSON.parse(riding.title).sl).toBe('Blejske konjeniške pustolovščine: Jahanje v naravi')
  expect(db.prepare('SELECT active,website FROM restaurants WHERE id=8').get()).toEqual({active:1,website:null})
  expect(db.prepare('SELECT COUNT(*) n FROM restaurants WHERE location_id IS NOT NULL').get()).toEqual({n:10})
  expect(db.prepare('SELECT recurring,valid_from,valid_to FROM faq_items WHERE id=7').get()).toEqual({recurring:1,valid_from:'05-01',valid_to:'10-31'})
  expect(db.prepare('SELECT website_slug FROM suggestions WHERE id=6').get()).toEqual({website_slug:'vintgar-gorge'})
  db.prepare('UPDATE suggestions SET title=?,sort_order=99 WHERE id=14').run('host edit')
  init({} as any)
  expect(db.prepare('SELECT title FROM suggestions WHERE id=14').get()).toEqual({title:'host edit'})
  expect(db.prepare('SELECT COUNT(*) n FROM locations').get()).toEqual({n:11})
 }finally{db.close()}
})
