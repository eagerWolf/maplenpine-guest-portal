import { timingSafeEqual } from 'node:crypto'

export interface OrchestratorResult {
  _internalJobId?: number
  jobId?: string
  status: 'success' | 'failed'
  pin?: string
  message?: string
  reason?: string
}

export function hasValidOrchestratorToken(configuredKey: string | undefined, authorization: string | undefined): boolean {
  const key = configuredKey?.trim()
  if (!key || !authorization?.startsWith('Bearer ')) return false
  const supplied = authorization.slice(7)
  const expectedBuffer = Buffer.from(key)
  const suppliedBuffer = Buffer.from(supplied)
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer)
}

export function parseOrchestratorResults(body: unknown): OrchestratorResult[] {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { results?: unknown }).results)) {
    throw new Error('Invalid payload')
  }
  return (body as { results: unknown[] }).results.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid result')
    const result = item as Record<string, unknown>
    if (result.status !== 'success' && result.status !== 'failed') throw new Error('Invalid result status')
    const internalId = result._internalJobId
    const jobId = result.jobId
    if ((!Number.isInteger(internalId) || Number(internalId) <= 0) && (typeof jobId !== 'string' || !jobId.trim())) {
      throw new Error('Result requires _internalJobId or jobId')
    }
    if (result.status === 'success' && result.pin !== undefined && (typeof result.pin !== 'string' || !/^\d{4}$/.test(result.pin))) {
      throw new Error('Invalid PIN')
    }
    return {
      _internalJobId: Number.isInteger(internalId) ? Number(internalId) : undefined,
      jobId: typeof jobId === 'string' ? jobId : undefined,
      status: result.status,
      pin: typeof result.pin === 'string' ? result.pin : undefined,
      message: typeof result.message === 'string' ? result.message : undefined,
      reason: typeof result.reason === 'string' ? result.reason : undefined,
    }
  })
}
