import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Rental } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listRentals(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<Rental[] | null>('/admin/rentals', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getRental(id: string) {
  const token = await requireToken()
  return apiGet<Rental>(`/admin/rentals/${id}`, undefined, token)
}
