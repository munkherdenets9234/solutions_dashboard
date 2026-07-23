import { apiGet } from '@/lib/api/client'
import type { NewsletterSubscriber } from '@/lib/types'

// GET is X-API-Key only (no admin token needed to read).
// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listNewsletterSubscribers(page: number, limit = 20) {
  const res = await apiGet<NewsletterSubscriber[] | null>('/admin/newsletter', { page, limit })
  return { ...res, data: res.data ?? [] }
}
