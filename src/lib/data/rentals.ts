import { apiGet } from '@/lib/api/client'
import type { Rental } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listRentals(page: number, limit = 10) {
  const res = await apiGet<Rental[] | null>('/admin/rentals', { page, limit })
  return { ...res, data: res.data ?? [] }
}

export function getRental(id: string) {
  return apiGet<Rental>(`/admin/rentals/${id}`)
}
