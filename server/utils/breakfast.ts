import { randomBytes } from 'node:crypto'
import { getDb, now, today } from '../db/index'
import { getWhatsAppProvider } from './whatsapp'
import { getPaymentProvider } from './payment/index'
import { useRuntimeConfig } from '#imports'

export interface PartnerOrder {
  id: number
  reservation_id: number
  guest_token: string
  partner_id: number | null
  guest_name: string
  guest_phone: string | null
  apartment: string
  selected_dates: string
  delivery_slot: string
  breakfast_count: number
  vegetarian_count: number
  gluten_free_count: number
  guest_notes: string | null
  partner_provision_per_unit: number
  margin_per_unit: number
  total_price: number
  status: string
  payment_provider: string
  payment_id: string | null
  payment_transaction_id: string | null
  payment_status: string | null
  refund_status: string | null
  partner_message: string | null
  partner_confirmation_token: string | null
  partner_confirmed_at: string | null
  partner_rejected_at: string | null
  sent_to_partner_at: string | null
  cancelled_at: string | null
  refunded_at: string | null
  created_at: string
  updated_at: string
}

export function getBreakfastSettings() {
  const db = getDb()
  const keys = [
    'breakfast_enabled',
    'breakfast_partner_cost',
    'breakfast_margin',
    'breakfast_partner_whatsapp',
    'breakfast_order_cutoff_hour',
    'breakfast_jan1_note',
    'breakfast_min_count',
    'breakfast_max_count_fallback',
  ]
  const rows = db.prepare(
    `SELECT key, value FROM app_settings WHERE key IN (${keys.map(() => '?').join(',')})`,
  ).all(...keys) as Array<{ key: string; value: string }>

  const m: Record<string, string> = {}
  rows.forEach(r => { m[r.key] = r.value })

  const partnerCost = parseFloat(m.breakfast_partner_cost ?? '12')
  const margin = parseFloat(m.breakfast_margin ?? '2')

  return {
    enabled: m.breakfast_enabled === '1',
    partnerCost,
    margin,
    pricePerPerson: partnerCost + margin,
    partnerWhatsapp: m.breakfast_partner_whatsapp ?? '',
    orderCutoffHour: parseInt(m.breakfast_order_cutoff_hour ?? '18'),
    jan1Note: m.breakfast_jan1_note || 'Naročilo za 1. januar ni možno, ker partner ta dan ne obratuje.',
    minCount: parseInt(m.breakfast_min_count ?? '2'),
    maxCountFallback: parseInt(m.breakfast_max_count_fallback ?? '8'),
  }
}

export function generateBreakfastToken(): string {
  return randomBytes(24).toString('hex')
}

export function computeAvailableDates(opts: {
  checkIn: string
  checkOut: string
  orderCutoffHour: number
}): { date: string; disabled: boolean; reason?: string }[] {
  const results: { date: string; disabled: boolean; reason?: string }[] = []
  const now = new Date()

  // Build date strings from UTC components to avoid timezone shifts
  const todayStr = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('-')

  const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  const tomorrowStr = tomorrowUTC.toISOString().slice(0, 10)

  // Local hour for cutoff (property is in Slovenia)
  const nowHour = now.getHours()

  // Iterate purely as date strings — no Date conversion, no timezone risk
  let cur = opts.checkIn
  while (cur <= opts.checkOut) {
    if (cur < todayStr) {
      cur = nextDay(cur)
      continue
    }

    if (cur.slice(5) === '01-01') {
      results.push({ date: cur, disabled: true, reason: 'jan1' })
      cur = nextDay(cur)
      continue
    }

    if (cur === tomorrowStr && nowHour >= opts.orderCutoffHour) {
      results.push({ date: cur, disabled: true, reason: 'cutoff' })
      cur = nextDay(cur)
      continue
    }

    // Today: delivery impossible same day
    if (cur === todayStr) {
      cur = nextDay(cur)
      continue
    }

    results.push({ date: cur, disabled: false })
    cur = nextDay(cur)
  }

  return results
}

function nextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return next.toISOString().slice(0, 10)
}

export function buildPartnerMessage(order: PartnerOrder, confirmationUrl: string): string {
  const selectedDates = JSON.parse(order.selected_dates) as string[]
  const dates = selectedDates.join(', ')
  const total = order.total_price.toFixed(2)
  const partnerTotal = (order.breakfast_count * selectedDates.length * order.partner_provision_per_unit).toFixed(2)
  const created = order.created_at.slice(0, 16).replace('T', ' ')

  return [
    '🍳 *Novo naročilo zajtrka*',
    '',
    `Apartma: ${order.apartment}`,
    `Gost: ${order.guest_name}`,
    `Telefon gosta: ${order.guest_phone ?? '—'}`,
    `Datumi dostave: ${dates}`,
    `Termin dostave: ${order.delivery_slot}`,
    `Število zajtrkov na dan: ${order.breakfast_count}`,
    `Vegetarijanski: ${order.vegetarian_count}`,
    `Brez glutena: ${order.gluten_free_count}`,
    `Opombe gosta: ${order.guest_notes || '—'}`,
    '',
    `Skupni znesek plačan: ${total} EUR`,
    `Vaš delež: ${partnerTotal} EUR`,
    `Čas naročila: ${created}`,
    '',
    'Prosim potrdite ali zavrnite naročilo tukaj:',
    confirmationUrl,
  ].join('\n')
}

export async function sendBreakfastToPartner(orderId: number): Promise<void> {
  const db = getDb()
  const order = db.prepare('SELECT * FROM partner_orders WHERE id = ?').get(orderId) as PartnerOrder | undefined
  if (!order) throw new Error(`Breakfast order ${orderId} not found`)

  const settings = getBreakfastSettings()
  const config = useRuntimeConfig()
  const baseUrl = (config.public.baseUrl as string) || 'http://localhost:3000'
  const confirmationUrl = `${baseUrl}/partner/breakfast/${order.partner_confirmation_token}`
  const message = buildPartnerMessage(order, confirmationUrl)

  const ts = now()

  const recipientWhatsapp = settings.partnerWhatsapp

  if (recipientWhatsapp) {
    const provider = getWhatsAppProvider()
    await provider.send(recipientWhatsapp, message)
  } else {
    console.warn('[breakfast] Partner WhatsApp not configured — message not sent')
  }

  db.prepare(
    'UPDATE partner_orders SET status = ?, partner_message = ?, sent_to_partner_at = ?, updated_at = ? WHERE id = ?',
  ).run('sent_to_partner', message, ts, ts, orderId)
}

export async function processRefund(orderId: number, reason: string): Promise<void> {
  const db = getDb()
  const order = db.prepare('SELECT * FROM partner_orders WHERE id = ?').get(orderId) as PartnerOrder | undefined
  if (!order) throw new Error('Order not found')
  if (!order.payment_transaction_id) throw new Error('No transaction ID — cannot refund')

  const ts = now()
  const provider = getPaymentProvider(order.payment_provider)
  const result = await provider.refundPayment({
    transactionCode: order.payment_transaction_id,
    amount: order.total_price,
  })

  if (result.status === 'ok') {
    db.prepare(
      'UPDATE partner_orders SET refund_status = ?, refunded_at = ?, updated_at = ? WHERE id = ?',
    ).run('completed', ts, ts, orderId)
  } else {
    db.prepare(
      'UPDATE partner_orders SET refund_status = ?, updated_at = ? WHERE id = ?',
    ).run('failed', ts, orderId)
    throw new Error(`Refund failed: ${result.message ?? 'unknown'}`)
  }
}

export async function isAdminGuestPreview(event: Parameters<typeof getUserSession>[0]): Promise<boolean> {
  const session = await getUserSession(event)
  return session.user?.role === 'admin'
}

export function validateGuestToken(token: string, allowExpired = false): { reservationId: number; reservation: import('../db/index').Reservation } {
  const db = getDb()
  const gt = db.prepare('SELECT * FROM guest_tokens WHERE token = ?').get(token) as { token: string; reservation_id: number; expires_at: string } | undefined
  if (!gt) throw createError({ statusCode: 404, statusMessage: 'Token ni veljaven' })
  if (!allowExpired && new Date(gt.expires_at) < new Date()) throw createError({ statusCode: 410, statusMessage: 'Token je potekel' })

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(gt.reservation_id) as import('../db/index').Reservation | undefined
  if (!reservation) throw createError({ statusCode: 404, statusMessage: 'Rezervacija ni najdena' })
  if (!allowExpired && reservation.check_out < today()) throw createError({ statusCode: 410, statusMessage: 'Dostop po odjavi ni več mogoč' })

  return { reservationId: gt.reservation_id, reservation }
}
