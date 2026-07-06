import { listContactMessages } from '@/lib/data/contact-messages'
import { updateContactMessageStatusAction } from './actions'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusActions } from '@/components/admin/StatusActions'
import type { ContactMessage } from '@/lib/types'

const CONTACT_FLOW: Record<string, string[]> = {
  new: ['read'],
  read: ['responded'],
  responded: [],
}

export default async function ContactMessagesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { data, meta } = await listContactMessages(page, 10)

  const columns: Column<ContactMessage>[] = [
    {
      header: 'From',
      render: (m) => (
        <div>
          <div className="font-semibold">{m.name}</div>
          <div className="text-muted text-[11px]">{m.email}</div>
        </div>
      ),
    },
    { header: 'Subject', render: (m) => m.subject },
    { header: 'Message', render: (m) => <span className="line-clamp-2 text-body">{m.message}</span> },
    { header: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    {
      header: '',
      align: 'right',
      render: (m) => (
        <StatusActions status={m.status} action={updateContactMessageStatusAction.bind(null, m.id)} flow={CONTACT_FLOW} />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Contact Messages</h1>
        <p className="text-[13px] text-body mt-1">{meta?.total ?? data.length} messages total.</p>
      </div>
      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(m) => m.id}
        meta={meta}
        basePath="/contact-messages"
        emptyMessage="No contact messages yet."
      />
    </div>
  )
}
