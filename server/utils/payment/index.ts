export interface CreatePaymentOpts {
  orderId: number
  amount: number
  currency: string
  description: string
  returnUrl: string
}

export interface PaymentCreateResult {
  paymentId: string
  checkoutUrl: string
}

export interface PaymentStatusResult {
  id: string
  status: 'PENDING' | 'PAID' | 'FAILED'
  transactionCode?: string
}

export interface RefundResult {
  status: 'ok' | 'failed'
  message?: string
}

export interface PaymentProvider {
  createPayment(opts: CreatePaymentOpts): Promise<PaymentCreateResult>
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>
  refundPayment(opts: { transactionCode: string; amount: number }): Promise<RefundResult>
  validateWebhookSignature(rawBody: string, signature: string): boolean
}

import { SumUpProvider } from './sumup'

export function getPaymentProvider(providerName = 'sumup'): PaymentProvider {
  if (providerName === 'sumup') {
    return new SumUpProvider()
  }
  throw new Error(`Unknown payment provider: ${providerName}`)
}
