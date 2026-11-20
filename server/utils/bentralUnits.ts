export type BentralDoor = 'Maple' | 'Pine' | 'Maple,Pine'

export function validateBentralUnitIds(maple: string, pine: string): void {
  if (!maple.trim() || !pine.trim() || maple.trim() === pine.trim()) {
    throw new Error('Bentral requires distinct, non-empty unit IDs for Maple and Pine')
  }
}

export function resolveBentralDoor(units: Array<{ id: string }>, maple: string, pine: string): BentralDoor | null {
  validateBentralUnitIds(maple, pine)
  const ids = units.map(unit => unit.id)
  if (!ids.length || ids.some(id => id !== maple && id !== pine)) return null
  const hasMaple = ids.includes(maple)
  const hasPine = ids.includes(pine)
  return hasMaple && hasPine ? 'Maple,Pine' : hasMaple ? 'Maple' : hasPine ? 'Pine' : null
}
