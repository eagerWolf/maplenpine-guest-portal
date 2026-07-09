import { createHmac } from 'node:crypto'
import { getDb } from '../../db/index'
import type { PaymentProvider, CreatePaymentOpts, PaymentCreateResult, PaymentStatusResult, RefundResult } from './index'

const SUMUP_BASE = 'https://api.sumup.com'

function getSumUpConfig() {
  const db = getDb()
  const rows = db.prepare(
    "SELECT key, value FROM app_settings WHERE key IN ('sumup_api_key','sumup_merchant_code','sumup_webhook_secret')",
  ).all() as Array<{ key: string; value: string }>
  const m: Record<string, string> = {}
  rows.forEach(r => { m[r.key] = r.value })
  return {
    apiKey: m.sumup_api_key ?? '',
    merchantCode: m.sumup_merchant_code ?? '',
    webhookSecret: m.sumup_webhook_secret ?? '',
  }
}

export class SumUpProvider implements PaymentProvider {
  async createPayment(opts: CreatePaymentOpts): Promise<PaymentCreateResult> {
    const cfg = getSumUpConfig()
    if (!cfg.apiKey || !cfg.merchantCode) {
      throw new Error('SumUp: API ključ ali merchant code ni nastavljen')
    }

    const res = await $fetch<{ id: string }>(`${SUMUP_BASE}/v0.1/checkouts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      body: {
        checkout_reference: `breakfast-${opts.orderId}`,
        amount: opts.amount,
        currency: opts.currency,
        merchant_code: cfg.merchantCode,
        description: opts.description,
        return_url: opts.returnUrl,
      },
    }).catch((err) => {
      console.error('[sumup] Checkout error:', JSON.stringify(err?.data ?? err?.message ?? err))
      throw err
    })

    return {
      paymentId: res.id,
      checkoutUrl: `https://checkout.sumup.com/p/${res.id}`,
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const cfg = getSumUpConfig()
    const res = await $fetch<{
      id: string
      status: string
      transactions?: Array<{ transaction_code: string; status: string }>
    }>(`${SUMUP_BASE}/v0.1/checkouts/${paymentId}`, {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
    })

    const txCode = res.transactions?.find(t => t.status === 'SUCCESSFUL')?.transaction_code

    return {
      id: res.id,
      status: res.status === 'PAID' ? 'PAID' : res.status === 'FAILED' ? 'FAILED' : 'PENDING',
      transactionCode: txCode,
    }
  }

  async refundPayment(opts: { transactionCode: string; amount: number }): Promise<RefundResult> {
    const cfg = getSumUpConfig()
    try {
      await $fetch(`${SUMUP_BASE}/v0.1/me/refund/${opts.transactionCode}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: opts.amount }),
      })
      return { status: 'ok' }
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? 'Neznana napaka'
      return { status: 'failed', message: msg }
    }
  }

  validateWebhookSignature(rawBody: string, signature: string): boolean {
    const cfg = getSumUpConfig()
    if (!cfg.webhookSecret) return true // Skip validation if not configured
    const expected = createHmac('sha256', cfg.webhookSecret).update(rawBody).digest('hex')
    return expected === signature
  }
}
