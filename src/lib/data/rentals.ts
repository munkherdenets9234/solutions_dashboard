import { apiGet } from '@/lib/api/client'
import type { Rental } from '@/lib/types'

export function listRentals(page: number, limit = 10) {
  return apiGet<Rental[]>('/admin/rentals', { page, limit })
}

export function getRental(id: string) {
  return apiGet<Rental>(`/admin/rentals/${id}`)
}
