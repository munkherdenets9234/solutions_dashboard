import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { AirportTransfer } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listAirportTransfers(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<AirportTransfer[] | null>('/admin/airport-transfers', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getAirportTransfer(id: string) {
  const token = await requireToken()
  return apiGet<AirportTransfer>(`/admin/airport-transfers/${id}`, undefined, token)
}
