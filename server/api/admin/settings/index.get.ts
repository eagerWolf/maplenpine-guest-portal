import { getSettings } from '../../../utils/jobs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }
  return {
    ...getSettings(),
    bentral_sync_available: process.env.PORTAL_DISABLE_BACKGROUND_TASKS !== 'true' || process.env.PORTAL_BENTRAL_SYNC_ENABLED === 'true' ? '1' : '0',
  }
})
