import { apiGet } from '@/lib/api/client'
import type { ContactMessage } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listContactMessages(page: number, limit = 10) {
  const res = await apiGet<ContactMessage[] | null>('/admin/contact-messages', { page, limit })
  return { ...res, data: res.data ?? [] }
}
