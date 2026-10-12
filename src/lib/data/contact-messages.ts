import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { ContactMessage } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listContactMessages(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<ContactMessage[] | null>('/admin/contact-messages', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}
