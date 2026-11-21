import { getCleaningTask } from '../../../utils/staffNotifications'
import { enforceRateLimit } from '../../../utils/rateLimit'
export default defineEventHandler(event => {
  enforceRateLimit(event,'cleaning-view',60)
  setResponseHeader(event,'Cache-Control','no-store')
  setResponseHeader(event,'Referrer-Policy','no-referrer')
  const {task,canConfirm} = getCleaningTask(String(getRouterParam(event,'token') || ''))
  return {door:task.door,date:task.cleaning_date,confirmedAt:task.confirmed_at,canConfirm}
})
