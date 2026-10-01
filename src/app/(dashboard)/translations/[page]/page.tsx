import Link from 'next/link'
import { getTranslationPage } from '@/lib/data/translations'
import { saveTranslationsAction } from '../actions'
import { TranslationsEditor } from '@/components/admin/TranslationsEditor'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { requireToken } from '@/lib/auth/session'
import { safeLoad } from '@/lib/api/safe'

export default async function TranslationsPageEditor({ params }: { params: Promise<{ page: string }> }) {
  const { page: rawPage } = await params
  let page = rawPage
  try {
    page = decodeURIComponent(rawPage)
  } catch {
    // keep the raw segment; the API will answer for it
  }
  const token = await requireToken()
  const result = await safeLoad(() => getTranslationPage(page, token))
  if (!result.ok) return <ErrorNotice message={result.message} />
  const { entries } = result.data

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/translations" className="text-xs font-semibold text-body hover:underline">
          ← All pages
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight mt-1">{page}</h1>
        <p className="text-[13px] text-body mt-1">
          Leave a language empty to fall back to the site&apos;s built-in wording for it.
        </p>
      </div>
      {entries.length === 0 ? (
        <div className="border border-hairline rounded-[10px] bg-panel p-5 text-[13px] text-body">
          Nothing has been imported for this page. Run <code>node scripts/export-translations.mjs --push</code> in the
          site repo to import it.
        </div>
      ) : (
        <TranslationsEditor action={saveTranslationsAction.bind(null, page)} initialEntries={entries} />
      )}
    </div>
  )
}
