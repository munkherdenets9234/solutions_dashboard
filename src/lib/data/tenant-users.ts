import { apiGet } from '@/lib/api/client'
import type { TenantUser } from '@/lib/types'

export function listTenantUsers(page: number, limit = 20) {
  return apiGet<TenantUser[]>('/admin/users', { page, limit })
}
