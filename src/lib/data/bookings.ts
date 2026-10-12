import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Booking } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listBookings(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<Booking[] | null>('/admin/bookings', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getBooking(id: string) {
  const token = await requireToken()
  return apiGet<Booking>(`/admin/bookings/${id}`, undefined, token)
}
