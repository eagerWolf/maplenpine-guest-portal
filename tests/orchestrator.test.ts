import { describe, expect, it } from 'vitest'
import { hasValidOrchestratorToken, parseOrchestratorResults } from '../server/utils/orchestrator'

describe('Orchestrator API pogodba', () => {
  it('sprejme samo pravilen Bearer token', () => {
    expect(hasValidOrchestratorToken('secret', 'Bearer secret')).toBe(true)
    expect(hasValidOrchestratorToken('secret', 'Bearer wrong')).toBe(false)
    expect(hasValidOrchestratorToken('secret', undefined)).toBe(false)
    expect(hasValidOrchestratorToken('', 'Bearer secret')).toBe(false)
  })

  it('validira uspešen in neuspešen rezultat', () => {
    expect(parseOrchestratorResults({ results: [
      { _internalJobId: 12, jobId: 'R-1', status: 'success', pin: '1234' },
      { _internalJobId: 13, status: 'failed', reason: 'eKey unavailable' },
    ] })).toHaveLength(2)
  })

  it('zavrne neveljaven payload pred obdelavo', () => {
    expect(() => parseOrchestratorResults({ results: [{ status: 'other', jobId: 'R-1' }] })).toThrow()
    expect(() => parseOrchestratorResults({ results: [{ status: 'success' }] })).toThrow()
    expect(() => parseOrchestratorResults({})).toThrow()
    expect(() => parseOrchestratorResults({ results: [{ _internalJobId: 1, status: 'success', pin: '12ab' }] })).toThrow()
  })
})
