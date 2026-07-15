import { apiGet, ApiError } from '@/lib/api/client'
import type { Destination } from '@/lib/types'

// Admin list/detail — full locale maps, active and inactive alike, unlike
// the public /destinations endpoint (which resolves everything to one
// language via ?lang= and only returns active records).
// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listDestinations(page: number, limit = 10) {
  const res = await apiGet<Destination[] | null>('/admin/destinations', { page, limit })
  return { ...res, data: res.data ?? [] }
}

export function getDestinationById(id: string) {
  return apiGet<Destination>(`/admin/destinations/${id}`)
}

// The edit page is slug-routed; resolve slug -> record by scanning the admin
// list — same constraint as buildDestinationMap below (fine at this scale,
// no destination-by-slug admin endpoint exists).
export async function getDestinationBySlug(slug: string): Promise<{ data: Destination }> {
  const { data } = await listDestinations(1, 100)
  const destination = data.find((d) => d.slug === slug)
  if (!destination) throw new ApiError(404, 'destination not found')
  return { data: destination }
}

// Bookings only store a destination_id reference, so resolving a display
// name means pulling a page of destinations and matching by id client-side.
export async function buildDestinationNameMap(limit = 100): Promise<Record<string, string>> {
  const { data } = await listDestinations(1, limit)
  return Object.fromEntries(data.map((d) => [d.id, d.name]))
}

// Same constraint as above, but keeps the full destination record for pages
// that need more than just the name (region, duration, seasons, etc).
export async function buildDestinationMap(limit = 100): Promise<Record<string, Destination>> {
  const { data } = await listDestinations(1, limit)
  return Object.fromEntries(data.map((d) => [d.id, d]))
}
