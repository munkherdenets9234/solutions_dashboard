import Link from 'next/link'
import { listRentals } from '@/lib/data/rentals'
import { buildCarNameMap } from '@/lib/data/cars'
import { buildCustomerNameMap } from '@/lib/data/customers'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { shortId } from '@/lib/format'
import type { Rental } from '@/lib/types'

export default async function RentalsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [{ data, meta }, carNames, customerNames] = await Promise.all([
    listRentals(page, 10),
    buildCarNameMap(100),
    buildCustomerNameMap(100),
  ])

  const columns: Column<Rental>[] = [
    {
      header: 'Customer',
      render: (r) => (
        <Link href={`/rentals/${r.id}`} className="font-semibold hover:underline">
          {customerNames[r.customer_id] ?? shortId(r.customer_id)}
        </Link>
      ),
    },
    { header: 'Car', render: (r) => carNames[r.car_id] ?? r.car_id },
    { header: 'Mode', render: (r) => <span className="capitalize">{r.mode.replace('_', ' ')}</span> },
    { header: 'Pickup', render: (r) => new Date(r.pickup_date).toLocaleDateString() },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Rentals</h1>
        <p className="text-[13px] text-body mt-1">{meta?.total ?? data.length} rentals total.</p>
      </div>
      <DataTable columns={columns} rows={data} getRowKey={(r) => r.id} meta={meta} basePath="/rentals" emptyMessage="No rentals yet." />
    </div>
  )
}
