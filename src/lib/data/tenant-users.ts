import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { TenantUser } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listTenantUsers(page: number, limit = 20) {
  const token = await requireToken()
  const res = await apiGet<TenantUser[] | null>('/admin/users', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}
