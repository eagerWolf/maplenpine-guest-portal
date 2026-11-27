import Database from 'better-sqlite3'
import {afterEach,beforeEach,expect,it,vi} from 'vitest'
let db:Database.Database
let actor={id:1,email:'admin@test',role:'admin'}
vi.mock('../server/db/index',()=>({getDb:()=>db,now:()=>new Date().toISOString()}))
const remove=(await import('../server/api/admin/users/[id].delete')).default
beforeEach(()=>{
 db=new Database(':memory:');db.pragma('foreign_keys=ON')
 db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY,email TEXT,name TEXT,role TEXT,active INTEGER,portal_access INTEGER);
 INSERT INTO users VALUES(1,'admin@test','Admin','admin',1,1),(2,'cleaner@test','Ana','staff',1,0);
 CREATE TABLE cleaning_tasks(id INTEGER PRIMARY KEY,confirmed_by_user_id INTEGER,confirmed_by_name TEXT,confirmed_at TEXT);
 INSERT INTO cleaning_tasks VALUES(1,2,'Ana','2026-11-27T10:00:00Z');
 CREATE TABLE cleaning_assignments(token TEXT,user_id INTEGER REFERENCES users(id));INSERT INTO cleaning_assignments VALUES('private-link',2);
 CREATE TABLE password_reset_tokens(user_id INTEGER);INSERT INTO password_reset_tokens VALUES(2);
 CREATE TABLE auth_tokens(email TEXT);INSERT INTO auth_tokens VALUES('cleaner@test');
 CREATE TABLE audit_log(user_id INTEGER,user_email TEXT,action TEXT,detail TEXT,created_at TEXT);`)
 actor={id:1,email:'admin@test',role:'admin'}
 vi.stubGlobal('requireUserSession',async()=>({user:actor}));vi.stubGlobal('getRouterParam',()=> '2')
 vi.stubGlobal('createError',(e:any)=>Object.assign(new Error(e.statusMessage),{statusCode:e.statusCode}))
})
afterEach(()=>{db.close();vi.unstubAllGlobals()})
it('revokes links and authentication while retaining cleaning attribution and audit',async()=>{
 await remove({} as any)
 expect(db.prepare('SELECT id FROM users WHERE id=2').get()).toBeUndefined()
 expect(db.prepare('SELECT * FROM cleaning_tasks').get()).toEqual({id:1,confirmed_by_user_id:2,confirmed_by_name:'Ana',confirmed_at:'2026-11-27T10:00:00Z'})
 for(const table of ['cleaning_assignments','password_reset_tokens','auth_tokens']) expect(db.prepare(`SELECT * FROM ${table}`).all()).toEqual([])
 expect(db.prepare('SELECT action FROM audit_log').get()).toEqual({action:'remove_staff'})
})
it.each(['staff','cleaner'])('denies deletion to %s regardless of notification roles',async role=>{
 actor.role=role
 await expect(remove({} as any)).rejects.toMatchObject({statusCode:403})
 expect(db.prepare('SELECT id FROM users WHERE id=2').get()).toBeTruthy()
})
it('does not allow self deletion or deleting the last active administrator',async()=>{
 vi.stubGlobal('getRouterParam',()=> '1')
 await expect(remove({} as any)).rejects.toThrow('svojega računa')
 actor.id=99
 await expect(remove({} as any)).rejects.toThrow('Zadnjega aktivnega')
})
it('rolls back revocation and deletion if recording the audit fails',async()=>{
 db.exec("CREATE TRIGGER reject_audit BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'audit unavailable'); END;")
 await expect(remove({} as any)).rejects.toThrow('audit unavailable')
 expect(db.prepare('SELECT id FROM users WHERE id=2').get()).toBeTruthy()
 expect(db.prepare('SELECT * FROM cleaning_assignments').all()).toHaveLength(1)
})
