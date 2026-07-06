import { notFound } from 'next/navigation'
import { getAirportTransfer } from '@/lib/data/airport-transfers'
import { updateTransferStatusAction } from '../actions'
import { StatusActions } from '@/components/admin/StatusActions'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { shortId } from '@/lib/format'
import { ApiError } from '@/lib/api/client'

export default async function AirportTransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let transfer
  try {
    transfer = (await getAirportTransfer(id)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Transfer {shortId(transfer.id)}</h1>
          <p className="text-[13px] text-body mt-1 capitalize">{transfer.tier} transfer</p>
        </div>
        <StatusBadge status={transfer.status} />
      </div>

      <StatusActions status={transfer.status} action={updateTransferStatusAction.bind(null, transfer.id)} />

      <div className="border border-hairline rounded-[10px] bg-panel p-5 grid grid-cols-2 gap-4">
        <Field label="Customer ID" value={transfer.customer_id} mono />
        <Field label="Flight number" value={transfer.flight_number || '—'} />
        <Field label="Passengers" value={String(transfer.passengers)} />
        <Field label="Arrival" value={new Date(transfer.arrival_at).toLocaleString()} />
        {transfer.confirmation_id ? <Field label="Confirmation ID" value={transfer.confirmation_id} mono /> : null}
        {transfer.notes ? <Field label="Notes" value={transfer.notes} full /> : null}
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
