import { apiGet } from '@/lib/api/client'
import type { TenantUser } from '@/lib/types'

// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listTenantUsers(page: number, limit = 20) {
  const res = await apiGet<TenantUser[] | null>('/admin/users', { page, limit })
  return { ...res, data: res.data ?? [] }
}
