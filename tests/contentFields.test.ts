import Database from 'better-sqlite3'
import {afterEach,beforeEach,expect,it,vi} from 'vitest'
import {optionalContentText,optionalContentUrl} from '../server/utils/contentFields'
let db:Database.Database
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
const patch=(await import('../server/api/admin/suggestions/[id].patch')).default
const localized={sl:'Soteska Vintgar',en:'Vintgar Gorge',de:'Vintgar-Klamm',hr:'Sutjeska Vintgar',sr:'Klisura Vintgar'}
beforeEach(()=>{
 db=new Database(':memory:')
 db.exec('CREATE TABLE suggestions(id INTEGER PRIMARY KEY,title TEXT,description TEXT,buttons TEXT,recurring INTEGER,valid_from TEXT,valid_to TEXT,active INTEGER,sort_order INTEGER,website_slug TEXT,youtube_url TEXT,updated_at TEXT)')
 db.prepare('INSERT INTO suggestions VALUES(1,?,?,NULL,0,NULL,NULL,1,0,NULL,NULL,NULL)').run(JSON.stringify(localized),JSON.stringify(localized))
 vi.stubGlobal('requireUserSession',async()=>({user:{id:1,role:'admin'}}))
 vi.stubGlobal('getRouterParam',()=> '1')
})
afterEach(()=>db.close())
it('saves an existing suggestion when optional fields are null, preserving edits instead of returning 500',async()=>{
 vi.stubGlobal('readBody',async()=>({title:{...localized,sl:'Odkrijte sotesko Vintgar: Naravni čudež blizu Bleda'},website_slug:null,youtube_url:null}))
 expect(await patch({} as any)).toEqual({success:true})
 const row=db.prepare('SELECT title,website_slug,youtube_url FROM suggestions').get() as any
 expect(JSON.parse(row.title).sl).toContain('sotesko Vintgar')
 expect(row.website_slug).toBeNull();expect(row.youtube_url).toBeNull()
})
it('rejects wrong optional field types with a useful 400 error and no partial write',async()=>{
 vi.stubGlobal('readBody',async()=>({website_slug:23}))
 await expect(patch({} as any)).rejects.toMatchObject({statusCode:400})
 expect(db.prepare('SELECT website_slug FROM suggestions').get()).toEqual({website_slug:null})
})
it('accepts empty fields, validates URLs and rejects unsafe schemes',()=>{
 expect(optionalContentText(null,'Oznaka')).toBeNull()
 expect(optionalContentUrl('https://www.vintgar.si/','Povezava')).toBe('https://www.vintgar.si/')
 for(const value of ['javascript:alert(1)',123,'not a URL'])expect(()=>optionalContentUrl(value,'Povezava')).toThrow('Povezava')
})
