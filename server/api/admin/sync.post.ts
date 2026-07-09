import { syncBentral } from '../../utils/sync'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { tier } = await readBody<{ tier?: 'hot' | 'warm' | 'cold' }>(event)
  const syncTier = tier ?? 'hot'

  await syncBentral(syncTier, `manual:${session.user.email}`)

  return { success: true, tier: syncTier }
})
