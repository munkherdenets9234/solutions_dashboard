import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { NewsletterSubscriber } from '@/lib/types'

// GET needs the admin token as well as the X-API-Key: subscriber emails are personal data.
// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listNewsletterSubscribers(page: number, limit = 20) {
  const token = await requireToken()
  const res = await apiGet<NewsletterSubscriber[] | null>('/admin/newsletter', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}
