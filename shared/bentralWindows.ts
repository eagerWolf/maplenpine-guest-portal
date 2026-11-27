export type BentralTier = 'hot' | 'warm' | 'cold'
function plus(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0,10)
}
export function bentralWindow(tier: BentralTier, today: string, oldestCurrentArrival?: string | null) {
  const recent = plus(today,-1)
  const hotEnd = plus(today,3)
  const warmEnd = plus(today,14)
  return {
    from: tier === 'cold' ? plus(today,15) : tier === 'warm' ? plus(today,4)
      : oldestCurrentArrival && oldestCurrentArrival < recent ? oldestCurrentArrival : recent,
    includes: (arrival: string, departure: string) => tier === 'hot'
      ? arrival <= hotEnd && departure >= recent
      : tier === 'warm' ? arrival > hotEnd && arrival <= warmEnd : arrival > warmEnd,
  }
}
