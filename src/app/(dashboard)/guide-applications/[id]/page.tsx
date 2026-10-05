import { notFound } from 'next/navigation'
import { requireToken } from '@/lib/auth/session'
import { getGuideApplication } from '@/lib/data/guide-applications'
import { safeLoad } from '@/lib/api/safe'
import { ApiError } from '@/lib/api/client'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { GuideStatusSelect } from '@/components/admin/GuideStatusSelect'
import { GuideNoteForm } from '@/components/admin/GuideNoteForm'
import { GuideFileLink } from '@/components/admin/GuideFileLink'
import { formatDate, formatDateTime } from '@/lib/format'
import { guideLabel, monthName } from '@/lib/guide-labels.mjs'
import { guideConfirmationId, isGuideId } from '@/lib/guide-ids.mjs'

function fileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const yesNo = (b: boolean | undefined) => (b ? 'Yes' : 'No')
const dash = (s: string | number | undefined | null) => (s === undefined || s === null || s === '' ? '—' : s)

export default async function GuideApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isGuideId(id)) notFound()

  const token = await requireToken()
  const result = await safeLoad(async () => {
    try {
      return await getGuideApplication(token, id)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  })
  if (!result.ok) return <ErrorNotice message={result.message} />
  const app = result.data
  if (!app) notFound()

  const p = app.personal
  const languages = app.languages ?? []
  const regions = app.regions ?? []
  const references = app.references ?? []
  const files = app.files ?? []
  // Newest first; ties (and unparseable times) fall back to append order, latest first.
  const ts = (at: string) => Date.parse(at) || 0
  const events = (app.events ?? [])
    .map((e, i) => ({ e, i }))
    .sort((x, y) => ts(y.e.at) - ts(x.e.at) || y.i - x.i)
    .map(({ e }) => e)
  const ex = app.experience
  const dr = app.driving
  const av = app.availability
  const tourTypes = ex?.tour_types ?? []
  const months = av?.months ?? []
  const tripLengths = av?.trip_lengths ?? []

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">{p.full_name}</h1>
          {p.nickname ? <p className="text-[13px] text-muted">{p.nickname}</p> : null}
          <p className="text-[13px] text-body mt-1">
            {guideConfirmationId(app.id)} · Applied {formatDate(app.created_at)}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <Section title="Status">
        <div className="col-span-2">
          <GuideStatusSelect id={app.id} status={app.status} />
        </div>
      </Section>

      <Section title="Personal">
        <Field label="Full name" value={p.full_name} />
        <Field label="Nickname" value={dash(p.nickname)} />
        <Field label="Birth date" value={p.birth_date ? formatDate(p.birth_date) : '—'} />
        <Field label="Gender" value={p.gender ? guideLabel('gender', p.gender) : '—'} />
        <Field label="Phone" value={dash(p.phone)} />
        <Field label="Email" value={dash(p.email)} />
        <Field label="Address" value={dash(p.address)} full />
        <Field label="Emergency contact" value={dash(p.emergency_contact?.name)} />
        <Field label="Emergency phone" value={dash(p.emergency_contact?.phone)} />
      </Section>

      <Section title="Languages">
        {languages.length === 0 ? (
          <Field label="Languages" value="—" full />
        ) : (
          languages.map((l, i) => (
            <Field
              key={i}
              label={l.language === 'other' && l.other_name ? l.other_name : guideLabel('language', l.language)}
              value={guideLabel('level', l.level)}
            />
          ))
        )}
      </Section>

      <Section title="Experience">
        <Field label="Years" value={dash(ex?.years)} />
        <Field label="Largest group" value={dash(ex?.largest_group)} />
        <Field
          label="Tour types"
          value={tourTypes.length ? tourTypes.map((t) => guideLabel('tourType', t)).join(', ') : '—'}
          full
        />
        <Field label="Previous companies" value={dash(ex?.previous_companies)} full pre />
        <Field label="Main directions" value={dash(ex?.main_directions)} full pre />
      </Section>

      <Section title="Mongolia regions">
        <Field
          label="Regions"
          value={regions.length ? regions.map((r) => guideLabel('region', r)).join(', ') : '—'}
          full
        />
        {app.regions_other ? <Field label="Other regions" value={app.regions_other} full pre /> : null}
      </Section>

      <Section title="Driving">
        <Field label="Has license" value={yesNo(dr?.has_license)} />
        <Field label="License class" value={dash(dr?.license_class)} />
        <Field label="Years driving" value={dash(dr?.years_driving)} />
        <Field label="Can drive 4x4" value={yesNo(dr?.can_drive_4x4)} />
        <Field label="Long distance" value={yesNo(dr?.long_distance)} />
        <Field label="Own vehicle" value={yesNo(dr?.has_own_vehicle)} />
        <Field label="Vehicles" value={dash(dr?.vehicles)} full pre />
      </Section>

      <Section title="Availability">
        <Field label="Months" value={months.length ? months.map(monthName).join(', ') : '—'} full />
        <Field label="Days" value={dash(av?.days)} full pre />
        <Field
          label="Trip lengths"
          value={tripLengths.length ? tripLengths.map((t) => guideLabel('tripLength', t)).join(', ') : '—'}
        />
        <Field label="Full season" value={yesNo(av?.full_season)} />
        <Field label="Already booked trips" value={dash(av?.booked_trips)} full pre />
      </Section>

      <Section title="References">
        {references.length === 0 ? (
          <Field label="References" value="—" full />
        ) : (
          references.map((r, i) => (
            <Field key={i} label={r.name} value={[r.position, r.contact].filter(Boolean).join(' · ') || '—'} full />
          ))
        )}
      </Section>

      <Section title="Documents">
        {files.length === 0 ? (
          <Field label="Documents" value="—" full />
        ) : (
          <div className="col-span-2 flex flex-col gap-2">
            {files.map((f) => (
              <GuideFileLink
                key={f.id}
                id={app.id}
                fileId={f.id}
                label={guideLabel('fileKind', f.kind)}
                name={f.original_name}
                size={fileSize(f.size)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Notes and history">
        <div className="col-span-2 flex flex-col gap-5">
          <GuideNoteForm id={app.id} />
          {events.length === 0 ? (
            <p className="text-sm text-muted">No activity yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {events.map((e, i) => (
                <li key={i} className="border-l-2 border-hairline pl-3">
                  <div className="text-[11px] text-muted">
                    {formatDateTime(e.at)} · {e.user_name || '—'}
                  </div>
                  {e.type === 'status' ? (
                    <div className="text-sm">
                      Status: {guideLabel('status', e.from ?? '')} → {guideLabel('status', e.to ?? '')}
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap break-words">{e.text}</div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline rounded-[10px] bg-panel p-5">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({ label, value, full, pre }: { label: string; value: React.ReactNode; full?: boolean; pre?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</div>
      <div className={`text-sm mt-0.5 break-words ${pre ? 'whitespace-pre-wrap' : ''}`}>{value}</div>
    </div>
  )
}
