import { apiGet } from '@/lib/api/client'
import type { Booking } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listBookings(page: number, limit = 10) {
  const res = await apiGet<Booking[] | null>('/admin/bookings', { page, limit })
  return { ...res, data: res.data ?? [] }
}

export function getBooking(id: string) {
  return apiGet<Booking>(`/admin/bookings/${id}`)
}
