import { listBookings } from '@/lib/data/bookings'
import { buildDestinationNameMap, listDestinations } from '@/lib/data/destinations'
import { listContactMessages } from '@/lib/data/contact-messages'
import { StatTile } from '@/components/admin/StatTile'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { safeLoad } from '@/lib/api/safe'
import { shortId } from '@/lib/format'
import type { Booking } from '@/lib/types'

function monthLabel(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short' })
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const result = await safeLoad(() =>
    Promise.all([
      listBookings(page, 10),
      listBookings(1, 100),
      listDestinations(1, 1),
      buildDestinationNameMap(100),
      listContactMessages(1, 100),
    ])
  )
  if (!result.ok) return <ErrorNotice message={result.message} />
  const [bookingsPage, sampleBookings, destinationsMeta, destinationNames, contactSample] = result.data

  const totalBookings = bookingsPage.meta?.total ?? sampleBookings.data.length
  const revenue = sampleBookings.data.reduce((sum, b) => sum + (b.total_price_usd ?? 0), 0)
  const activeTours = destinationsMeta.meta?.total ?? destinationsMeta.data.length
  const newInquiries = contactSample.data.filter((m) => m.status === 'new').length

  const buckets = new Map<string, number>()
  for (const b of sampleBookings.data) {
    const key = monthLabel(b.travel_dates?.start ?? b.created_at ?? new Date().toISOString())
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const maxBucket = Math.max(1, ...buckets.values())

  const columns: Column<Booking>[] = [
    { header: 'Customer', render: (b) => <span className="font-mono text-xs font-semibold">{shortId(b.customer_id)}</span> },
    { header: 'Tour', render: (b) => destinationNames[b.destination_id] ?? b.destination_id },
    { header: 'Date', render: (b) => new Date(b.travel_dates.start).toLocaleDateString() },
    { header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { header: 'Amount', align: 'right', render: (b) => `$${b.total_price_usd.toLocaleString()}` },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-body mt-1">Overview of bookings, revenue, and tour performance.</p>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <StatTile label="Total bookings" value={String(totalBookings)} />
        <StatTile label="Revenue (sampled)" value={`$${revenue.toLocaleString()}`} />
        <StatTile label="Active tours" value={String(activeTours)} />
        <StatTile label="New inquiries" value={String(newInquiries)} />
      </div>

      <div className="border border-hairline rounded-[10px] bg-panel p-5">
        <div className="font-bold text-[15px]">Bookings over time</div>
        <div className="text-xs text-muted mb-4">
          Sampled from the most recent 100 bookings — the API has no aggregate endpoint, so this is an approximation.
        </div>
        {buckets.size === 0 ? (
          <p className="text-sm text-muted">No bookings yet.</p>
        ) : (
          <div className="flex items-end gap-2.5 h-[140px]">
            {[...buckets.entries()].map(([label, count]) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-hairline rounded-t" style={{ height: `${(count / maxBucket) * 100}%` }} />
                <span className="text-[10px] text-muted font-mono uppercase">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3">
          <div className="font-bold text-[15px]">All bookings</div>
          <div className="text-xs text-muted mt-0.5">{bookingsPage.meta?.total ?? 0} bookings total</div>
        </div>
        <DataTable columns={columns} rows={bookingsPage.data} getRowKey={(b) => b.id} meta={bookingsPage.meta} basePath="/" />
      </div>
    </div>
  )
}
