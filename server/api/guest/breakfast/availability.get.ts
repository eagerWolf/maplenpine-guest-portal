import { getBreakfastSettings, computeAvailableDates, validateGuestToken } from '../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Manjka token' })

  const { reservation } = validateGuestToken(token)

  const settings = getBreakfastSettings()

  const dates = computeAvailableDates({
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    orderCutoffHour: settings.orderCutoffHour,
  })

  const hasJan1 = dates.some(d => d.reason === 'jan1')
  const availableCount = dates.filter(d => !d.disabled).length

  return {
    enabled: settings.enabled,
    dates,
    hasJan1Warning: hasJan1,
    jan1Note: settings.jan1Note,
    pricePerPerson: settings.pricePerPerson,
    minCount: settings.minCount,
    maxCount: reservation.guest_count ?? settings.maxCountFallback,
    orderCutoffHour: settings.orderCutoffHour,
    availableCount,
    guestCount: reservation.guest_count,
  }
})
