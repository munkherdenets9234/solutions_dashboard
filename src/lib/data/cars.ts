import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Car } from '@/lib/types'

// The admin endpoints also return hidden cars (the public ones do not).
// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listCars(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<Car[] | null>('/admin/cars', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getCarBySlug(slug: string) {
  const token = await requireToken()
  return apiGet<Car>(`/admin/cars/${slug}`, undefined, token)
}

// Rentals only store a car_id reference — same limitation as destinations,
// no get-car-by-id endpoint, so resolve names from a bulk list fetch.
export async function buildCarNameMap(limit = 100): Promise<Record<string, string>> {
  const { data } = await listCars(1, limit)
  return Object.fromEntries(data.map((c) => [c.id, c.name]))
}
