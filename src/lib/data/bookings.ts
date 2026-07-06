import { apiGet } from '@/lib/api/client'
import type { Booking } from '@/lib/types'

export function listBookings(page: number, limit = 10) {
  return apiGet<Booking[]>('/admin/bookings', { page, limit })
}

export function getBooking(id: string) {
  return apiGet<Booking>(`/admin/bookings/${id}`)
}
