import { describe, expect, it } from 'vitest'
import type { Job, Reservation } from '../server/db/index'
import { buildAccessTimes, buildJobPayload, mergePendingJobs } from '../server/utils/jobs'

function job(id: number, action: string, created: string, payload: Record<string, unknown>): Job {
  return { id, reservation_id: 7, action, status: 'pending', triggered_by: 'test', payload: JSON.stringify(payload), result: null, reason: null, created_at: created, updated_at: null }
}

describe('eKey opravila', () => {
  it('združi več opravil iste rezervacije in ohrani najnovejše podatke', () => {
    const merged = mergePendingJobs([
      job(1, 'insert', '2026-01-01T10:00:00Z', { jobId: 'B-7', firstName: 'Ana', lastName: 'Novak', door: 'Maple' }),
      job(2, 'update', '2026-01-01T11:00:00Z', { jobId: 'B-7', firstName: 'Ana', lastName: 'Novak', door: 'Pine', validTo: '2026-01-05 11:00' }),
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.allJobIds).toEqual([1, 2])
    expect(merged[0]?.orchestratorJob).toMatchObject({ action: 'insert', door: 'Pine', validTo: '2026-01-05 11:00' })
  })
  it('preklic ima prednost pred ostalimi opravili', () => {
    const merged = mergePendingJobs([job(1, 'insert', '2026-01-01T10:00:00Z', {}), job(2, 'cancel', '2026-01-01T11:00:00Z', { firstName: 'Ana' })])
    expect(merged[0]?.orchestratorJob.action).toBe('cancel')
    expect(merged[0]?.orchestratorJob).not.toHaveProperty('door')
  })
  it('izdela payload rezervacije', () => {
    const reservation = { bentral_reservation_id: 'R1', first_name: 'Ana', last_name: 'Novak', door: 'Maple', access_valid_from: '2026-01-01 15:00', access_valid_until: '2026-01-03 11:00' } as Reservation
    expect(buildJobPayload(reservation, 'insert')).toMatchObject({ jobId: 'R1', action: 'insert', firstName: 'Ana', lastName: 'Novak', door: 'Maple' })
  })
  it('pravilno prestavi dostop čez polnoč', () => {
    expect(buildAccessTimes('2026-01-10', '2026-01-12', { bentral_checkin_time: '00:30', bentral_checkout_time: '23:30', checkin_offset_minutes: '-60', checkout_offset_minutes: '60' })).toEqual({ validFrom: '2026-01-09 23:30', validUntil: '2026-01-13 00:30' })
  })
})
