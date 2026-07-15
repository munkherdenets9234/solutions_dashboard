import { apiGet } from '@/lib/api/client'
import type { AirportTransfer } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listAirportTransfers(page: number, limit = 10) {
  const res = await apiGet<AirportTransfer[] | null>('/admin/airport-transfers', { page, limit })
  return { ...res, data: res.data ?? [] }
}

export function getAirportTransfer(id: string) {
  return apiGet<AirportTransfer>(`/admin/airport-transfers/${id}`)
}
