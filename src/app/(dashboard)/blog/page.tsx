import Link from 'next/link'
import { listPublishedBlogs } from '@/lib/data/blogs'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { buttonClass } from '@/components/admin/form'
import { safeLoad } from '@/lib/api/safe'
import { localeText, type Blog } from '@/lib/types'

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await safeLoad(() => listPublishedBlogs(page, 10))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { data, meta } = result.data

  const columns: Column<Blog>[] = [
    { header: 'Title', render: (b) => <span className="font-semibold">{localeText(b.title)}</span> },
    { header: 'Category', render: (b) => b.category ?? '—' },
    { header: 'Date', render: (b) => b.date ?? '—' },
    { header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    {
      header: '',
      align: 'right',
      render: (b) => (
        <Link href={`/blog/${b.id}/edit`} className="text-xs font-semibold text-body hover:underline">
          Edit
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Blog</h1>
          <p className="text-[13px] text-body mt-1">
            Only published posts are listed here — the API has no admin view of drafts. A newly created post opens
            straight into its edit page so you can publish it right away.
          </p>
        </div>
        <Link href="/blog/new" className={buttonClass}>
          + New post
        </Link>
      </div>
      <DataTable columns={columns} rows={data} getRowKey={(b) => b.id} meta={meta} basePath="/blog" emptyMessage="No published posts yet." />
    </div>
  )
}
