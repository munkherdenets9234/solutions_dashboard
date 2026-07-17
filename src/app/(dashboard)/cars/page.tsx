import Link from 'next/link'
import { listCars } from '@/lib/data/cars'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { buttonClass } from '@/components/admin/form'
import { safeLoad } from '@/lib/api/safe'
import type { Car } from '@/lib/types'

export default async function CarsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => listCars(page, 10))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<Car>[] = [
    { header: 'Name', render: (c) => <span className="font-semibold">{c.name}</span> },
    { header: 'Type', render: (c) => c.type ?? '—' },
    { header: 'Seats', render: (c) => c.seats ?? '—' },
    { header: 'Price/day', align: 'right', render: (c) => (c.price_per_day_usd != null ? `$${c.price_per_day_usd}` : '—') },
    { header: 'Last edited by', render: (c) => c.lastEditedBy ?? '—' },
    {
      header: '',
      align: 'right',
      render: (c) => (
        <Link href={`/cars/${c.slug}/edit`} className="text-xs font-semibold text-body hover:underline">
          Edit
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Cars</h1>
          <p className="text-[13px] text-body mt-1">{meta?.total ?? data.length} cars in the fleet.</p>
        </div>
        <Link href="/cars/new" className={buttonClass}>
          + New car
        </Link>
      </div>
      <DataTable columns={columns} rows={data} getRowKey={(c) => c.id} meta={meta} basePath="/cars" emptyMessage="No cars yet." />
    </div>
  )
}
