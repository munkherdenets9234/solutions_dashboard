import { apiGet } from '@/lib/api/client'
import type { ContactMessage } from '@/lib/types'

export function listContactMessages(page: number, limit = 10) {
  return apiGet<ContactMessage[]>('/admin/contact-messages', { page, limit })
}
