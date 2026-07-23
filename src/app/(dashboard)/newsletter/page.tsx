import { listNewsletterSubscribers } from '@/lib/data/newsletter'
import { deleteNewsletterSubscriberAction } from './actions'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { DeleteRowButton } from '@/components/admin/DeleteRowButton'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { safeLoad } from '@/lib/api/safe'
import type { NewsletterSubscriber } from '@/lib/types'

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => listNewsletterSubscribers(page, 20))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<NewsletterSubscriber>[] = [
    { header: 'Email', render: (s) => s.email },
    { header: 'Subscribed on', render: (s) => (s.created_at ? new Date(s.created_at).toLocaleDateString() : '—') },
    {
      header: '',
      align: 'right',
      render: (s) => (
        <DeleteRowButton
          action={deleteNewsletterSubscriberAction.bind(null, s.id)}
          confirmMessage={`Remove ${s.email} from the newsletter list?`}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Newsletter</h1>
        <p className="text-[13px] text-body mt-1">{meta?.total ?? data.length} subscribers total.</p>
      </div>
      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(s) => s.id}
        meta={meta}
        basePath="/newsletter"
        emptyMessage="No newsletter subscribers yet."
      />
    </div>
  )
}
