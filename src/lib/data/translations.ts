import { apiGet } from '@/lib/api/client'
import type { TranslationEntry, TranslationPageSummary } from '@/lib/types'

// The translation routes sit behind the tenant admin token, so every call
// passes it explicitly.
export async function listTranslationPages(token: string) {
  const res = await apiGet<TranslationPageSummary[] | null>('/admin/translations', undefined, token)
  return res.data ?? []
}

export async function getTranslationPage(page: string, token: string) {
  const res = await apiGet<{ page: string; entries: TranslationEntry[] | null }>(
    `/admin/translations/${encodeURIComponent(page)}`,
    undefined,
    token
  )
  return { page: res.data.page, entries: res.data.entries ?? [] }
}
