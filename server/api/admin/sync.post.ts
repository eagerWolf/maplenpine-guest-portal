import { syncBentral } from '../../utils/sync'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })
  }

  const { tier } = await readBody<{ tier?: 'hot' | 'warm' | 'cold' }>(event)
  const syncTier = tier ?? 'hot'

  // Fire-and-forget — sync itself writes to audit_log on completion
  syncBentral(syncTier, `manual:${session.user.email}`).catch(err => console.error('[admin:sync]', err))

  return { success: true, tier: syncTier }
})
