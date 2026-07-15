import { apiGet, ApiError } from '@/lib/api/client'
import type { Partner } from '@/lib/types'

// Admin list/detail — full locale maps, active and inactive alike, unlike
// the public /partners endpoint (which resolves everything to one language
// via ?lang= and only returns active records).
export async function listPartners(page: number, limit = 10) {
  const res = await apiGet<Partner[] | null>('/admin/partners', { page, limit })
  return { ...res, data: res.data ?? [] }
}

export function getPartnerById(id: string) {
  return apiGet<Partner>(`/admin/partners/${id}`)
}

// The edit page is slug-routed; resolve slug -> record by scanning the admin
// list — same constraint as destinations.ts (fine at this scale, no
// partner-by-slug admin endpoint exists).
export async function getPartnerBySlug(slug: string): Promise<{ data: Partner }> {
  const { data } = await listPartners(1, 100)
  const partner = data.find((p) => p.slug === slug)
  if (!partner) throw new ApiError(404, 'partner not found')
  return { data: partner }
}
