import { apiGet, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Customer, CustomerDetail } from '@/lib/types'

// Unlike bookings/rentals/transfers, both customer endpoints sit behind the
// "admin" role (not just the tenant X-API-Key) — a staff token gets a 403.
// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listCustomers(page: number, limit = 20) {
  const token = await requireToken()
  const res = await apiGet<Customer[] | null>('/admin/customers', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

export async function getCustomer(id: string) {
  const token = await requireToken()
  return apiGet<CustomerDetail>(`/admin/customers/${id}`, undefined, token)
}

// Bookings/rentals/transfers only store a customer_id reference. Resolving a
// display name means pulling a page of customers and matching by id
// client-side — and since that endpoint is admin-only, a staff token's 403
// is swallowed so those pages can still render (falling back to raw ids).
export async function buildCustomerNameMap(limit = 100): Promise<Record<string, string>> {
  try {
    const { data } = await listCustomers(1, limit)
    return Object.fromEntries(data.map((c) => [c.id, c.name]))
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) return {}
    throw err
  }
}

// Same admin-only constraint as above — booking/rental/transfer detail pages
// use this to show the customer's name/email/phone, falling back to null
// (and just the raw id) for a staff token (403) or a stale id (404).
export async function tryGetCustomer(id: string): Promise<CustomerDetail | null> {
  try {
    const { data } = await getCustomer(id)
    return data
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) return null
    throw err
  }
}
