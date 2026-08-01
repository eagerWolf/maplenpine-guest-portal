import { randomBytes } from 'node:crypto'
import { getDb, now, today } from '../db/index'
import { getTwilioConfig, getWhatsAppProvider } from './whatsapp'
import { getPaymentProvider } from './payment/index'
import { notifyAdmins } from './notify'
import { getEmailConfig, sendEmail } from './email'
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

export interface BreakfastProvider {
  id: number
  name: string
  contact_email: string | null
  whatsapp: string | null
  breakfast_enabled: number
  breakfast_cost: number
  breakfast_margin: number
  breakfast_cutoff_hour: number
  breakfast_jan1_note: string | null
  breakfast_min_count: number
  breakfast_max_count: number
  breakfast_exceptions: string
}

export interface BreakfastException { date: string; recurring: boolean }

export function getBreakfastProviders(activeOnly = true): BreakfastProvider[] {
  const db = getDb()
  return db.prepare(`
    SELECT id, name, contact_email, whatsapp, breakfast_enabled, breakfast_cost,
           breakfast_margin, breakfast_cutoff_hour, breakfast_jan1_note,
           breakfast_min_count, breakfast_max_count, breakfast_exceptions
    FROM partners
    WHERE category = 'breakfast' ${activeOnly ? 'AND active = 1 AND breakfast_enabled = 1' : ''}
    ORDER BY name
  `).all() as BreakfastProvider[]
}

export function getBreakfastSettings(partnerId?: number) {
  const db = getDb()
  const globallyEnabled = (db.prepare("SELECT value FROM app_settings WHERE key = 'breakfast_enabled'").get() as { value: string } | undefined)?.value === '1'
  const providers = getBreakfastProviders(true)
  const provider = partnerId ? providers.find(item => item.id === partnerId) : providers[0]
  const partnerCost = provider?.breakfast_cost ?? 0
  const margin = provider?.breakfast_margin ?? 0

  return {
    enabled: globallyEnabled && getTwilioConfig().configured && Boolean(provider),
    providerId: provider?.id ?? null,
    providerName: provider?.name ?? '',
    partnerCost,
    margin,
    pricePerPerson: partnerCost + margin,
    partnerWhatsapp: provider?.whatsapp ?? '',
    partnerEmail: provider?.contact_email ?? '',
    orderCutoffHour: provider?.breakfast_cutoff_hour ?? 18,
    jan1Note: provider?.breakfast_jan1_note || 'Naročilo za 1. januar ni možno, ker partner ta dan ne obratuje.',
    minCount: provider?.breakfast_min_count ?? 2,
    maxCountFallback: provider?.breakfast_max_count ?? 8,
    exceptions: provider ? parseBreakfastExceptions(provider.breakfast_exceptions) : [],
  }
}

export function parseBreakfastExceptions(value: string | null | undefined): BreakfastException[] {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.date === 'string') : []
  } catch { return [] }
}

export function generateExceptionNotes(dates: string[]): Record<'en' | 'sl' | 'de' | 'hr' | 'sr', string> {
  const unique = [...new Set(dates)].sort()
  const locales = { en: 'en-GB', sl: 'sl-SI', de: 'de-DE', hr: 'hr-HR', sr: 'sr-Latn-RS' } as const
  const prefix = {
    en: 'Breakfast delivery is not available on:',
    sl: 'Dostava zajtrka ni mogoča na:',
    de: 'An folgenden Tagen ist keine Frühstückslieferung möglich:',
    hr: 'Dostava doručka nije moguća na:',
    sr: 'Dostava doručka nije moguća na:',
  }
  return Object.fromEntries(Object.entries(locales).map(([lang, locale]) => {
    const formatted = unique.map(date => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00Z`)))
    return [lang, `${prefix[lang as keyof typeof prefix]} ${formatted.join(', ')}.`]
  })) as Record<'en' | 'sl' | 'de' | 'hr' | 'sr', string>
}

export function generateBreakfastToken(): string {
  return randomBytes(24).toString('hex')
}

export function computeAvailableDates(opts: {
  checkIn: string
  checkOut: string
  orderCutoffHour: number
  exceptions?: BreakfastException[]
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

    const isException = (opts.exceptions ?? []).some(exception => exception.recurring ? cur.slice(5) === exception.date.slice(-5) : cur === exception.date)
    if (isException) {
      results.push({ date: cur, disabled: true, reason: 'exception' })
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
  const [y = NaN, m = NaN, d = NaN] = dateStr.split('-').map(Number)
  if (![y, m, d].every(Number.isFinite)) throw new Error(`Neveljaven datum: ${dateStr}`)
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

  const settings = getBreakfastSettings(order.partner_id ?? undefined)
  const config = useRuntimeConfig()
  const emailConfig = getEmailConfig()
  const baseUrl = (config.public.baseUrl as string) || 'http://localhost:3000'
  const confirmationUrl = `${baseUrl}/partner/breakfast/${order.partner_confirmation_token}`
  const message = buildPartnerMessage(order, confirmationUrl)

  const ts = now()

  const recipientWhatsapp = settings.partnerWhatsapp

  if (!recipientWhatsapp) throw new Error('Partner WhatsApp ni nastavljen')

  const deliveries: Promise<unknown>[] = [getWhatsAppProvider().send(recipientWhatsapp, message)]
  if (settings.partnerEmail && emailConfig.configured) {
    deliveries.push(sendEmail({
      apiKey: emailConfig.apiKey,
      from: emailConfig.from,
      to: settings.partnerEmail,
      subject: `Novo naročilo zajtrka – ${order.apartment}`,
      html: `<h2>Novo naročilo zajtrka</h2><p>${message.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br>')}</p><p><a href="${confirmationUrl}">Potrdi ali zavrni naročilo</a></p>`,
    }))
  }

  const results = await Promise.allSettled(deliveries)
  const failures = results.filter(result => result.status === 'rejected') as PromiseRejectedResult[]
  if (failures.length) {
    throw new Error(failures.map(result => result.reason instanceof Error ? result.reason.message : String(result.reason)).join('; '))
  }

  await notifyAdmins({
    event: 'breakfast_order',
    subject: `Novo naročilo zajtrka – ${order.apartment}`,
    emailHtml: `<h2>Novo plačano naročilo zajtrka</h2><p>${message.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br>')}</p>`,
    whatsappText: `Novo plačano naročilo zajtrka:\n\n${message}`,
  })

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
