import Link from 'next/link'
import { listBookings } from '@/lib/data/bookings'
import { buildDestinationNameMap } from '@/lib/data/destinations'
import { buildCustomerNameMap } from '@/lib/data/customers'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { inputClass, buttonClass, secondaryButtonClass } from '@/components/admin/form'
import { shortId } from '@/lib/format'
import type { Booking } from '@/lib/types'

const LIMIT = 10
// The API caps `limit` at 100 per request and has no search endpoint, so a
// query pages through up to this many records and filters in memory instead
// of paging server-side.
const SEARCH_MAX_RECORDS = 500
const API_PAGE_SIZE = 100

async function fetchAllBookingsForSearch(): Promise<Booking[]> {
  const first = await listBookings(1, API_PAGE_SIZE)
  const all = [...first.data]
  const total = Math.min(first.meta?.total ?? all.length, SEARCH_MAX_RECORDS)

  let page = 2
  while (all.length < total) {
    const next = await listBookings(page, API_PAGE_SIZE)
    if (next.data.length === 0) break
    all.push(...next.data)
    page += 1
  }

  return all
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q: qParam } = await searchParams
  const q = qParam?.trim() ?? ''
  const page = Math.max(1, Number(pageParam) || 1)

  const [destinationNames, customerNames] = await Promise.all([buildDestinationNameMap(100), buildCustomerNameMap(100)])

  let data: Booking[]
  let meta: { total: number; page: number; limit: number } | undefined

  if (q) {
    const allBookings = await fetchAllBookingsForSearch()
    const needle = q.toLowerCase()
    const filtered = allBookings.filter((b) => {
      const tourName = destinationNames[b.destination_id] ?? b.destination_id
      const customerName = customerNames[b.customer_id] ?? ''
      return (
        shortId(b.id).toLowerCase().includes(needle) ||
        b.id.toLowerCase().includes(needle) ||
        tourName.toLowerCase().includes(needle) ||
        customerName.toLowerCase().includes(needle) ||
        b.status.toLowerCase().includes(needle)
      )
    })
    meta = { total: filtered.length, page, limit: LIMIT }
    data = filtered.slice((page - 1) * LIMIT, page * LIMIT)
  } else {
    const result = await listBookings(page, LIMIT)
    data = result.data
    meta = result.meta
  }

  const columns: Column<Booking>[] = [
    {
      header: 'Customer',
      render: (b) => (
        <Link href={`/bookings/${b.id}`} className="font-semibold hover:underline">
          {customerNames[b.customer_id] ?? shortId(b.customer_id)}
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
          {meta?.total ?? data.length} bookings{q ? ' matching your search' : ' total'}. The API has no dedicated
          search endpoint — search covers booking id, tour, customer name, and status instead.
        </p>
      </div>

      <form action="/bookings" method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by booking ID, tour, or status…"
          className={inputClass}
        />
        <button type="submit" className={buttonClass}>
          Search
        </button>
        {q ? (
          <Link href="/bookings" className={`${secondaryButtonClass} flex items-center`}>
            Clear
          </Link>
        ) : null}
      </form>

      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(b) => b.id}
        meta={meta}
        basePath="/bookings"
        query={{ q: q || undefined }}
        emptyMessage={q ? 'No bookings match your search.' : 'No bookings yet.'}
      />
    </div>
  )
}
