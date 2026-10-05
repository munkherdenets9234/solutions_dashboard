'use client'

import { useState, useTransition } from 'react'
import { setGuideStatusAction } from '@/app/(dashboard)/guide-applications/actions'
import { guideLabel, guideValues } from '@/lib/guide-labels.mjs'
import { errorClass, labelClass } from './form'

export function GuideStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onChange(next: string) {
    if (next === status) return
    setError(null)
    startTransition(async () => {
      try {
        await setGuideStatusAction(id, next)
      } catch {
        setError('Could not update the status. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass} htmlFor="guide-status">
        Status
      </label>
      <div className="flex items-center gap-2">
        <select
          id="guide-status"
          value={status}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-md border border-input-border bg-panel px-2.5 text-sm disabled:opacity-60"
        >
          {guideValues('status').map((v) => (
            <option key={v} value={v}>
              {guideLabel('status', v)}
            </option>
          ))}
        </select>
        {pending ? <span className="text-xs text-muted">Saving…</span> : null}
      </div>
      {error ? <p className={errorClass}>{error}</p> : null}
    </div>
  )
}
