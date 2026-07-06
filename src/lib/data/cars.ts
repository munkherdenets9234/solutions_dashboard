import { apiGet } from '@/lib/api/client'
import type { Car } from '@/lib/types'

export function listCars(page: number, limit = 10) {
  return apiGet<Car[]>('/cars', { page, limit })
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
