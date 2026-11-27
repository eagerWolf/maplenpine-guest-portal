import { expect,it } from 'vitest'
import { bentralWindow } from '../shared/bentralWindows'
it('assigns boundaries to exactly one tier, including long stays',()=>{
  for (const [arrival,expected] of [['2026-11-27','hot'],['2026-11-30','hot'],['2026-12-01','warm'],['2026-12-11','warm'],['2026-12-12','cold'],['2028-01-01','cold']]) {
    const matches = (['hot','warm','cold'] as const).filter(tier=>bentralWindow(tier,'2026-11-27').includes(arrival!,'2028-06-01'))
    expect(matches).toEqual([expected])
  }
})
it('keeps already checked-in guests in hot and excludes completed stays',()=>{
  const window = bentralWindow('hot','2026-11-27','2026-11-01')
  expect(window.from).toBe('2026-11-01')
  expect(window.includes('2026-11-01','2026-11-28')).toBe(true)
  expect(window.includes('2026-11-01','2026-11-20')).toBe(false)
  expect(bentralWindow('cold','2026-11-27').from).toBe('2026-12-12')
})
