import { notFound } from 'next/navigation'
import { getBooking } from '@/lib/data/bookings'
import { buildDestinationNameMap } from '@/lib/data/destinations'
import { updateBookingStatusAction } from '../actions'
import { StatusActions } from '@/components/admin/StatusActions'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { shortId } from '@/lib/format'
import { ApiError } from '@/lib/api/client'

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let booking
  try {
    booking = (await getBooking(id)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const destinationNames = await buildDestinationNameMap(100)
  const tourName = destinationNames[booking.destination_id] ?? booking.destination_id

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Booking {shortId(booking.id)}</h1>
          <p className="text-[13px] text-body mt-1">{tourName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <StatusActions status={booking.status} action={updateBookingStatusAction.bind(null, booking.id)} />

      <div className="border border-hairline rounded-[10px] bg-panel p-5 grid grid-cols-2 gap-4">
        <Field label="Customer ID" value={booking.customer_id} mono />
        <Field label="Payment status" value={booking.payment_status || '—'} />
        <Field
          label="Travelers"
          value={`${booking.travelers.adults} adults, ${booking.travelers.children} children`}
        />
        <Field
          label="Travel dates"
          value={`${new Date(booking.travel_dates.start).toLocaleDateString()} – ${new Date(booking.travel_dates.end).toLocaleDateString()}`}
        />
        <Field label="Total price" value={`$${booking.total_price_usd.toLocaleString()}`} />
        {booking.notes ? <Field label="Notes" value={booking.notes} full /> : null}
      </div>

      <p className="text-xs text-muted">
        The API doesn&apos;t expose the customer&apos;s name or email on this record — only the id above.
      </p>
    </div>
  )
}

function Field({ label, value, full, mono }: { label: string; value: string; full?: boolean; mono?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
