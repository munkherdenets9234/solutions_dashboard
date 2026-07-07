import Link from 'next/link'
import { listDestinations } from '@/lib/data/destinations'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { buttonClass } from '@/components/admin/form'
import { safeLoad } from '@/lib/api/safe'
import type { Destination } from '@/lib/types'

export default async function ToursPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => listDestinations(page, 10))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<Destination>[] = [
    { header: 'Name', render: (d) => <span className="font-semibold">{d.name}</span> },
    { header: 'Region', render: (d) => d.region ?? '—' },
    { header: 'Duration', render: (d) => (d.duration_days ? `${d.duration_days} days` : '—') },
    { header: 'Status', render: (d) => <StatusBadge status={d.featured ? 'featured' : 'active'} /> },
    {
      header: '',
      align: 'right',
      render: (d) => (
        <Link href={`/tours/${d.slug}/edit`} className="text-xs font-semibold text-body hover:underline">
          Edit
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Tours</h1>
          <p className="text-[13px] text-body mt-1">
            Destinations shown here are the active ones the public site lists — the API has no admin view of
            deactivated tours.
          </p>
        </div>
        <Link href="/tours/new" className={buttonClass}>
          + New tour
        </Link>
      </div>

      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(d) => d.id}
        meta={meta}
        basePath="/tours"
        emptyMessage="No tours yet."
      />
    </div>
  )
}
