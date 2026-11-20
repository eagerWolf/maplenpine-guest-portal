import { describe, it, expect } from 'vitest'
import { resolveBentralDoor } from '../server/utils/bentralUnits'

describe('Bentral apartment mapping', () => {
  it('maps Pine only to Pine, Maple only to Maple and both explicitly', () => {
    expect(resolveBentralDoor([{ id: 'pine-id' }], 'maple-id', 'pine-id')).toBe('Pine')
    expect(resolveBentralDoor([{ id: 'maple-id' }], 'maple-id', 'pine-id')).toBe('Maple')
    expect(resolveBentralDoor([{ id: 'pine-id' }, { id: 'maple-id' }], 'maple-id', 'pine-id')).toBe('Maple,Pine')
  })
  it('never defaults unknown or absent units to Maple', () => {
    expect(resolveBentralDoor([{ id: 'unknown' }], 'maple-id', 'pine-id')).toBeNull()
    expect(resolveBentralDoor([], 'maple-id', 'pine-id')).toBeNull()
    expect(resolveBentralDoor([{ id: 'maple-id' }, { id: 'unknown' }], 'maple-id', 'pine-id')).toBeNull()
  })
  it('rejects missing or identical mapping IDs', () => {
    for (const [maple, pine] of [['', ''], ['maple', ''], ['', 'pine'], ['same', 'same']]) {
      expect(() => resolveBentralDoor([{ id: 'pine' }], maple!, pine!)).toThrow()
    }
  })
})
