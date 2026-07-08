import Link from 'next/link'
import { listReviews } from '@/lib/data/reviews'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { buttonClass } from '@/components/admin/form'
import { safeLoad } from '@/lib/api/safe'
import type { Review } from '@/lib/types'

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tour?: string; partner?: string }>
}) {
  const { page: pageParam, tour, partner } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => listReviews(page, 10, { tour, partner }))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<Review>[] = [
    { header: 'Rating', render: (r) => <span className="font-semibold">{'★'.repeat(r.star)}</span> },
    { header: 'Review', render: (r) => <span className="line-clamp-2">{r.review}</span> },
    { header: 'Customer', render: (r) => r.related_customer ?? '—' },
    { header: 'Tour', render: (r) => r.related_tour ?? '—' },
    { header: 'Partner', render: (r) => r.related_partner ?? '—' },
    {
      header: '',
      align: 'right',
      render: (r) => (
        <Link href={`/reviews/${r.id}/edit`} className="text-xs font-semibold text-body hover:underline">
          Edit
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Reviews</h1>
          <p className="text-[13px] text-body mt-1">
            Customer reviews shown on the public site, optionally linked to a tour or partner.
          </p>
        </div>
        <Link href="/reviews/new" className={buttonClass}>
          + New review
        </Link>
      </div>
      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(r) => r.id}
        meta={meta}
        basePath="/reviews"
        query={{ tour, partner }}
        emptyMessage="No reviews yet."
      />
    </div>
  )
}
