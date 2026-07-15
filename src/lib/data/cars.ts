import { apiGet } from '@/lib/api/client'
import type { Car } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listCars(page: number, limit = 10) {
  const res = await apiGet<Car[] | null>('/cars', { page, limit })
  return { ...res, data: res.data ?? [] }
}

export function getCarBySlug(slug: string) {
  return apiGet<Car>(`/cars/${slug}`)
}

// Rentals only store a car_id reference — same limitation as destinations,
// no get-car-by-id endpoint, so resolve names from a bulk list fetch.
export async function buildCarNameMap(limit = 100): Promise<Record<string, string>> {
  const { data } = await listCars(1, limit)
  return Object.fromEntries(data.map((c) => [c.id, c.name]))
}
