import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBooking } from '@/lib/data/bookings'
import { buildDestinationMap } from '@/lib/data/destinations'
import { tryGetCustomer } from '@/lib/data/customers'
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

  const [destinations, customer] = await Promise.all([
    buildDestinationMap(100),
    tryGetCustomer(booking.customer_id),
  ])
  const destination = destinations[booking.destination_id]
  const tourName = destination?.name ?? booking.destination_id

  const start = new Date(booking.travel_dates.start)
  const end = new Date(booking.travel_dates.end)
  const tripNights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const totalTravelers = booking.travelers.adults + booking.travelers.children

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

      <Section title="Customer">
        {customer ? (
          <>
            <Field
              label="Name"
              value={
                <Link href={`/customers/${customer.id}`} className="font-semibold hover:underline">
                  {customer.name}
                </Link>
              }
            />
            <Field label="Email" value={customer.email} />
            <Field label="Phone" value={customer.phone || '—'} />
          </>
        ) : (
          <Field label="Customer ID" value={booking.customer_id} mono full />
        )}
      </Section>

      <Section title="Trip">
        <Field label="Tour" value={tourName} />
        {destination?.region ? <Field label="Region" value={destination.region} /> : null}
        <Field
          label="Travel dates"
          value={`${start.toLocaleDateString()} – ${end.toLocaleDateString()}`}
        />
        <Field label="Duration" value={`${tripNights} night${tripNights === 1 ? '' : 's'}`} />
        <Field
          label="Travelers"
          value={`${totalTravelers} total (${booking.travelers.adults} adults, ${booking.travelers.children} children)`}
        />
        {destination?.best_seasons?.length ? (
          <Field label="Best seasons" value={destination.best_seasons.join(', ')} />
        ) : null}
      </Section>

      <Section title="Booking">
        <Field label="Booking ID" value={booking.id} mono />
        {booking.created_at ? <Field label="Booked on" value={new Date(booking.created_at).toLocaleString()} /> : null}
        <Field label="Status" value={<StatusBadge status={booking.status} />} />
        <Field label="Payment status" value={booking.payment_status || '—'} />
        <Field label="Total price" value={`$${booking.total_price_usd.toLocaleString()}`} />
        <Field
          label="Price per traveler"
          value={totalTravelers > 0 ? `$${Math.round(booking.total_price_usd / totalTravelers).toLocaleString()}` : '—'}
        />
        {booking.notes ? <Field label="Notes" value={booking.notes} full /> : null}
      </Section>

      {!customer ? (
        <p className="text-xs text-muted">Customer details are unavailable — showing the raw id instead.</p>
      ) : null}
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

function Field({ label, value, full, mono }: { label: string; value: React.ReactNode; full?: boolean; mono?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
