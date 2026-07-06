import Link from 'next/link'
import { listBookings } from '@/lib/data/bookings'
import { buildDestinationNameMap } from '@/lib/data/destinations'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { shortId } from '@/lib/format'
import type { Booking } from '@/lib/types'

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [{ data, meta }, destinationNames] = await Promise.all([listBookings(page, 10), buildDestinationNameMap(100)])

  const columns: Column<Booking>[] = [
    {
      header: 'Customer',
      render: (b) => (
        <Link href={`/bookings/${b.id}`} className="font-mono text-xs font-semibold hover:underline">
          {shortId(b.customer_id)}
        </Link>
      ),
    },
    { header: 'Tour', render: (b) => destinationNames[b.destination_id] ?? b.destination_id },
    { header: 'Date', render: (b) => new Date(b.travel_dates.start).toLocaleDateString() },
    { header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { header: 'Amount', align: 'right', render: (b) => `$${b.total_price_usd.toLocaleString()}` },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Bookings</h1>
        <p className="text-[13px] text-body mt-1">
          {meta?.total ?? data.length} bookings total. The API only exposes a customer id, not a name — shown as a
          short reference.
        </p>
      </div>
      <DataTable columns={columns} rows={data} getRowKey={(b) => b.id} meta={meta} basePath="/bookings" emptyMessage="No bookings yet." />
    </div>
  )
}
