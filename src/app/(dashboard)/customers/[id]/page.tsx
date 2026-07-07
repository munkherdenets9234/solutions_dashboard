import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCustomer } from '@/lib/data/customers'
import { buildDestinationNameMap } from '@/lib/data/destinations'
import { buildCarNameMap } from '@/lib/data/cars'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { shortId } from '@/lib/format'
import { ApiError } from '@/lib/api/client'
import type { Booking, Rental, AirportTransfer } from '@/lib/types'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let customer
  try {
    customer = (await getCustomer(id)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    if (err instanceof ApiError && err.status === 403) {
      return (
        <div className="flex flex-col gap-5">
          <h1 className="text-[26px] font-extrabold tracking-tight">Customer</h1>
          <p className="text-[13px] text-body mt-1">Only tenant admins can view customer records.</p>
        </div>
      )
    }
    throw err
  }

  // The API omits these fields entirely (rather than sending `[]`) when a
  // customer has no related records, so guard against undefined here.
  const bookings = customer.bookings ?? []
  const rentals = customer.rentals ?? []
  const airportTransfers = customer.airport_transfers ?? []

  const [destinationNames, carNames] = await Promise.all([buildDestinationNameMap(100), buildCarNameMap(100)])

  const bookingColumns: Column<Booking>[] = [
    {
      header: 'Booking',
      render: (b) => (
        <Link href={`/bookings/${b.id}`} className="font-mono text-xs font-semibold hover:underline">
          {shortId(b.id)}
        </Link>
      ),
    },
    { header: 'Tour', render: (b) => destinationNames[b.destination_id] ?? b.destination_id },
    { header: 'Date', render: (b) => new Date(b.travel_dates.start).toLocaleDateString() },
    { header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { header: 'Amount', align: 'right', render: (b) => `$${b.total_price_usd.toLocaleString()}` },
  ]

  const rentalColumns: Column<Rental>[] = [
    {
      header: 'Rental',
      render: (r) => (
        <Link href={`/rentals/${r.id}`} className="font-mono text-xs font-semibold hover:underline">
          {shortId(r.id)}
        </Link>
      ),
    },
    { header: 'Car', render: (r) => carNames[r.car_id] ?? r.car_id },
    { header: 'Mode', render: (r) => <span className="capitalize">{r.mode.replace('_', ' ')}</span> },
    { header: 'Pickup', render: (r) => new Date(r.pickup_date).toLocaleDateString() },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  const transferColumns: Column<AirportTransfer>[] = [
    {
      header: 'Transfer',
      render: (t) => (
        <Link href={`/airport-transfers/${t.id}`} className="font-mono text-xs font-semibold hover:underline">
          {shortId(t.id)}
        </Link>
      ),
    },
    { header: 'Tier', render: (t) => <span className="capitalize">{t.tier}</span> },
    { header: 'Flight', render: (t) => t.flight_number || '—' },
    { header: 'Arrival', align: 'right', render: (t) => new Date(t.arrival_at).toLocaleString() },
    { header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">{customer.name}</h1>
        <p className="text-[13px] text-body mt-1">{customer.email}</p>
      </div>

      <Section title="Contact">
        <Field label="Email" value={customer.email} />
        <Field label="Phone" value={customer.phone || '—'} />
        {customer.nationality ? <Field label="Nationality" value={customer.nationality} /> : null}
        {customer.created_at ? (
          <Field label="Customer since" value={new Date(customer.created_at).toLocaleDateString()} />
        ) : null}
        {customer.notes ? <Field label="Notes" value={customer.notes} full /> : null}
      </Section>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">
          Bookings ({bookings.length})
        </h2>
        <DataTable columns={bookingColumns} rows={bookings} getRowKey={(b) => b.id} emptyMessage="No bookings." />
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">
          Rentals ({rentals.length})
        </h2>
        <DataTable columns={rentalColumns} rows={rentals} getRowKey={(r) => r.id} emptyMessage="No rentals." />
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">
          Airport Transfers ({airportTransfers.length})
        </h2>
        <DataTable
          columns={transferColumns}
          rows={airportTransfers}
          getRowKey={(t) => t.id}
          emptyMessage="No airport transfers."
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline rounded-[10px] bg-panel p-5">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  )
}
