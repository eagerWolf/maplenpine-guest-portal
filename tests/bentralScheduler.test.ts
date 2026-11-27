import { expect, it } from 'vitest'
import { createBentralScheduler } from '../server/utils/bentralScheduler'
import { validBentralInterval } from '../shared/bentralIntervals'

it('applies live intervals, covers narrower ranges and handles arbitrary hours', async () => {
  let time = 0
  const settings = { hot_interval_minutes: '30', warm_interval_hours: '5', cold_interval_hours: '25', auto_sync_bentral: '1' }
  const runs: string[] = []
  const tick = createBentralScheduler({ settings: () => settings, now: () => time, run: async tier => { runs.push(tier) } })
  await tick(true)
  time = 5 * 60_000
  await tick()
  expect(runs).toEqual(['hot'])
  settings.hot_interval_minutes = '5'
  await tick()
  expect(runs).toEqual(['hot', 'hot'])
  time = 5 * 3_600_000
  await tick()
  await tick()
  expect(runs).toEqual(['hot', 'hot', 'warm'])
  time = 25 * 3_600_000
  await tick()
  await tick()
  expect(runs.at(-1)).toBe('cold')
  expect(runs).toHaveLength(4)
  settings.auto_sync_bentral = '0'
  time += 30 * 3_600_000
  await tick()
  expect(runs).toHaveLength(4)
})

it('does not overlap a slow run or immediately retry a failed request', async () => {
  let time = 0
  let release!: () => void
  let calls = 0
  const tick = createBentralScheduler({ settings: () => ({ hot_interval_minutes: '5' }), now: () => time, run: async () => { calls++; await new Promise<void>(resolve => { release = resolve }) } })
  const first = tick(true)
  time = 10 * 60_000
  await tick()
  expect(calls).toBe(1)
  release()
  await first
  const failing = createBentralScheduler({ settings: () => ({ hot_interval_minutes: '5' }), now: () => time, run: async () => { throw new Error('offline') } })
  await expect(failing(true)).rejects.toThrow('offline')
  await expect(failing()).resolves.toBeUndefined()
})

it('rejects invalid interval input and accepts configured bounds', () => {
  for (const value of ['', '0', '4', '5.5', 'NaN', '121', 'Infinity']) expect(validBentralInterval('hot_interval_minutes', value)).toBe(false)
  expect(validBentralInterval('hot_interval_minutes', '5')).toBe(true)
  expect(validBentralInterval('cold_interval_hours', '168')).toBe(true)
  expect(validBentralInterval('cold_interval_hours', '169')).toBe(false)
})
