import Link from 'next/link'
import { listPartners } from '@/lib/data/partners'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { buttonClass } from '@/components/admin/form'
import { safeLoad } from '@/lib/api/safe'
import type { Partner } from '@/lib/types'

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => listPartners(page, 10))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<Partner>[] = [
    { header: 'Name', render: (p) => <span className="font-semibold">{p.name}</span> },
    { header: 'Tag', render: (p) => p.tag ?? '—' },
    { header: 'Title', render: (p) => p.title ?? '—' },
    { header: 'Products', render: (p) => p.products?.length ?? 0 },
    {
      header: '',
      align: 'right',
      render: (p) => (
        <Link href={`/partners/${p.slug}/edit`} className="text-xs font-semibold text-body hover:underline">
          Edit
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Partners</h1>
          <p className="text-[13px] text-body mt-1">
            Partner businesses shown on the public site. Deleting a partner deactivates it rather than removing the
            record.
          </p>
        </div>
        <Link href="/partners/new" className={buttonClass}>
          + New partner
        </Link>
      </div>
      <DataTable columns={columns} rows={data} getRowKey={(p) => p.id} meta={meta} basePath="/partners" emptyMessage="No partners yet." />
    </div>
  )
}
