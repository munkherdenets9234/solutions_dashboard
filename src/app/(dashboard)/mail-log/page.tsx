import Link from 'next/link'
import { requireToken } from '@/lib/auth/session'
import { listMailOutbox, type MailOutboxItem, type MailStatusFilter } from '@/lib/data/mail-outbox'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { RetryMailButton } from '@/components/admin/RetryMailButton'
import { formatDateTime } from '@/lib/format'
import { safeLoad } from '@/lib/api/safe'
import { MAIL_STATUS_FILTERS, mailErrorLabel, mailStatusLabel } from '@/lib/mail-log.mjs'

const PAGE_SIZE = 20
const MAX_PAGE = 10_000

type RawParams = Record<string, string | string[] | undefined>

function first(v: string | string[] | undefined): string | undefined {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' ? x : undefined
}

export default async function MailLogPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams
  const pageNum = Math.floor(Number(first(sp.page)))
  const page = Number.isFinite(pageNum) ? Math.min(MAX_PAGE, Math.max(1, pageNum)) : 1
  // Only the three known statuses reach the backend; anything else means "All".
  const statusP = first(sp.status)
  const status = MAIL_STATUS_FILTERS.some((f) => f.value && f.value === statusP) ? (statusP as MailStatusFilter) : undefined

  const token = await requireToken()
  const result = await safeLoad(() => listMailOutbox(token, page, PAGE_SIZE, status))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<MailOutboxItem>[] = [
    { header: 'Created', render: (m) => formatDateTime(m.created_at) },
    { header: 'Kind', render: (m) => m.kind },
    { header: 'To', render: (m) => <span className="break-all">{m.to}</span> },
    {
      header: 'Status',
      render: (m) => (
        <div>
          <span className="font-semibold">{mailStatusLabel(m.status)}</span>
          {m.status === 'sent' && m.sent_at ? <div className="text-[11px] text-muted">{formatDateTime(m.sent_at)}</div> : null}
        </div>
      ),
    },
    { header: 'Attempts', render: (m) => m.attempts },
    { header: 'Error', render: (m) => (m.last_error ? mailErrorLabel(m.last_error) : '—') },
    { header: '', render: (m) => (m.status === 'failed' ? <RetryMailButton id={m.id} /> : null) },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Mail log</h1>
        <p className="text-[13px] text-body mt-1">
          Request notification emails. Accepted means the mail service took the message; it does not confirm inbox delivery.
        </p>
      </div>

      <nav aria-label="Status" className="flex flex-wrap gap-2">
        {MAIL_STATUS_FILTERS.map((f) => {
          const active = (f.value || undefined) === status
          return (
            <Link
              key={f.label}
              href={f.value ? `/mail-log?status=${f.value}` : '/mail-log'}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                active ? 'border-transparent bg-body text-panel' : 'border-input-border text-body hover:bg-hairline-soft'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </nav>

      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(m) => m.id}
        meta={meta}
        basePath="/mail-log"
        query={{ status }}
        emptyMessage={status ? 'No mail matches this filter.' : 'No mail yet.'}
      />
    </div>
  )
}
