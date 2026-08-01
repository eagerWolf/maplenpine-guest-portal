import { getDb, now } from '../../../../db/index'
import { processRefund, sendBreakfastToPartner, getBreakfastSettings } from '../../../../utils/breakfast'
import { getWhatsAppProvider } from '../../../../utils/whatsapp'
import type { PartnerOrder } from '../../../../utils/breakfast'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Ni dovoljenja' })

  const id = parseInt(getRouterParam(event, 'id') ?? '')
  const { action } = await readBody<{ action: 'cancel' | 'resend' }>(event)

  if (!action) throw createError({ statusCode: 400, statusMessage: 'Manjka akcija' })

  const db = getDb()
  const order = db.prepare('SELECT * FROM partner_orders WHERE id = ?').get(id) as PartnerOrder | undefined
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Naročilo ni najdeno' })

  const ts = now()

  if (action === 'cancel') {
    const cancellableStatuses = ['pending_payment', 'paid', 'sent_to_partner', 'confirmed_by_partner', 'payment_failed']
    if (!cancellableStatuses.includes(order.status)) {
      throw createError({ statusCode: 409, statusMessage: 'Naročila v tem stanju ni mogoče preklicati' })
    }

    db.prepare('UPDATE partner_orders SET status = ?, cancelled_at = ?, updated_at = ? WHERE id = ?')
      .run('cancelled', ts, ts, id)

    // Refund if paid
    const paidStatuses = ['paid', 'sent_to_partner', 'confirmed_by_partner']
    if (paidStatuses.includes(order.status) && order.payment_transaction_id) {
      try {
        await processRefund(id, 'Admin preklic')
        db.prepare('UPDATE partner_orders SET status = ?, updated_at = ? WHERE id = ?')
          .run('refunded', now(), id)
      } catch (err: any) {
        console.error('[admin:cancel] Refund failed:', err)
      }
    }

    // Notify partner if message was sent
    if (order.sent_to_partner_at) {
      const settings = getBreakfastSettings(order.partner_id ?? undefined)
      if (settings.partnerWhatsapp) {
        const msg = `⚠️ Naročilo zajtrka #${order.id} (${order.guest_name}, ${order.apartment}) je bilo preklicano.`
        try {
          await getWhatsAppProvider().send(settings.partnerWhatsapp, msg)
        } catch (err) {
          console.error('[admin:cancel] Failed to notify partner of cancellation:', err)
        }
      }
    }

    return { success: true }
  }

  if (action === 'resend') {
    if (!['paid', 'sent_to_partner'].includes(order.status)) {
      throw createError({ statusCode: 409, statusMessage: 'Znova je mogoče poslati samo plačana naročila' })
    }
    await sendBreakfastToPartner(id)
    return { success: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Neznana akcija' })
})
