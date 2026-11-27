import {afterEach,expect,it,vi} from 'vitest'
const calls=vi.hoisted(()=>({health:vi.fn(),system:vi.fn(()=>({command:'none'}))}))
vi.mock('../server/utils/integrationOutbox',()=>({processIntegrationOutbox:vi.fn().mockResolvedValue({})}))
vi.mock('../server/utils/secretSettings',()=>({getSettingValue:()=> 'watchdog-token'}))
vi.mock('../server/utils/workerWatchdog',()=>({reportWorkerHealth:calls.health,reportSystemWatchdog:calls.system}))
vi.stubGlobal('getHeader',(event:any)=>event.auth)
vi.stubGlobal('readBody',async(event:any)=>event.body)
const health=(await import('../server/api/orchestrator/health.post')).default as any
const system=(await import('../server/api/orchestrator/watchdog.post')).default as any
afterEach(()=>vi.clearAllMocks())
it('both worker endpoints require the configured bearer token',async()=>{
  for(const endpoint of [health,system]) await expect(endpoint({body:{}})).rejects.toMatchObject({statusCode:401})
  expect(calls.health).not.toHaveBeenCalled();expect(calls.system).not.toHaveBeenCalled()
})
it('rejects invalid readiness and arbitrary remote actions',async()=>{
  await expect(health({auth:'Bearer watchdog-token',body:{ready:true,reason:'desktop_unavailable'}})).rejects.toMatchObject({statusCode:400})
  await expect(system({auth:'Bearer watchdog-token',body:{bootId:'2026-11-27T10:00:00Z',busy:false,action:'run-command'}})).rejects.toMatchObject({statusCode:400})
  expect(calls.system).not.toHaveBeenCalled()
})
it('accepts a constrained Windows report and delegates the reboot decision to server state',async()=>{
  const body={bootId:'2026-11-27T10:00:00Z',busy:true}
  expect(await system({auth:'Bearer watchdog-token',body})).toEqual({command:'none'})
  expect(calls.system).toHaveBeenCalledWith(body)
})
