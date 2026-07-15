import { apiGet, ApiError } from '@/lib/api/client'
import { listCustomers } from '@/lib/data/customers'
import { listDestinations } from '@/lib/data/destinations'
import { listPartners } from '@/lib/data/partners'
import { localeText, type Review } from '@/lib/types'

// Admin list/detail — full locale maps, unlike the public /reviews endpoint
// (which resolves everything to one language via ?lang=). Also returns
// `data: null` (not []) when there are no reviews yet — coalesce so list
// pages can render an empty table. Supports filtering by related tour or partner.
export async function listReviews(page: number, limit = 10, filters?: { tour?: string; partner?: string }) {
  const res = await apiGet<Review[] | null>('/admin/reviews', { page, limit, tour: filters?.tour, partner: filters?.partner })
  return { ...res, data: res.data ?? [] }
}

export function getReviewById(id: string) {
  return apiGet<Review>(`/admin/reviews/${id}`)
}

export interface RefOption {
  value: string
  label: string
}

// Options for the partner form's featured-review dropdown. Unlike the
// review form's related_* fields, related_review stores the review's id, so
// the label carries the human-readable context.
export async function buildReviewOptions(limit = 100): Promise<RefOption[]> {
  const { data } = await listReviews(1, limit)
  return data.map((r) => {
    const reviewText = localeText(r.review)
    const excerpt = reviewText.length > 60 ? `${reviewText.slice(0, 60)}…` : reviewText
    return { value: r.id, label: `${'★'.repeat(r.star)} ${r.related_customer ?? 'Anonymous'} — ${excerpt}` }
  })
}

// Options for the review form's related_* dropdowns. Per the spec these
// fields are free-form references; the spec's own examples store the customer
// name ("Anna K."), the tour slug ("gobi-desert-5-days") and the partner name
// ("Nomad Camp LLC"), so that's what the option values use.
export async function loadReviewRefOptions(): Promise<{
  customers: RefOption[]
  tours: RefOption[]
  partners: RefOption[]
}> {
  const [customers, tours, partners] = await Promise.all([
    // /admin/customers needs the admin role — a staff token's 403 is
    // swallowed so the form still renders (with a free-text customer field).
    listCustomers(1, 100).then(
      ({ data }) => data.map((c) => ({ value: c.name, label: `${c.name} (${c.email})` })),
      (err) => {
        if (err instanceof ApiError && err.status === 403) return []
        throw err
      }
    ),
    listDestinations(1, 100).then(({ data }) => data.map((d) => ({ value: d.slug, label: d.name }))),
    listPartners(1, 100).then(({ data }) => data.map((p) => ({ value: p.name, label: p.name }))),
  ])
  return { customers, tours, partners }
}
