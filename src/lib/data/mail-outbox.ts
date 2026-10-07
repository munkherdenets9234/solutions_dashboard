import { apiGet } from '@/lib/api/client'

// Whitelisted fields only — the backend masks `to`; nothing else is rendered.
export interface MailOutboxItem {
  id: string
  kind: string
  record_id: string
  to: string
  status: string
  attempts: number
  last_error: string
  created_at: string
  sent_at: string | null
}

export type MailStatusFilter = 'pending' | 'sent' | 'failed'

// Admin-role only (a staff token gets 403). The backend may serialize an
// empty list as `null`.
export async function listMailOutbox(token: string, page: number, limit: number, status?: MailStatusFilter) {
  const res = await apiGet<MailOutboxItem[] | null>('/admin/mail-outbox', { status, page, limit }, token)
  return { ...res, data: res.data ?? [] }
}
