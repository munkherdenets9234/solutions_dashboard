import Link from 'next/link'
import { requireToken } from '@/lib/auth/session'
import { listGuideApplications, guideCounts } from '@/lib/data/guide-applications'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { safeLoad } from '@/lib/api/safe'
import { guideLabel, guideValues } from '@/lib/guide-labels.mjs'
import type { GuideApplication, GuideLanguage } from '@/lib/types'

const PAGE_SIZE = 20
const MAX_Q = 100

type Params = { page?: string; status?: string; q?: string; language?: string; region?: string }

function languageSummary(languages: GuideLanguage[]): string {
  return languages
    .map((l) => {
      const name = l.language === 'other' && l.other_name ? l.other_name : guideLabel('language', l.language)
      return l.level && l.level !== 'native' ? `${name} (${guideLabel('level', l.level)})` : name
    })
    .join(', ')
}

const selectClass = 'h-9 rounded-md border border-input-border bg-panel px-2.5 text-[12.5px] text-body'

export default async function GuideApplicationsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1)

  // Only validated values reach the backend; empty or unknown values are dropped.
  const statuses = guideValues('status')
  const status = sp.status && statuses.includes(sp.status) ? sp.status : undefined
  const language = sp.language && guideValues('language').includes(sp.language) ? sp.language : undefined
  const region = sp.region && guideValues('region').includes(sp.region) ? sp.region : undefined
  const q = sp.q?.trim().slice(0, MAX_Q) || undefined
  const filtered = Boolean(status || language || region || q)

  const token = await requireToken()
  const result = await safeLoad(() =>
    Promise.all([
      listGuideApplications(token, { page, limit: PAGE_SIZE, status, q, language, region }),
      guideCounts(token),
    ])
  )
  if (!result.ok) return <ErrorNotice message={result.message} />
  const [{ data, meta }, counts] = result.data

  const tabHref = (s?: string) => {
    const params = new URLSearchParams()
    if (s) params.set('status', s)
    if (q) params.set('q', q)
    if (language) params.set('language', language)
    if (region) params.set('region', region)
    const qs = params.toString()
    return qs ? `/guide-applications?${qs}` : '/guide-applications'
  }
  const totalAll = statuses.reduce((sum, s) => sum + (counts[s as keyof typeof counts] ?? 0), 0)
  const tabs = [
    { key: undefined as string | undefined, label: 'All', count: totalAll },
    ...statuses.map((s) => ({ key: s as string | undefined, label: guideLabel('status', s), count: counts[s as keyof typeof counts] ?? 0 })),
  ]

  const columns: Column<GuideApplication>[] = [
    {
      header: 'Name',
      render: (a) => (
        <div>
          <div className="font-semibold">{a.personal.full_name}</div>
          {a.personal.nickname ? <div className="text-muted text-[11px]">{a.personal.nickname}</div> : null}
        </div>
      ),
    },
    { header: 'Phone', render: (a) => a.personal.phone },
    { header: 'Languages', render: (a) => languageSummary(a.languages ?? []) },
    { header: 'Regions', render: (a) => (a.regions ?? []).map((r) => guideLabel('region', r)).join(', ') },
    { header: 'Created', render: (a) => (a.created_at ? new Date(a.created_at).toLocaleDateString('en-US') : '—') },
    { header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Guide Applications</h1>
        <p className="text-[13px] text-body mt-1">{meta?.total ?? data.length} matching applications.</p>
      </div>

      <nav aria-label="Status" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === status
          return (
            <Link
              key={t.label}
              href={tabHref(t.key)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                active ? 'border-transparent bg-body text-panel' : 'border-input-border text-body hover:bg-hairline-soft'
              }`}
            >
              {t.label} ({t.count})
            </Link>
          )
        })}
      </nav>

      <form method="GET" action="/guide-applications" className="flex flex-wrap items-center gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          maxLength={MAX_Q}
          placeholder="Search name, phone, email"
          aria-label="Search"
          className={`${selectClass} w-64`}
        />
        <select name="language" defaultValue={language ?? ''} aria-label="Language" className={selectClass}>
          <option value="">All languages</option>
          {guideValues('language').map((v) => (
            <option key={v} value={v}>
              {guideLabel('language', v)}
            </option>
          ))}
        </select>
        <select name="region" defaultValue={region ?? ''} aria-label="Region" className={selectClass}>
          <option value="">All regions</option>
          {guideValues('region').map((v) => (
            <option key={v} value={v}>
              {guideLabel('region', v)}
            </option>
          ))}
        </select>
        <button type="submit" className="h-9 rounded-md bg-body px-3 text-[12.5px] font-semibold text-panel">
          Filter
        </button>
        {filtered ? (
          <Link href="/guide-applications" className="text-[12.5px] text-muted underline">
            Clear
          </Link>
        ) : null}
      </form>

      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(a) => a.id}
        getRowHref={(a) => `/guide-applications/${encodeURIComponent(a.id)}`}
        meta={meta}
        basePath="/guide-applications"
        query={{ status, q, language, region }}
        emptyMessage={filtered ? 'No applications match these filters.' : 'No applications yet.'}
      />
    </div>
  )
}
