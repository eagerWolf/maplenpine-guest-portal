// Suggestions can be bound to a date range that either repeats every year (recurring,
// stored as 'MM-DD', e.g. a Christmas market) or is a one-off window tied to a specific
// year (stored as 'YYYY-MM-DD', like the `news` valid_from/valid_to fields).
export function isActiveToday(
  validFrom: string | null,
  validTo: string | null,
  recurring: boolean,
  todayIso: string,
): boolean {
  if (!validFrom && !validTo) return true

  if (!recurring) {
    if (validFrom && todayIso < validFrom) return false
    if (validTo && todayIso > validTo) return false
    return true
  }

  const md = todayIso.slice(5) // 'MM-DD'
  const from = validFrom ?? '01-01'
  const to = validTo ?? '12-31'
  return from <= to ? (md >= from && md <= to) : (md >= from || md <= to)
}

const DATED_RE = /^\d{4}-\d{2}-\d{2}$/
const RECURRING_RE = /^\d{2}-\d{2}$/

// Validates and normalizes a suggestion's valid_from/valid_to pair against its `recurring` flag,
// throwing an H3 error on bad input. Returns the (possibly null) values to persist.
export function validateContentDates(
  validFrom: string | null | undefined,
  validTo: string | null | undefined,
  recurring: boolean,
): { validFrom: string | null; validTo: string | null } {
  const pattern = recurring ? RECURRING_RE : DATED_RE
  const formatHint = recurring ? 'MM-DD' : 'YYYY-MM-DD'

  for (const [label, value] of [['"Veljavno od"', validFrom], ['"Veljavno do"', validTo]] as const) {
    if (value !== null && value !== undefined && typeof value !== 'string') {
      throw createError({statusCode:400,statusMessage:`${label}: vnesite datum v obliki ${formatHint} ali pustite polje prazno.`})
    }
    if (value && !pattern.test(value)) {
      throw createError({ statusCode: 400, statusMessage: `${label} mora biti v obliki ${formatHint}` })
    }
    if(value) {
      const iso=recurring?`2000-${value}`:value
      const parsed=new Date(`${iso}T12:00:00Z`)
      if(!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10)!==iso)throw createError({statusCode:400,statusMessage:`${label}: datum ne obstaja.`})
    }
  }
  if (!recurring && validFrom && validTo && validFrom > validTo) {
    throw createError({ statusCode: 400, statusMessage: '"Veljavno od" mora biti pred "veljavno do"' })
  }
  return { validFrom: validFrom || null, validTo: validTo || null }
}

// Kept for compatibility with existing callers.
export const validateSuggestionDates = validateContentDates
