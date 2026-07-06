import { apiGet } from '@/lib/api/client'
import type { Destination } from '@/lib/types'

export function listDestinations(page: number, limit = 10) {
  return apiGet<Destination[]>('/destinations', { page, limit })
}

export function getDestinationBySlug(slug: string) {
  return apiGet<Destination>(`/destinations/${slug}`)
}

// Bookings only store a destination_id reference, and there is no
// get-destination-by-id endpoint (only by slug) — so resolving a display name
// means pulling a page of destinations and matching by id client-side.
export async function buildDestinationNameMap(limit = 100): Promise<Record<string, string>> {
  const { data } = await listDestinations(1, limit)
  return Object.fromEntries(data.map((d) => [d.id, d.name]))
}
