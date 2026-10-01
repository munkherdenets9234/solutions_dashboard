import Link from 'next/link'
import { listTranslationPages } from '@/lib/data/translations'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { requireToken } from '@/lib/auth/session'
import { safeLoad } from '@/lib/api/safe'
import type { TranslationPageSummary } from '@/lib/types'

function formatDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function TranslationsPage() {
  const token = await requireToken()
  const result = await safeLoad(() => listTranslationPages(token))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const pages = result.data

  const columns: Column<TranslationPageSummary>[] = [
    { header: 'Page', render: (p) => <span className="font-semibold">{p.page}</span> },
    { header: 'Entries', render: (p) => p.entries },
    { header: 'Last edited', render: (p) => formatDate(p.updated_at) },
    {
      header: '',
      align: 'right',
      render: (p) => (
        <Link href={`/translations/${encodeURIComponent(p.page)}`} className="text-xs font-semibold text-body hover:underline">
          Edit
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Translations</h1>
        <p className="text-[13px] text-body mt-1">The wording of the public site, per page, in English, Mongolian and Korean.</p>
      </div>
      {pages.length === 0 ? (
        <div className="border border-hairline rounded-[10px] bg-panel p-5 flex flex-col gap-2 max-w-2xl">
          <div className="font-bold text-[15px]">No wording imported yet</div>
          <p className="text-[13px] text-body">
            Until wording is imported the site shows its built-in wording. To import it, run this in the site repo:
          </p>
          <code className="text-[12.5px] bg-canvas border border-hairline rounded-md px-3 py-2 w-fit">
            node scripts/export-translations.mjs --push
          </code>
        </div>
      ) : (
        <DataTable columns={columns} rows={pages} getRowKey={(p) => p.page} emptyMessage="No pages." />
      )}
    </div>
  )
}
