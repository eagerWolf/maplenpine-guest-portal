import { triggerWebsitePublish } from '../../../utils/websiteContent'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403 })
  try { return await triggerWebsitePublish(session.user.email) }
  catch (error: any) { throw createError({ statusCode: 502, statusMessage: error?.message || 'Objave ni bilo mogoče sprožiti.' }) }
})
