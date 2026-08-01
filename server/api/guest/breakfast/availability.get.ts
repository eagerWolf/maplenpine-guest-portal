import { getBreakfastProviders, getBreakfastSettings, computeAvailableDates, generateExceptionNotes, validateGuestToken } from '../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Manjka token' })

  const { reservation } = validateGuestToken(token)

  const requestedPartnerId = Number(getQuery(event).partnerId || 0) || undefined
  const settings = getBreakfastSettings(requestedPartnerId)
  const providers = getBreakfastProviders(true).map(provider => ({
    id: provider.id,
    name: provider.name,
    pricePerPerson: provider.breakfast_cost + provider.breakfast_margin,
  }))

  const dates = computeAvailableDates({
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    orderCutoffHour: settings.orderCutoffHour,
    exceptions: settings.exceptions,
  })

  const exceptionDates = dates.filter(d => d.reason === 'exception').map(d => d.date)
  const exceptionNotes = generateExceptionNotes(exceptionDates)
  const requestedLocale = String(getQuery(event).lang || 'en') as keyof typeof exceptionNotes
  const availableCount = dates.filter(d => !d.disabled).length

  return {
    enabled: settings.enabled,
    providerId: settings.providerId,
    providerName: settings.providerName,
    providers,
    dates,
    hasJan1Warning: exceptionDates.length > 0,
    jan1Note: exceptionNotes[requestedLocale] || exceptionNotes.en,
    exceptionNotes,
    pricePerPerson: settings.pricePerPerson,
    minCount: settings.minCount,
    maxCount: reservation.guest_count ?? settings.maxCountFallback,
    orderCutoffHour: settings.orderCutoffHour,
    availableCount,
    guestCount: reservation.guest_count,
  }
})
