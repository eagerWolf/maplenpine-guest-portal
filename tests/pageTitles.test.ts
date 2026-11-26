import {expect,it} from 'vitest'
import {portalPageTitle} from '../shared/pageTitles'
it('names admin pages and distinguishes test from production',()=>{
 expect(portalPageTitle('/admin/content/suggestions','sl','https://guesttest.maplenpine.com')).toBe('TEST · Predlogi za izlete | Maple & Pine')
 expect(portalPageTitle('/login','en','https://guest.maplenpine.com')).toBe('Prijava | Maple & Pine')
})
it('uses the guest language without exposing a reservation or capability token in titles',()=>{
 expect(portalPageTitle('/guest/private-token/info/restaurants','de','https://guest.maplenpine.com')).toBe('Restaurants | Maple & Pine')
 expect(portalPageTitle('/guest/private-token','sl','https://guest.maplenpine.com')).toBe('Vaše bivanje | Maple & Pine')
 expect(portalPageTitle('/cleaning/private-token','sl','https://guesttest.maplenpine.com')).toBe('TEST · Potrditev čiščenja | Maple & Pine')
})
