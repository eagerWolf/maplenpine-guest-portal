import { vi } from 'vitest'

class TestHttpError extends Error {
  statusCode: number
  statusMessage: string
  constructor(input: { statusCode?: number; statusMessage?: string }) {
    super(input.statusMessage ?? 'HTTP error')
    this.statusCode = input.statusCode ?? 500
    this.statusMessage = input.statusMessage ?? 'HTTP error'
  }
}

vi.stubGlobal('createError', (input: { statusCode?: number; statusMessage?: string }) => new TestHttpError(input))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
