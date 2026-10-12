import { apiGet, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Partner } from '@/lib/types'

// Admin list/detail — full locale maps, active and inactive alike, unlike
// the public /partners endpoint (which resolves everything to one language
// via ?lang= and only returns active records).
export async function listPartners(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<Partner[] | null>('/admin/partners', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getPartnerById(id: string) {
  const token = await requireToken()
  return apiGet<Partner>(`/admin/partners/${id}`, undefined, token)
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
