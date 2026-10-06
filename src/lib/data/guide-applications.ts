import { apiGet } from '@/lib/api/client'
import { assertGuideId } from '@/lib/guide-ids.mjs'
import type { GuideApplication, GuideCounts, GuideFileLink } from '@/lib/types'

export interface GuideListParams {
  page: number
  limit: number
  status?: string
  q?: string
  language?: string
  region?: string
}

// All guide endpoints require the staff token. The Go backend serializes an
// empty result set as `null`, not `[]`.
export async function listGuideApplications(token: string, params: GuideListParams) {
  const res = await apiGet<GuideApplication[] | null>('/admin/guide-applications', { ...params }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getGuideApplication(token: string, id: string) {
  const safeId = assertGuideId(id)
  const res = await apiGet<GuideApplication>(`/admin/guide-applications/${safeId}`, undefined, token)
  return res.data
}

export async function guideCounts(token: string): Promise<GuideCounts> {
  const res = await apiGet<GuideCounts | null>('/admin/guide-applications/counts', undefined, token)
  return res.data ?? { new: 0, reviewing: 0, shortlisted: 0, rejected: 0, hired: 0 }
}

export async function guideFileLink(token: string, id: string, fileId: string) {
  const safeId = assertGuideId(id)
  const safeFileId = assertGuideId(fileId)
  const res = await apiGet<GuideFileLink>(
    `/admin/guide-applications/${safeId}/files/${safeFileId}`,
    undefined,
    token
  )
  return res.data
}
