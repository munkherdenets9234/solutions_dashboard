import { apiGet } from '@/lib/api/client'
import type { AirportTransfer } from '@/lib/types'

export function listAirportTransfers(page: number, limit = 10) {
  return apiGet<AirportTransfer[]>('/admin/airport-transfers', { page, limit })
}

export function getAirportTransfer(id: string) {
  return apiGet<AirportTransfer>(`/admin/airport-transfers/${id}`)
}
