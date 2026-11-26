import {describe,it,expect} from 'vitest'
import {initialNewsTags,parseNewsTags,sortGuestNews} from '../shared/news'
const item=(id:number,tags:('bled'|'surroundings')[],end:string|null,recurring=0)=>({id,tags,valid_to:end,recurring,created_at:'2026-11-26'})
describe('guest news ordering and tags',()=>{
 it('prioritizes local news, then soonest ending notices, then undated content',()=>{
  const rows=[item(1,['surroundings'],'2026-11-27'),item(2,['bled'],null),item(3,['bled'],'2026-12-20'),item(4,['bled'],'2026-11-27')]
  expect(sortGuestNews(rows,'2026-11-26').map(n=>n.id)).toEqual([4,3,2,1])
  expect(rows[0]?.id).toBe(1)
 })
 it('handles recurring publication windows spanning the new year',()=>{
  expect(sortGuestNews([item(1,['bled'],'01-05',1),item(2,['bled'],'12-31',1)],'2026-12-20').map(n=>n.id)).toEqual([2,1])
 })
 it('uses deterministic newest IDs for equal publication dates',()=>expect(sortGuestNews([item(1,['bled'],null),item(2,['bled'],null)],'2026-11-26').map(n=>n.id)).toEqual([2,1]))
 it('validates and deduplicates editable tags',()=>{
  expect(parseNewsTags(['bled','bled','culture'])).toEqual(['bled','culture'])
  expect(parseNewsTags([])).toEqual([])
  for(const invalid of ['bled',null,['unknown'],[1]])expect(()=>parseNewsTags(invalid)).toThrow()
 })
 it('initializes existing regional events separately from local events',()=>{
  expect(initialNewsTags('Čarobna Kranjska Gora')).toContain('surroundings')
  expect(initialNewsTags('Bohinjski otepovci v Stari Fužini')).not.toContain('bled')
  expect(initialNewsTags('Oto Pestner in Big Band Bled')).toEqual(['bled','events','culture'])
 })
})
