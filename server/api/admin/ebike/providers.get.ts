import { getEbikeProviders } from '../../../utils/ebike'
export default defineEventHandler(async event => { const s=await requireUserSession(event); if(s.user.role!=='admin') throw createError({statusCode:403}); return {providers:getEbikeProviders(false).map(p=>({...p,rental_exceptions:JSON.parse(p.rental_exceptions||'[]')}))} })
