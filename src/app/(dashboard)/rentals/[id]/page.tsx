import { notFound } from 'next/navigation'
import { getRental } from '@/lib/data/rentals'
import { buildCarNameMap } from '@/lib/data/cars'
import { updateRentalStatusAction } from '../actions'
import { StatusActions } from '@/components/admin/StatusActions'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { shortId } from '@/lib/format'
import { ApiError } from '@/lib/api/client'

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let rental
  try {
    rental = (await getRental(id)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const carNames = await buildCarNameMap(100)

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Rental {shortId(rental.id)}</h1>
          <p className="text-[13px] text-body mt-1">{carNames[rental.car_id] ?? rental.car_id}</p>
        </div>
        <StatusBadge status={rental.status} />
      </div>

      <StatusActions status={rental.status} action={updateRentalStatusAction.bind(null, rental.id)} />

      <div className="border border-hairline rounded-[10px] bg-panel p-5 grid grid-cols-2 gap-4">
        <Field label="Customer ID" value={rental.customer_id} mono />
        <Field label="Mode" value={capitalizeWords(rental.mode.replace('_', ' '))} />
        <Field label="Pickup" value={new Date(rental.pickup_date).toLocaleString()} />
        <Field label="Return" value={new Date(rental.return_date).toLocaleString()} />
        {rental.confirmation_id ? <Field label="Confirmation ID" value={rental.confirmation_id} mono /> : null}
        {rental.notes ? <Field label="Notes" value={rental.notes} full /> : null}
      </div>

      <p className="text-xs text-muted">
        The API doesn&apos;t expose the customer&apos;s name or email on this record — only the id above.
      </p>
    </div>
  )
}

function capitalizeWords(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase())
}

function Field({ label, value, full, mono }: { label: string; value: string; full?: boolean; mono?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
