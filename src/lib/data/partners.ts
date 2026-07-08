import { apiGet } from '@/lib/api/client'
import type { Partner } from '@/lib/types'

// /partners returns `data: null` (not []) when the tenant has no partners
// yet — coalesce so list pages can render an empty table.
export async function listPartners(page: number, limit = 10) {
  const res = await apiGet<Partner[] | null>('/partners', { page, limit })
  return { ...res, data: res.data ?? [] }
}

// The public GET is slug-based; the admin PUT/DELETE take the Mongo id, which
// the fetched partner carries.
export function getPartnerBySlug(slug: string) {
  return apiGet<Partner>(`/partners/${slug}`)
}
