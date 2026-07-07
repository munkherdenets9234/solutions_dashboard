import Link from 'next/link'
import { listAirportTransfers } from '@/lib/data/airport-transfers'
import { buildCustomerNameMap } from '@/lib/data/customers'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { safeLoad } from '@/lib/api/safe'
import { shortId } from '@/lib/format'
import type { AirportTransfer } from '@/lib/types'

export default async function AirportTransfersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => Promise.all([listAirportTransfers(page, 10), buildCustomerNameMap(100)]))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const [{ data, meta }, customerNames] = result.data

  const columns: Column<AirportTransfer>[] = [
    {
      header: 'Customer',
      render: (t) => (
        <Link href={`/airport-transfers/${t.id}`} className="font-semibold hover:underline">
          {customerNames[t.customer_id] ?? shortId(t.customer_id)}
        </Link>
      ),
    },
    { header: 'Tier', render: (t) => <span className="capitalize">{t.tier}</span> },
    { header: 'Flight', render: (t) => t.flight_number || '—' },
    { header: 'Arrival', render: (t) => new Date(t.arrival_at).toLocaleString() },
    { header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Airport Transfers</h1>
        <p className="text-[13px] text-body mt-1">{meta?.total ?? data.length} transfers total.</p>
      </div>
      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(t) => t.id}
        meta={meta}
        basePath="/airport-transfers"
        emptyMessage="No airport transfers yet."
      />
    </div>
  )
}
